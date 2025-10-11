// Global auth error handler
export const handleAuthError = (error, router, queryClient) => {
  // Check if it's an auth error
  if (error?.status === 401 || error?.status === 403) {
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
    
    // Clear React Query cache
    if (queryClient) {
      queryClient.clear();
    }
    
    // Redirect to login
    if (router) {
      router.push('/login');
    }
    
    return true;
  }
  return false;
};

// Enhanced fetch wrapper with auth error handling
export const createAuthenticatedFetch = (router, queryClient) => {
  return async (url, options = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };
    
    try {
      const response = await fetch(url, config);
      
      // Handle auth errors
      if (response.status === 401 || response.status === 403) {
        const error = new Error('Authentication failed');
        error.status = response.status;
        handleAuthError(error, router, queryClient);
        throw error;
      }
      
      return response;
    } catch (error) {
      // Re-throw auth errors after handling
      if (error.status === 401 || error.status === 403) {
        throw error;
      }
      throw error;
    }
  };
};


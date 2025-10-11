// Auth API functions using fetch - Updated to use Express backend
const API_BASE_URL = 'https://myhealthlink.onrender.com/api';

export const authAPI = {
  // Register user
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Registration failed');
    }
    
    return result.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for refresh token
      body: JSON.stringify(credentials),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Login failed');
    }
    
    return result.data;
  },

  // Verify OTP
  verifyOTP: async (otpData) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for refresh token
      body: JSON.stringify(otpData),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'OTP verification failed');
    }
    
    return result.data;
  },

  // Resend OTP
  resendOTP: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to resend OTP');
    }
    
    return result;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to send reset email');
    }
    
    return result;
  },

  // Reset password
  resetPassword: async (token, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to reset password');
    }
    
    return result;
  },

  // Logout
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Include cookies to clear refresh token
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Logout failed');
    }
    
    return result;
  },

  // Get current user
  getUser: async (token) => {
    const response = await fetch(`${API_BASE_URL}/user/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to get user data');
    }
    
    return result.data;
  },

  // Profile management
  profile: {
    // Get profile
    get: async (token) => {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to get profile');
      }
      
      return result.data;
    },

    // Update profile
    update: async (token, profileData) => {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update profile');
      }
      
      return result.data;
    },

    // Upload profile picture
    uploadPicture: async (token, file) => {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await fetch(`${API_BASE_URL}/profile/upload-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to upload profile picture');
      }
      
      return result.data;
    },
  },
};
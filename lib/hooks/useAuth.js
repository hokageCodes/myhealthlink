import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { authAPI } from '@/lib/api/auth';

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

// Custom hook for authentication state
export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user is authenticated with valid token
  const isAuthenticated = useCallback(() => {
    if (typeof window !== 'undefined' && mounted) {
      const token = localStorage.getItem('accessToken');
      return !!token && !isTokenExpired(token);
    }
    return false;
  }, [mounted]);

  // Get stored token
  const getToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      // Return null if token is expired
      if (token && isTokenExpired(token)) {
        removeToken();
        return null;
      }
      return token;
    }
    return null;
  }, []);

  // Set token
  const setToken = useCallback((token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }, []);

  // Remove token
  const removeToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    removeToken();
    queryClient.clear();
    router.push('/login');
  }, [removeToken, queryClient, router]);

  // Handle auth errors
  const handleAuthError = useCallback(() => {
    removeToken();
    queryClient.clear();
    toast.error('Session expired. Please log in again.', {
      position: "top-right",
      autoClose: 3000,
    });
    router.push('/login');
  }, [removeToken, queryClient, router]);

  return {
    isAuthenticated: mounted ? isAuthenticated() : false,
    getToken,
    setToken,
    removeToken,
    logout,
    handleAuthError,
  };
};

// Register mutation
export const useRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: authAPI.register,
    onSuccess: (data) => {
      toast.success('Account created successfully! Please check your email for verification.', {
        position: "top-right",
        autoClose: 5000,
      });
      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    },
    onError: (error) => {
      toast.error(error.message || 'Registration failed', {
        position: "top-right",
        autoClose: 5000,
      });
    },
  });
};

// Login mutation
export const useLogin = () => {
  const router = useRouter();
  const { setToken } = useAuth();

  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      if (data.accessToken) {
        setToken(data.accessToken);
      }
      toast.success('Welcome back!', {
        position: "top-right",
        autoClose: 3000,
      });
      router.push('/dashboard');
    },
    onError: (error) => {
      toast.error(error.message || 'Login failed', {
        position: "top-right",
        autoClose: 5000,
      });
    },
  });
};

// Verify OTP mutation
export const useVerifyOTP = () => {
  const router = useRouter();
  const { setToken } = useAuth();

  return useMutation({
    mutationFn: authAPI.verifyOTP,
    onSuccess: (data) => {
      if (data.accessToken) {
        setToken(data.accessToken);
      }
      toast.success('Email verified successfully! Welcome to MyHealthLink!', {
        position: "top-right",
        autoClose: 3000,
      });
      router.push('/dashboard');
    },
    onError: (error) => {
      toast.error(error.message || 'OTP verification failed', {
        position: "top-right",
        autoClose: 5000,
      });
    },
  });
};

// Resend OTP mutation
export const useResendOTP = () => {
  return useMutation({
    mutationFn: authAPI.resendOTP,
    onSuccess: () => {
      toast.success('Verification code sent successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to resend code', {
        position: "top-right",
        autoClose: 5000,
      });
    },
  });
};

// Forgot password mutation
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authAPI.forgotPassword,
    onSuccess: () => {
      toast.success('Password reset email sent! Check your inbox.', {
        position: "top-right",
        autoClose: 5000,
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send reset email', {
        position: "top-right",
        autoClose: 5000,
      });
    },
  });
};

// Reset password mutation
export const useResetPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: ({ token, password }) => authAPI.resetPassword(token, password),
    onSuccess: () => {
      toast.success('Password reset successfully! You can now log in.', {
        position: "top-right",
        autoClose: 3000,
      });
      router.push('/login');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reset password', {
        position: "top-right",
        autoClose: 5000,
      });
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const { logout } = useAuth();

  return useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      logout();
      toast.success('Logged out successfully', {
        position: "top-right",
        autoClose: 3000,
      });
    },
    onError: () => {
      // Even if API call fails, logout locally
      logout();
      toast.success('Logged out successfully', {
        position: "top-right",
        autoClose: 3000,
      });
    },
  });
};


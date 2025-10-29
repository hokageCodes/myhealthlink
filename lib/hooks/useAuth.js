'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api/auth';
import { handleAuthError as handleAuthErrorUtil } from '@/lib/utils/authErrorHandler';
import toast from 'react-hot-toast';

/**
 * Main authentication hook
 * Provides authentication state and utility functions
 */
export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    setMounted(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    setIsAuthenticated(!!token);
  }, []);

  // Get current token
  const getToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }, []);

  // Handle auth errors
  const handleAuthError = useCallback((error) => {
    if (error?.status === 401 || error?.status === 403) {
      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
      }
      
      // Clear React Query cache
      queryClient.clear();
      
      // Update auth state
      setIsAuthenticated(false);
      
      // Redirect to login
      router.push('/login');
      
      // Show error message
      toast.error('Session expired. Please login again.');
      
      return true;
    }
    return false;
  }, [router, queryClient]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
      }
      
      // Clear React Query cache
      queryClient.clear();
      
      // Update auth state
      setIsAuthenticated(false);
      
      // Redirect to login
      router.push('/login');
      
      toast.success('Logged out successfully');
    }
  }, [router, queryClient]);

  return {
    isAuthenticated,
    getToken,
    handleAuthError,
    logout,
    mounted,
  };
}

/**
 * Login mutation hook
 */
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials) => {
      const result = await authAPI.login(credentials);
      
      // Store token
      if (result.accessToken && typeof window !== 'undefined') {
        localStorage.setItem('accessToken', result.accessToken);
      }
      
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['userProfile']);
      
      // Redirect based on email verification status
      if (data.user && !data.user.isEmailVerified) {
        router.push('/verify-otp');
        toast.success('Please verify your email to continue');
      } else {
        router.push('/dashboard');
        toast.success('Welcome back!');
      }
    },
    onError: (error) => {
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      throw error;
    },
  });
}

/**
 * Register mutation hook
 */
export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (userData) => {
      const result = await authAPI.register(userData);
      return result;
    },
    onSuccess: (data) => {
      // After successful registration, redirect to OTP verification
      router.push('/verify-otp');
      toast.success('Account created! Please verify your email.');
    },
    onError: (error) => {
      const errorMessage = error.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      
      // Extract field-specific errors if available
      if (error.field) {
        throw { ...error, field: error.field };
      }
      
      throw error;
    },
  });
}

/**
 * Logout mutation hook
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await authAPI.logout();
      } catch (error) {
        console.error('Logout error:', error);
      }
    },
    onSuccess: () => {
      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
      }
      
      // Clear React Query cache
      queryClient.clear();
      
      // Redirect to login
      router.push('/login');
      
      toast.success('Logged out successfully');
    },
  });
}

/**
 * Verify OTP mutation hook
 */
export function useVerifyOTP() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (otpData) => {
      const result = await authAPI.verifyOTP(otpData);
      
      // Store token if provided
      if (result.accessToken && typeof window !== 'undefined') {
        localStorage.setItem('accessToken', result.accessToken);
      }
      
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['userProfile']);
      router.push('/dashboard');
      toast.success('Email verified successfully!');
    },
    onError: (error) => {
      const errorMessage = error.message || 'OTP verification failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    },
  });
}

/**
 * Resend OTP mutation hook
 */
export function useResendOTP() {
  return useMutation({
    mutationFn: async (email) => {
      const result = await authAPI.resendOTP(email);
      return result;
    },
    onSuccess: () => {
      toast.success('Verification code sent to your email!');
    },
    onError: (error) => {
      const errorMessage = error.message || 'Failed to resend verification code. Please try again.';
      toast.error(errorMessage);
      throw error;
    },
  });
}

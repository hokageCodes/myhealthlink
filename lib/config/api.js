// Central API configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://myhealthlink.onrender.com/api',
  FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
};

// Feature flags
export const FEATURE_FLAGS = {
  ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  PWA: process.env.NEXT_PUBLIC_ENABLE_PWA === 'true',
  DARK_MODE: process.env.NEXT_PUBLIC_ENABLE_DARK_MODE === 'true',
};

// Environment helpers
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// API endpoints
export const ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USER: {
    ME: '/user/me',
    PROFILE: '/profile',
    UPLOAD_PICTURE: '/profile/upload-picture',
  },
  DOCUMENTS: {
    LIST: '/documents',
    UPLOAD: '/documents/upload',
    DELETE: '/documents',
  },
  HEALTH: {
    METRICS: '/health/metrics',
    SUMMARY: '/health/summary',
    RECORDS: '/health/records',
  },
};

// Default headers
export const getDefaultHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// Request wrapper with error handling
export const apiRequest = async (url, options = {}) => {
  const config = {
    timeout: API_CONFIG.TIMEOUT,
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

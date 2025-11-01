const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const handleResponse = async (response) => {
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Something went wrong');
  }
  return result;
};

export const shareAPI = {
  // Get public profile (with optional token)
  getPublicProfile: async (username, token = null) => {
    const url = `${API_BASE_URL}/public/profile/${username}${token ? `?token=${token}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();
    return { response, result }; // Return both so caller can check status
  },

  // Verify share link password
  verifyPassword: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/public/profile/${username}/verify-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });
    const result = await response.json();
    return { response, result };
  },

  // Request OTP for share link
  requestOTP: async (username, email = null) => {
    const response = await fetch(`${API_BASE_URL}/public/profile/${username}/request-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    const result = await response.json();
    return { response, result };
  },

  // Verify share link OTP
  verifyOTP: async (username, otp) => {
    const response = await fetch(`${API_BASE_URL}/public/profile/${username}/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ otp }),
    });
    const result = await response.json();
    return { response, result };
  },
};


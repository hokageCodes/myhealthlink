const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const handleResponse = async (response) => {
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Something went wrong');
  }
  return result;
};

export const emergencyAPI = {
  // Trigger SOS
  triggerSOS: async (token, data = {}) => {
    const response = await fetch(`${API_BASE_URL}/emergency/sos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return handleResponse(response);
  },

  // Get emergency events
  getEvents: async (token, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.limit) queryParams.append('limit', params.limit);

    const response = await fetch(`${API_BASE_URL}/emergency/events?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  // Resolve emergency event
  resolveEvent: async (token, eventId, notes = '') => {
    const response = await fetch(`${API_BASE_URL}/emergency/events/${eventId}/resolve`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes }),
    });

    return handleResponse(response);
  },

  // Get emergency profile (public, requires token)
  getEmergencyProfile: async (username, token) => {
    const response = await fetch(`${API_BASE_URL}/public/emergency/${username}?token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },
};


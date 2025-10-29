const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const appointmentsAPI = {
  // Get all appointments
  getAppointments: async (token, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.type) queryParams.append('type', params.type);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.page) queryParams.append('page', params.page);

    const response = await fetch(`${API_BASE_URL}/appointments?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch appointments');
    }

    return response.json();
  },

  // Get single appointment
  getAppointment: async (token, id) => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch appointment');
    }

    return response.json();
  },

  // Create appointment
  createAppointment: async (token, appointmentData) => {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create appointment');
    }

    return response.json();
  },

  // Update appointment
  updateAppointment: async (token, id, appointmentData) => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update appointment');
    }

    return response.json();
  },

  // Delete appointment
  deleteAppointment: async (token, id) => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete appointment');
    }

    return response.json();
  },

  // Get upcoming appointments
  getUpcomingAppointments: async (token, limit = 5) => {
    const response = await fetch(`${API_BASE_URL}/appointments/upcoming?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch upcoming appointments');
    }

    return response.json();
  },
};


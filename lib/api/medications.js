const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const medicationsAPI = {
  // Get all medications
  getMedications: async (token, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.page) queryParams.append('page', params.page);

    const response = await fetch(`${API_BASE_URL}/medications?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch medications');
    }

    return response.json();
  },

  // Get single medication
  getMedication: async (token, id) => {
    const response = await fetch(`${API_BASE_URL}/medications/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch medication');
    }

    return response.json();
  },

  // Create medication
  createMedication: async (token, medicationData) => {
    const response = await fetch(`${API_BASE_URL}/medications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(medicationData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create medication');
    }

    return response.json();
  },

  // Update medication
  updateMedication: async (token, id, medicationData) => {
    const response = await fetch(`${API_BASE_URL}/medications/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(medicationData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update medication');
    }

    return response.json();
  },

  // Delete medication
  deleteMedication: async (token, id) => {
    const response = await fetch(`${API_BASE_URL}/medications/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete medication');
    }

    return response.json();
  },

  // Get active medications
  getActiveMedications: async (token) => {
    const response = await fetch(`${API_BASE_URL}/medications/active`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch active medications');
    }

    return response.json();
  },

  // Log medication intake
  logIntake: async (token, medicationId, data = {}) => {
    const response = await fetch(`${API_BASE_URL}/medications/${medicationId}/log`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to log medication intake');
    }

    return response.json();
  },

  // Get medication adherence
  getAdherence: async (token, medicationId, days = 30) => {
    const response = await fetch(`${API_BASE_URL}/medications/${medicationId}/adherence?days=${days}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch adherence');
    }

    return response.json();
  },

  // Get missed medications
  getMissedMedications: async (token, days = 7) => {
    const response = await fetch(`${API_BASE_URL}/medications/missed?days=${days}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch missed medications');
    }

    return response.json();
  },
};


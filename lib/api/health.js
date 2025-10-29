// Health API functions using fetch
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const healthAPI = {
  // Get health metrics
  getMetrics: async (token, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });
    
    const response = await fetch(`${API_BASE_URL}/health/metrics?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to get health metrics');
    }
    
    return Array.isArray(result.data) ? result.data : (result.data || []);
  },

  // Add health metric
  addMetric: async (token, metricData) => {
    const response = await fetch(`${API_BASE_URL}/health/metrics`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metricData),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to add health metric');
    }
    
    return result.data;
  },

  // Update health metric
  updateMetric: async (token, id, metricData) => {
    const response = await fetch(`${API_BASE_URL}/health/metrics/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metricData),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to update health metric');
    }
    
    return result.data;
  },

  // Delete health metric
  deleteMetric: async (token, id) => {
    const response = await fetch(`${API_BASE_URL}/health/metrics/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete health metric');
    }
    
    return result;
  },

  // Get health summary
  getSummary: async (token, days = 30) => {
    const response = await fetch(`${API_BASE_URL}/health/summary?days=${days}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to get health summary');
    }
    
    return result.data;
  },
};

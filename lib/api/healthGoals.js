const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const handleResponse = async (response) => {
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Something went wrong');
  }
  return result;
};

export const healthGoalsAPI = {
  // Get all health goals
  getGoals: async (token, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.category) queryParams.append('category', params.category);
    if (params.limit) queryParams.append('limit', params.limit);

    const response = await fetch(`${API_BASE_URL}/health-goals?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  // Get single goal
  getGoal: async (token, goalId) => {
    const response = await fetch(`${API_BASE_URL}/health-goals/${goalId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  // Create goal
  createGoal: async (token, goalData) => {
    const response = await fetch(`${API_BASE_URL}/health-goals`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(goalData),
    });

    return handleResponse(response);
  },

  // Update goal
  updateGoal: async (token, goalId, goalData) => {
    const response = await fetch(`${API_BASE_URL}/health-goals/${goalId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(goalData),
    });

    return handleResponse(response);
  },

  // Delete goal
  deleteGoal: async (token, goalId) => {
    const response = await fetch(`${API_BASE_URL}/health-goals/${goalId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  // Add milestone
  addMilestone: async (token, goalId, milestoneData) => {
    const response = await fetch(`${API_BASE_URL}/health-goals/${goalId}/milestones`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(milestoneData),
    });

    return handleResponse(response);
  },
};


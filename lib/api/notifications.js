const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const handleResponse = async (response) => {
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Something went wrong');
  }
  return result;
};

export const notificationsAPI = {
  // Get all notifications
  getNotifications: async (token, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.type) queryParams.append('type', params.type);
    if (params.read !== undefined) queryParams.append('read', params.read);
    if (params.limit) queryParams.append('limit', params.limit);

    const response = await fetch(`${API_BASE_URL}/notifications?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  // Get single notification
  getNotification: async (token, notificationId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  // Mark notification as read
  markAsRead: async (token, notificationId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  // Mark all notifications as read
  markAllAsRead: async (token) => {
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  // Delete notification
  deleteNotification: async (token, notificationId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  // Get unread count
  getUnreadCount: async (token) => {
    const response = await fetch(`${API_BASE_URL}/notifications/unread/count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },
};


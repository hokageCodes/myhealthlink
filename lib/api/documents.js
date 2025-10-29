// Documents API functions using fetch
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const handleResponse = async (response) => {
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Something went wrong');
  }
  return result;
};

export const documentsAPI = {
  // Get all documents
  getDocuments: async (token, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.append('category', params.category);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.page) queryParams.append('page', params.page);

    const response = await fetch(`${API_BASE_URL}/documents?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  // Get single document
  getDocument: async (token, documentId) => {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  // Upload document
  uploadDocument: async (token, file, metadata) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', metadata.category);
    formData.append('title', metadata.title);
    formData.append('description', metadata.description || '');
    formData.append('date', metadata.date);

    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    return handleResponse(response);
  },

  // Update document
  updateDocument: async (token, documentId, data) => {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Delete document
  deleteDocument: async (token, documentId) => {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  // Get document categories
  getCategories: async (token) => {
    const response = await fetch(`${API_BASE_URL}/documents/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  // Download document
  downloadDocument: async (token, documentId) => {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to download document');
    }
    
    return response.blob();
  },
};

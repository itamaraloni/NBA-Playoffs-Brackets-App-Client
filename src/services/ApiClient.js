
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

/**
 * Base API client using fetch
 */
const apiClient = {
  /**
   * Get default headers including auth token if available
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  },
  
  /**
   * Handle fetch response
   */
  async handleResponse(response) {
    // Check if the request was successful
    if (!response.ok) {
      let errorMessage;
      
      // Try to parse error message from the response
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `Error: ${response.status} ${response.statusText}`;
      } catch (e) {
        errorMessage = `Error: ${response.status} ${response.statusText}`;
      }
      
      // Handle 401 unauthorized
      if (response.status === 401) {
        // You could automatically redirect to login page here
        // localStorage.removeItem('auth_token');
        // window.location.href = '/login';
      }
      
      throw new Error(errorMessage);
    }
    
    // For 204 No Content responses
    if (response.status === 204) {
      return null;
    }
    
    // Parse JSON response
    return await response.json();
  },
  
  /**
   * GET request
   */
  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse(response);
  },
  
  /**
   * POST request
   */
  async post(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse(response);
  },
  
  /**
   * PUT request
   */
  async put(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse(response);
  },
  
  /**
   * DELETE request
   */
  async delete(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse(response);
  }
};

export default apiClient;
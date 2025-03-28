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
   * Handle fetch response with improved error handling
   */
  async handleResponse(response) {
    // Check if the request was successful
    if (!response.ok) {
      let errorData = null;
      let errorMessage = `Error: ${response.status} ${response.statusText}`;
      let errorCode = null;
      
      // Try to parse error message from the response
      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        errorCode = errorData.code;
      } catch (e) {
        // Response wasn't JSON, use default error message
      }
      
      // Handle auth errors (401 Unauthorized)
      if (response.status === 401) {
        try {
          console.log(`Auth error: ${errorMessage}`);
          
          // Save theme
          const theme = localStorage.getItem('theme-mode');
          localStorage.clear();
          if (theme) localStorage.setItem('theme-mode', theme);
          
          // Show notification first, before potential redirect
          if (window.notify) {
            window.notify.warning('Your session has expired. Please log in again.');
          }
          
          // Small delay to allow notification to appear before redirect
          setTimeout(() => {
            window.location.href = '/landing';
          }, 1000);
          
          return; // Stop execution
        } catch (e) {
          console.error("Error in auth handling:", e);
        }
      }
      
      // Handle other errors
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = errorData;
      throw error;
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
  },

  setupConnectionMonitoring() {
    window.addEventListener('online', () => {
      if (window.notify) {
        window.notify.success('Internet connection restored');
      }
    });
    
    window.addEventListener('offline', () => {
      if (window.notify) {
        window.notify.error('Internet connection lost');
      }
    });
  },
};

// Initialize connection monitoring
apiClient.setupConnectionMonitoring();

export default apiClient;
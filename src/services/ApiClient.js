const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

/**
 * Base API client using fetch with retry logic
 */
const apiClient = {
  // Maximum number of retries for failed requests
  MAX_RETRIES: 3,
  
  // Delay between retries in ms (increases with backoff)
  RETRY_DELAY: 1000,
  
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
        console.log(`Error message: ${errorMessage} | Error code: ${errorCode}`);
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
   * Makes a fetch request with retry capability
   * @param {string} url - The URL to fetch
   * @param {Object} options - Fetch options
   * @param {number} retryCount - Current retry count (used internally)
   * @returns {Promise<Response>} - Fetch response
   */
  async fetchWithRetry(url, options, retryCount = 0) {
    try {
      console.log(`Try fetching ${url} (attempt ${retryCount + 1})`);
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      // Only retry on network errors (not HTTP error responses)
      if (error.name === 'TypeError' || error.message.includes('ERR_CONNECTION_RESET')) {
        if (retryCount < this.MAX_RETRIES) {
          console.log(`Request failed, retrying (${retryCount + 1}/${this.MAX_RETRIES})...`);
          
          // Exponential backoff
          const delay = this.RETRY_DELAY * Math.pow(2, retryCount);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return this.fetchWithRetry(url, options, retryCount + 1);
        }
      }
      
      // If we've exhausted retries or it's not a network error, rethrow
      throw error;
    }
  },
  
  /**
   * GET request with retry logic
   */
  async get(endpoint) {
    const response = await this.fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse(response);
  },
  
  /**
   * POST request with retry logic
   */
  async post(endpoint, data) {
    const response = await this.fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse(response);
  },
  
  /**
   * PUT request with retry logic
   */
  async put(endpoint, data) {
    const response = await this.fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse(response);
  },
  
  /**
   * DELETE request with retry logic
   */
  async delete(endpoint) {
    const response = await this.fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
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
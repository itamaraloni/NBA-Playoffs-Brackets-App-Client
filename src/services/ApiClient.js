import { clearLocalStoragePreserveTheme } from '../utils/authStorage';

const API_BASE_URL = process.env.REACT_APP_API_URL;
if (!API_BASE_URL) {
  throw new Error('REACT_APP_API_URL is not set. Set it in your .env file.');
}

/**
 * Base API client using fetch with retry logic
 */
const apiClient = {
  // Maximum number of retries for failed requests
  MAX_RETRIES: 3,
  
  // Delay between retries in ms (increases with backoff)
  RETRY_DELAY: 1000,
  
  /**
   * Read a cookie value by name.
   * Used to read the CSRF token from the non-httpOnly csrf_token cookie.
   */
  getCookie(name) {
    const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : null;
  },

  /**
   * Get default headers for API requests.
   * Includes CSRF token for state-changing requests (POST/PUT/DELETE).
   * Auth is handled via httpOnly session cookie (sent automatically by the browser).
   */
  getHeaders(method) {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Include CSRF token for state-changing requests
    if (method && !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) {
      const csrfToken = this.getCookie('csrf_token');
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }
    }

    return headers;
  },
  
  /**
   * Handle fetch response with improved error handling
   * @param {Response} response
   * @param {Object} options
   * @param {boolean} options.suppressAuthEvent - When true, a 401 throws an error
   *   instead of dispatching auth:session-expired. Use for callers that implement
   *   their own retry logic (e.g. fetchAndSetPlayerData) so the sign-out flow
   *   isn't triggered prematurely on a transient cookie-timing 401.
   */
  async handleResponse(response, { suppressAuthEvent = false } = {}) {
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
        console.log(`Auth error: ${errorMessage}`);
        clearLocalStoragePreserveTheme();

        if (suppressAuthEvent) {
          // Caller handles this 401 (e.g. with retry logic) — throw so they
          // can catch it without triggering the global sign-out event yet.
          const error = new Error(errorMessage || 'Unauthorized');
          error.status = 401;
          throw error;
        }

        // Standard path: session genuinely expired mid-session.
        // Dispatch so AuthContext can signOut(Firebase) before redirecting,
        // preventing the silent re-auth loop on next page load.
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
        return;
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
      const response = await fetch(url, { ...options, credentials: 'include' });
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
   * @param {string} endpoint
   * @param {Object} options - Passed through to handleResponse (e.g. suppressAuthEvent)
   */
  async get(endpoint, options = {}) {
    const response = await this.fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders('GET'),
    });

    return this.handleResponse(response, options);
  },

  /**
   * POST request with retry logic
   */
  async post(endpoint, data) {
    const response = await this.fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders('POST'),
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
      headers: this.getHeaders('PUT'),
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
      headers: this.getHeaders('DELETE'),
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
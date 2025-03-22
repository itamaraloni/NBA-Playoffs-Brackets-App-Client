// src/services/UserServices.js
import apiClient from './ApiClient';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

/**
 * User and authentication related service methods
 */
const UserServices = {
  /**
   * Sync user with database after Firebase authentication
   * @param {Object} user - Firebase user object
   * @returns {Promise<Object>} User data from backend
   */
  async syncUserWithDatabase(user) {
    if (!user) return null;
    
    try {
      // Get the Firebase token for backend authentication
      const idToken = await user.getIdToken();
      
      // Call backend API directly (not using apiClient yet since token isn't in localStorage)
      const response = await fetch(`${API_BASE_URL}/user/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          user_id: user.uid,
          email: user.email
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync user with database');
      }
      
      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error("Error syncing user with database:", error);
      throw error;
    }
  },
  
  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile() {
    return await apiClient.get('/user/profile');
  },
  
  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Updated profile
   */
  async updateUserProfile(profileData) {
    return await apiClient.put('/user/profile', profileData);
  },
  
  /**
   * Logout user - clears localStorage while preserving theme
   */
  logout() {
    // Save theme before clearing localStorage
    const theme = localStorage.getItem('theme-mode');
    
    // Clear localStorage
    localStorage.clear();
    
    // Restore theme
    if (theme) {
      localStorage.setItem('theme-mode', theme);
    }
  },
  
  /**
   * Check if user is authenticated
   * @returns {Boolean} Authentication status
   */
  isAuthenticated() {
    return localStorage.getItem('auth_token') !== null;
  },
  
  /**
   * Store user data in localStorage
   * @param {Object} userData - User data from backend
   * @param {String} token - Authentication token
   */
  storeUserData(userData, token) {
    if (token) {
      localStorage.setItem('auth_token', token);
    }
    
    if (userData?.is_admin) {
      localStorage.setItem('is_admin', userData.is_admin);
    }
    
    if (userData?.player?.player_id) {
      localStorage.setItem('player_id', userData.player.player_id);
    }
    
    if (userData?.league?.league_id) {
      localStorage.setItem('league_id', userData.league.league_id);
    }
  }
};

export default UserServices;
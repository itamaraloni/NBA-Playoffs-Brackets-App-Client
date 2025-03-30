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
    try {
      const data = await apiClient.get('/user/get_profile');
      return transformUserProfile(data);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Updated profile
   */
  async updatePicks(type, selection, playerId) {
    if (type === 'championship') {
      return await apiClient.post('/user/update_championship', { player_id: playerId, championship: selection });
    }
    else {
      return await apiClient.post('/user/update_mvp', { player_id: playerId, mvp: selection });
    }
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

    if (userData?.player?.player_name) {
      localStorage.setItem('player_name', userData.player.player_name);
    }
    
    if (userData?.league?.league_id) {
      localStorage.setItem('league_id', userData.league.league_id);
    }
  }
};

/**
 * Transform API user profile to UI format
 * @param {Object} response - API response
 * @returns {Object} Transformed data
 */
const transformUserProfile = (response) => {
  try {
    // Extract data from response
    const data = response;
    
    if (!data || !data.user) {
      console.error("Invalid profile data structure", data);
      return null;
    }
    
    return {
      user: data.user,
      player: data.player ? {
        ...data.player,
        formattedPlayer: {
          name: data.player.name,
          player_avatar: data.player.player_avatar,
          championshipPrediction: data.player.winning_team,
          mvpPrediction: data.player.mvp,
          bullsEye: data.player.bullsEye || 0,
          hits: data.player.hits || 0,
          misses: data.player.misses || 0,
          score: data.player.total_points,
          championship_team_points: data.player.championship_team_points,
          mvp_points: data.player.mvp_points
        }
      } : null,
      league: data.league
    };
  } catch (error) {
    console.error("Error transforming user profile:", error);
    return null;
  }
};

export default UserServices;
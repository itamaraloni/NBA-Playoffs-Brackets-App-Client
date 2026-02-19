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
  async syncUserWithDatabase(user, retryCount) {
    if (!user) return null;
    
    try {
      // Get the Firebase token for backend authentication
      const idToken = await user.getIdToken();

      const url = `${API_BASE_URL}/user/check`;
      console.log(`Try fetching ${url} (attempt ${retryCount + 1})`);
      
      // Call backend API directly (not using apiClient yet since token isn't in localStorage)
      const response = await fetch(`${url}`, {
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
   * Get current user profile (basic information only)
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile() {
    try {
      const data = await apiClient.get('/user/get_user_profile');
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get player profile data including statistics
   * @returns {Promise<Object>} Player profile and statistics
   */
  async getPlayerProfile(playerId) {
    try {
      const data = await apiClient.get(`/user/get_player_profile/${playerId}`);
      return transformPlayerProfile(data);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Update user's championship or MVP picks
   * @param {String} type - 'championship' or 'mvp'
   * @param {String} selection - Selected team or player
   * @param {String} playerId - Player ID
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
   * Get all leagues and players for the authenticated user
   * @returns {Promise<Object>} Players array with league info
   */
  async getUserLeagues() {
    try {
      const data = await apiClient.get('/user/leagues');
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Store user data in localStorage
   * @param {Object} userData - User data from backend (only is_admin for auth verification)
   * @param {String} token - Authentication token
   */
  storeUserData(userData, token) {
    if (token) {
      localStorage.setItem('auth_token', token);
    }

    // Note: is_admin is NOT stored in localStorage (security - see PR #13/issue #1)
    // Note: player/league data no longer stored here - managed by AuthContext via getUserLeagues()
  }
};

/**
 * Transform API player profile to UI format
 * @param {Object} response - API response
 * @returns {Object} Transformed data
 */
const transformPlayerProfile = (response) => {
  try {
    const data = response;
    
    if (!data || (!data.player && !data.league)) {
      return null;
    }
    
    return {
      player: data.player ? {
        ...data.player,
        formattedPlayer: {
          name: data.player.name,
          player_avatar: data.player.player_avatar,
          championshipPrediction: data.player.winning_team,
          mvpPrediction: data.player.mvp,
          bullsEye: data.player.bullsEye || {},
          hits: data.player.hits || {},
          misses: data.player.misses || {},
          score: data.player.total_points,
          championship_team_points: data.player.championship_team_points,
          mvp_points: data.player.mvp_points
        }
      } : null,
      league: data.league
    };
  } catch (error) {
    console.error("Error transforming player profile:", error);
    return null;
  }
};

export default UserServices;
import apiClient from './ApiClient';
import { clearLocalStoragePreserveTheme } from '../utils/authStorage';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * User and authentication related service methods
 */
const UserServices = {
  /**
   * Sync user with database after Firebase authentication.
   * Exchanges a Firebase ID token for an httpOnly session cookie via /auth/session_login.
   * The server sets the session cookie and a JS-readable CSRF token cookie automatically.
   * @param {Object} user - Firebase user object
   * @param {number} retryCount - Current retry attempt (for logging)
   * @returns {Promise<Object>} { is_admin: boolean }
   */
  async syncUserWithDatabase(user, retryCount) {
    if (!user) return null;

    try {
      // Get the Firebase ID token to exchange for a session cookie
      const idToken = await user.getIdToken();

      const url = `${API_BASE_URL}/auth/session_login`;
      console.log(`Try fetching ${url} (attempt ${retryCount + 1})`);

      // Direct fetch (not apiClient) because this is the auth bootstrap —
      // no session cookie exists yet, and we need credentials: 'include'
      // so the browser stores the Set-Cookie response.
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id_token: idToken })
      });

      if (!response.ok) {
        throw new Error('Failed to sync user with database');
      }

      // Response: { is_admin: bool } with 200 (existing user) or 201 (new user)
      const status = response.status;
      const userData = await response.json();
      return {
        ...userData,
        isNewUser: status === 201
      };
    } catch (error) {
      console.error("Error syncing user with database:", error);
      throw error;
    }
  },

  /**
   * Lightweight auth check using existing cookies (no new session creation).
   */
  async checkUserWithSession() {
    return apiClient.post('/user/check', {});
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
   * Logout user — clears server session cookie and localStorage.
   * Calls /auth/logout to revoke Firebase refresh tokens and clear httpOnly cookies.
   */
  async logout() {
    try {
      const csrfToken = apiClient.getCookie('csrf_token');
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : {},
      });
    } catch (error) {
      // Log but don't throw — we still want to clear local state even if
      // the server call fails (e.g. network offline)
      console.error("Error calling /auth/logout:", error);
    }

    clearLocalStoragePreserveTheme();
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

  // storeUserData() removed — session cookie is set automatically by the browser
  // from the /auth/session_login response. No localStorage token storage needed.
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
        // Explicit camelCase mappings for snake_case API fields
        playerAvatar: data.player.player_avatar,
        winningTeam: data.player.winning_team,
        totalPredictionPoints: data.player.total_prediction_points,
        matchupPoints: data.player.matchup_points ?? null,
        bracketScore: data.player.bracket_score ?? 0,
        bracketHits: data.player.bracket_hits ?? null,
        bracketBullsEye: data.player.bracket_bullseyes ?? null,
        bracketMisses: data.player.bracket_misses ?? null,
        bracketPoints: data.player.bracket_points ?? null,
        globalRank: data.player.global_rank ?? null,
        totalPlayers: data.player.total_players ?? null,
        leagueRank: data.player.league_rank ?? null,
        leagueTotalPlayers: data.player.league_total_players ?? null,
        totalScore: data.player.total_score,
        championshipTeamPoints: data.player.championship_team_points,
        mvpPoints: data.player.mvp_points,
        championshipPickStatus: data.player.championship_pick_status,
        mvpPickStatus: data.player.mvp_pick_status,
        formattedPlayer: {
          name: data.player.name,
          playerAvatar: data.player.player_avatar,
          championshipPrediction: data.player.winning_team,
          mvpPrediction: data.player.mvp,
          bullsEye: data.player.bullsEye || {},
          hits: data.player.hits || {},
          misses: data.player.misses || {},
          score: data.player.total_score,
          championshipTeamPoints: data.player.championship_team_points,
          mvpPoints: data.player.mvp_points
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

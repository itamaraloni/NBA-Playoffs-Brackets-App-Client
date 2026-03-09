import apiClient from './ApiClient';

/**
 * League related service methods
*/
const LeagueServices = {
  /**
   * Get league data with players
  */
 async getLeagueWithPlayers(leagueId) {
   try {
     const data = await apiClient.get(`/league/${leagueId}/players`);
     return transformLeagueData(data);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Create a new league
  */
 async createLeague(leagueSetupData) {
   return await apiClient.post('/league/create_league', leagueSetupData);
  },
  
  /**
   * Preview an invite token (public endpoint — no auth required).
   * Uses raw fetch() instead of apiClient because this endpoint must work
   * for unauthenticated users, and apiClient attaches an Authorization
   * header that could cause issues with expired tokens.
   */
  async previewInvite(token) {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';
    const response = await fetch(`${baseUrl}/invite/${token}/preview`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const error = new Error(errorData?.error || `Error: ${response.status}`);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    return {
      leagueName: data.league_name,
      playerCount: data.player_count,
      leagueId: data.league_id,
    };
  },

  /**
   * Join a league via invite token (authenticated).
   * Sends player setup data (name, avatar, championship pick, MVP pick).
   */
  async joinViaInvite(token, playerData) {
    return await apiClient.post(`/invite/${token}/join`, playerData);
  },

  /**
   * Regenerate invite link for a league (commissioner only).
   * Invalidates the old token and returns a new one.
   */
  async regenerateInvite(leagueId) {
    return await apiClient.post(`/league/${leagueId}/invite/regenerate`);
  },
};

/**
 * Transform player data from API format to UI format
 */
const transformPlayerData = (player) => ({
  id: player.player_id,
  name: player.name,
  player_avatar: player.player_avatar,
  championshipPrediction: player.winning_team,
  mvpPrediction: player.mvp_prediction,
  leagueId: player.league_id,
  score: player.total_score,
  totalPredictionPoints: player.total_prediction_points,
  championship_team_points: player.championship_team_points,
  mvp_points: player.mvp_points,
  bracketScore: player.bracket_score || 0,
  bullsEye: player.bullsEye,
  hits: player.hits,
  misses: player.misses,
  is_commissioner: player.is_commissioner
});

/**
 * Transform league data from API format to UI format
 */
const transformLeagueData = (data) => ({
  id: data.id,
  name: data.name,
  isActive: true, // Assuming active by default
  code: String(data.code),
  inviteToken: data.invite_token || null,
  playerCount: data.players.playerCount,
  players: data.players.data.map(transformPlayerData)
});

export default LeagueServices;
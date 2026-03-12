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
   const data = await apiClient.post('/league/create_league', leagueSetupData);
   return {
     message: data.message,
     leagueId: data.league_id,
     leagueCode: data.league_code,
     inviteToken: data.invite_token,
   };
  },
  
  /**
   * Preview an invite token (public endpoint — no auth required).
   * Auth is handled via session cookie (sent automatically); server
   * does not require auth for this endpoint.
   */
  async previewInvite(token) {
    const data = await apiClient.get(`/invite/${token}/preview`);
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
    const data = await apiClient.post(`/invite/${token}/join`, playerData);
    return {
      message: data.message,
      playerId: data.player_id,
      leagueId: data.league_id,
    };
  },

  /**
   * Regenerate invite link for a league (commissioner only).
   * Invalidates the old token and returns a new one.
   */
  async regenerateInvite(leagueId) {
    const data = await apiClient.post(`/league/${leagueId}/invite/regenerate`);
    return {
      message: data.message,
      inviteToken: data.invite_token,
    };
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
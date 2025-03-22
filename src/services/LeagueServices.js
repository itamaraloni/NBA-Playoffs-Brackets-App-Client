import apiClient from './ApiClient';

/**
 * Transform player data from API format to UI format
 */
const transformPlayerData = (player) => ({
  id: player.player_id,
  name: player.name,
  championshipPrediction: player.winning_team,
  mvpPrediction: player.mvp_prediction,
  leagueId: player.league_id,
  score: player.total_points,
  championship_team_points: player.championship_team_points,
  mvp_points: player.mvp_points,
  round_predictions_points: player.round_predictions_points,
  fixed_bracket_predictions_points: player.fixed_bracket_predictions_points,
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
  playerCount: data.players.playerCount,
  players: data.players.data.map(transformPlayerData)
});

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
  async createLeague(leagueData) {
    return await apiClient.post('/league', leagueData);
  },
  
  /**
   * Join a league using code
   */
  async joinLeague(leagueCode, playerData) {
    return await apiClient.post(`/league/join/${leagueCode}`, playerData);
  },
};

export default LeagueServices;
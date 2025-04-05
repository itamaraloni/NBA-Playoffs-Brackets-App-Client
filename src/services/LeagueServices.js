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
   * Validates league code and returns its league id
  */
 async validateLeagueCode(leagueCode) {
   return await apiClient.get(`/league/validate_code/${leagueCode}`);
  },

  /**
   * Join a league
  */
  async joinLeague(joinToLeagueData) {
    return await apiClient.post('/league/join_player_to_league', joinToLeagueData);
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
  score: player.total_points,
  championship_team_points: player.championship_team_points,
  mvp_points: player.mvp_points,
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

export default LeagueServices;
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
   * Get champion and MVP pick distribution for a league (excludes bots).
   * @returns {Promise<Object>}
   */
  async getPickDistribution(leagueId) {
    const data = await apiClient.get(`/league/${leagueId}/stats/picks`);
    return {
      leagueId: data.league_id,
      playerCount: data.player_count,
      championDistribution: data.champion_distribution.map(d => ({
        teamId: d.team_id,
        teamName: d.team_name,
        pickCount: d.pick_count,
        percentage: d.percentage,
      })),
      mvpDistribution: data.mvp_distribution.map(d => ({
        nbaPlayerId: d.nba_player_id,
        playerName: d.player_name,
        pickCount: d.pick_count,
        percentage: d.percentage,
      })),
    };
  },

  /**
   * Get global player rankings across all leagues.
   * Returns top-10 players, the current user's rank, and total player count.
   */
  async getGlobalRankings(leagueId) {
    const data = await apiClient.get(`/league/${leagueId}/rankings/global`);
    return {
      topPlayers: data.top_players.map(p => ({
        rank: p.rank,
        playerId: p.player_id,
        playerName: p.player_name,
        playerAvatar: p.player_avatar,
        totalScore: p.total_score,
        leagueName: p.league_name,
      })),
      myRank: data.my_rank ? {
        rank: data.my_rank.rank,
        playerId: data.my_rank.player_id,
        playerName: data.my_rank.player_name,
        playerAvatar: data.my_rank.player_avatar,
        totalScore: data.my_rank.total_score,
        leagueName: data.my_rank.league_name ?? null,
      } : null,
      totalPlayers: data.total_players,
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
  playerAvatar: player.player_avatar,
  championshipPrediction: player.winning_team,
  mvpPrediction: player.mvp_prediction,
  leagueId: player.league_id,
  rank: player.rank,
  score: player.total_score,
  totalPredictionPoints: player.total_prediction_points,
  championshipTeamPoints: player.championship_team_points,
  mvpPoints: player.mvp_points,
  bracketScore: player.bracket_score || 0,
  isCommissioner: player.is_commissioner,
  championshipPickStatus: player.championship_pick_status ?? null,
  mvpPickStatus: player.mvp_pick_status ?? null
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
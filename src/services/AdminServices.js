import apiClient from './ApiClient';

/**
 * Service layer for admin API endpoints.
 * All methods transform snake_case API responses to camelCase for React components.
 */
const AdminServices = {
  /**
   * Fetch active teams for the create-matchup dropdown.
   * Uses the general /teams endpoint (not admin-only).
   * @returns {Promise<Array>} - sorted by conference → seed → name
   */
  getTeams: async () => {
    try {
      const response = await apiClient.get('/teams?is_active=true');

      return response.teams.map(t => ({
        teamId: t.team_id,
        name: t.name,
        seed: t.seed,
        conference: t.conference,
        isActive: t.is_active,
        championshipPoints: t.championship_points,
      }));
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  },

  /**
   * Fetch matchups with optional filters.
   * @param {Object} filters - { status, round, conference }
   * @returns {Promise<{ matchups: Array, total: number }>}
   */
  getMatchups: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.round) params.append('round', filters.round);
      if (filters.conference) params.append('conference', filters.conference);

      const query = params.toString();
      const endpoint = `/admin/matchups${query ? `?${query}` : ''}`;
      const response = await apiClient.get(endpoint);

      const matchups = response.matchups.map(m => ({
        matchupId: m.matchup_id,
        homeTeam: {
          teamId: m.home_team.team_id,
          name: m.home_team.name,
          seed: m.home_team.seed,
          conference: m.home_team.conference,
          isActive: m.home_team.is_active,
          logo: `/resources/team-logos/${m.home_team.name.toLowerCase().replace(/\s+/g, '-')}.png`,
        },
        awayTeam: {
          teamId: m.away_team.team_id,
          name: m.away_team.name,
          seed: m.away_team.seed,
          conference: m.away_team.conference,
          isActive: m.away_team.is_active,
          logo: `/resources/team-logos/${m.away_team.name.toLowerCase().replace(/\s+/g, '-')}.png`,
        },
        status: m.status,
        homeTeamScore: m.home_team_score,
        awayTeamScore: m.away_team_score,
        round: m.round,
        conference: m.conference,
        bracketPosition: m.bracket_position,
        createdAt: m.created_at,
        updatedAt: m.updated_at,
      }));

      return { matchups, total: response.total };
    } catch (error) {
      console.error('Error fetching admin matchups:', error);
      throw error;
    }
  },

  /**
   * Create a new matchup.
   * @param {Object} data - { homeTeamId, awayTeamId, round, conference }
   * @returns {Promise<Object>}
   */
  createMatchup: async (data) => {
    try {
      const response = await apiClient.post('/admin/matchups', {
        home_team_id: data.homeTeamId,
        away_team_id: data.awayTeamId,
        round: data.round,
        conference: data.conference,
      });

      return {
        matchupId: response.matchup_id,
        homeTeamName: response.home_team_name,
        awayTeamName: response.away_team_name,
        round: response.round,
        conference: response.conference,
        status: response.status,
      };
    } catch (error) {
      console.error('Error creating matchup:', error);
      throw error;
    }
  },

  /**
   * Activate an upcoming matchup to in_progress.
   * @param {string} matchupId
   * @returns {Promise<Object>}
   */
  activateMatchup: async (matchupId) => {
    try {
      const response = await apiClient.put(`/admin/matchups/${matchupId}/activate`);
      return response;
    } catch (error) {
      console.error('Error activating matchup:', error);
      throw error;
    }
  },

  /**
   * Update matchup score. Client sends absolute scores; server validates
   * that exactly one team's score is incremented by 1 from the current value.
   * @param {string} matchupId
   * @param {Object} scores - { homeTeamScore, awayTeamScore }
   * @returns {Promise<Object>}
   */
  updateMatchupScore: async (matchupId, scores) => {
    try {
      const response = await apiClient.put(`/admin/matchups/${matchupId}/score`, {
        home_team_score: scores.homeTeamScore,
        away_team_score: scores.awayTeamScore,
      });
      return response;
    } catch (error) {
      console.error('Error updating matchup score:', error);
      throw error;
    }
  },

  /**
   * Get prediction statistics for a matchup (excludes bots).
   * @param {string} matchupId
   * @returns {Promise<Object>}
   */
  getPredictionStats: async (matchupId) => {
    try {
      const response = await apiClient.get(`/admin/matchups/${matchupId}/prediction_stats`);

      const teamLogoPath = (name) =>
        `/resources/team-logos/${name.toLowerCase().replace(/\s+/g, '-')}.png`;

      const mapSplit = (split) => ({
        home: { count: split.home.count, percentage: split.home.percentage },
        away: { count: split.away.count, percentage: split.away.percentage },
      });

      const mapScoreDistribution = (dist) =>
        dist.map(d => ({ score: d.score, count: d.count, percentage: d.percentage }));

      const bp = response.bracket_predictions;

      return {
        matchupId: response.matchup_id,
        homeTeamName: response.home_team_name,
        awayTeamName: response.away_team_name,
        homeTeamLogo: teamLogoPath(response.home_team_name),
        awayTeamLogo: teamLogoPath(response.away_team_name),
        totalPredictions: response.total_predictions,
        winnerSplit: mapSplit(response.winner_split),
        scoreDistribution: mapScoreDistribution(response.score_distribution),
        bracketPredictions: {
          total: bp.total,
          winnerSplit: mapSplit(bp.winner_split),
          scoreDistribution: mapScoreDistribution(bp.score_distribution),
        },
      };
    } catch (error) {
      console.error('Error fetching prediction stats:', error);
      throw error;
    }
  },

  /**
   * Get champion and MVP pick distributions (excludes bots).
   * @returns {Promise<Object>}
   */
  getPlayerStats: async () => {
    try {
      const response = await apiClient.get('/admin/stats/players');

      return {
        totalPlayers: response.total_players,
        championDistribution: response.champion_distribution.map(d => ({
          teamId: d.team_id,
          teamName: d.team_name,
          pickCount: d.pick_count,
          percentage: d.percentage,
        })),
        mvpDistribution: response.mvp_distribution.map(d => ({
          nbaPlayerId: d.nba_player_id,
          playerName: d.player_name,
          pickCount: d.pick_count,
          percentage: d.percentage,
        })),
      };
    } catch (error) {
      console.error('Error fetching player stats:', error);
      throw error;
    }
  },

  /**
   * Run data integrity health checks.
   * @returns {Promise<Object>}
   */
  getHealthCheck: async () => {
    try {
      const response = await apiClient.get('/admin/health');

      const transformCheck = (check, transformRecord) => ({
        status: check.status,
        count: check.count,
        records: check.records.map(transformRecord),
      });

      return {
        status: response.status,
        totalIssues: response.total_issues,
        checks: {
          orphanedPredictions: transformCheck(response.checks.orphaned_predictions, (r) => ({
            predictionId: r.prediction_id,
            reason: r.reason,
          })),
          scoreMismatches: transformCheck(response.checks.score_mismatches, (r) => ({
            playerName: r.player_name,
            storedTotal: r.stored_total,
            expectedTotal: r.expected_total,
          })),
          unscoredPredictions: transformCheck(response.checks.unscored_predictions, (r) => ({
            predictionId: r.prediction_id,
            predictedScore: r.predicted_score,
            actualScore: r.actual_score,
          })),
          invalidMatchupScores: transformCheck(response.checks.invalid_matchup_scores, (r) => ({
            matchupId: r.matchup_id,
            round: r.round,
            homeTeamScore: r.home_team_score,
            awayTeamScore: r.away_team_score,
          })),
          staleChampionshipPoints: transformCheck(response.checks.stale_championship_points, (r) => ({
            playerName: r.player_name,
            teamName: r.team_name,
            championshipTeamPoints: r.championship_team_points,
          })),
          incorrectlyActiveTeams: transformCheck(response.checks.incorrectly_active_teams, (r) => ({
            teamName: r.team_name,
            round: r.round,
          })),
        },
      };
    } catch (error) {
      console.error('Error fetching health check:', error);
      throw error;
    }
  },
};

export default AdminServices;

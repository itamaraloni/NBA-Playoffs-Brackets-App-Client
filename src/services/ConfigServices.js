import apiClient from './ApiClient';

/**
 * Service layer for public config API endpoints.
 * All methods transform snake_case API responses to camelCase for React components.
 */
const ConfigServices = {
  /**
   * Fetch active teams.
   * Uses the public /teams endpoint (no auth required).
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
   * Fetch scoring configuration for all rounds.
   * @returns {Promise<Object>} - { bracket: { round: { hit, bullseye } }, matchup: { ... } }
   */
  getScoringConfig: async () => {
    try {
      const response = await apiClient.get('/config/scoring');
      return response;
    } catch (error) {
      console.error('Error fetching scoring config:', error);
      throw error;
    }
  },

  /**
   * Fetch active MVP candidates with points.
   * @returns {Promise<Array>} - sorted by mvpPoints descending
   */
  getMvpCandidates: async () => {
    try {
      const response = await apiClient.get('/config/mvp_candidates');

      return response.mvp_candidates.map(c => ({
        nbaPlayerId: c.nba_player_id,
        name: c.name,
        teamId: c.team_id,
        teamName: c.team_name,
        mvpPoints: c.mvp_points,
      }));
    } catch (error) {
      console.error('Error fetching MVP candidates:', error);
      throw error;
    }
  },
};

export default ConfigServices;

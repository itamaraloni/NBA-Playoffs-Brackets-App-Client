import apiClient from './ApiClient';

const MatchupServices = {
  /**
   * Get all matchup predictions for the current user
   * @returns {Promise<Object>} Object containing grouped predictions
   */
  getMatchups: async () => {
    try {
      const response = await apiClient.get('/prediction/get_all_matchups_with_predictions');
      
      // Process the API response to match the expected format in the PredictionsPage component
      const transformedData = [];
      
      // Process upcoming matchups
      response.predictions.upcoming.forEach(item => {
        transformedData.push({
          id: item.matchup.matchup_id,
          homeTeam: {
            name: item.matchup.home_team_name,
            logo: `/resources/team-logos/${item.matchup.home_team_name.toLowerCase().replace(/\s+/g, '-')}.png`,
          },
          awayTeam: {
            name: item.matchup.away_team_name,
            logo: `/resources/team-logos/${item.matchup.away_team_name.toLowerCase().replace(/\s+/g, '-')}.png`,
          },
          status: 'upcoming',
          predictedHomeScore: item.prediction.home_team_score,
          predictedAwayScore: item.prediction.away_team_score,
          round: 1 // Default value, adjust if available from API
        });
      });
      
      // Process in-progress matchups
      response.predictions.in_progress.forEach(item => {
        transformedData.push({
          id: item.matchup.matchup_id,
          homeTeam: {
            name: item.matchup.home_team_name,
            logo: `/resources/team-logos/${item.matchup.home_team_name.toLowerCase().replace(/\s+/g, '-')}.png`,
          },
          awayTeam: {
            name: item.matchup.away_team_name,
            logo: `/resources/team-logos/${item.matchup.away_team_name.toLowerCase().replace(/\s+/g, '-')}.png`,
          },
          status: 'in-progress',
          actualHomeScore: item.matchup.home_team_score,
          actualAwayScore: item.matchup.away_team_score,
          predictedHomeScore: item.prediction.home_team_score,
          predictedAwayScore: item.prediction.away_team_score,
          round: 1 // Default value, adjust if available from API
        });
      });
      
      // Process completed matchups
      response.predictions.completed.forEach(item => {
        transformedData.push({
          id: item.matchup.matchup_id,
          homeTeam: {
            name: item.matchup.home_team_name,
            logo: `/resources/team-logos/${item.matchup.home_team_name.toLowerCase().replace(/\s+/g, '-')}.png`,
          },
          awayTeam: {
            name: item.matchup.away_team_name,
            logo: `/resources/team-logos/${item.matchup.away_team_name.toLowerCase().replace(/\s+/g, '-')}.png`,
          },
          status: 'completed',
          actualHomeScore: item.matchup.home_team_score,
          actualAwayScore: item.matchup.away_team_score,
          predictedHomeScore: item.prediction.home_team_score,
          predictedAwayScore: item.prediction.away_team_score,
          round: 1 // Default value, adjust if available from API
        });
      });
      
      return transformedData;
    } catch (error) {
      console.error('Error fetching matchups:', error);
      throw error;
    }
  },
  
  /**
   * Submit a prediction for a matchup
   * @param {Object} prediction Prediction data
   * @returns {Promise<Object>} Success response
   */
  submitPrediction: async (prediction) => {
    try {
      const response = await apiClient.post('/prediction/submit_prediction', {
        matchup_id: prediction.matchupId,
        homeScore: prediction.homeScore,
        awayScore: prediction.awayScore
      });
      
      return response;
    } catch (error) {
      console.error('Error submitting prediction:', error);
      throw error;
    }
  },
  
  /**
   * Update matchup scores (admin only)
   * @param {Object} scoreUpdate Score update data
   * @returns {Promise<Object>} Success response
   */
  updateMatchupScore: async (scoreUpdate) => {
    try {
      const response = await apiClient.post('/prediction/update_matchup', {
        matchup_id: scoreUpdate.matchupId,
        home_team_score: scoreUpdate.homeScore,
        away_team_score: scoreUpdate.awayScore
      });
      return response;
    } catch (error) {
      console.error('Error updating score:', error);
      throw error;
    }
  },
  
  /**
   * Get league predictions for a specific matchup with statistics for it
   * @param {string} matchupId Matchup ID
   * @param {string} leagueId League ID
   * @returns {Promise<Array>} League predictions
   */
  getMatchupPredictions: async (matchupId, leagueId) => {
    try {
      const response = await apiClient.get(`/prediction/get_matchup_predictions/${leagueId}/${matchupId}`);
      
      // Transform the response to match the expected format in the MatchupDetailsDialog
      const transformedPredictions = response.predictions.map(pred => ({
        userName: pred.player_name,
        homeScore: pred.prediction.home_team_score,
        awayScore: pred.prediction.away_team_score,
        hit: pred.prediction.hit,
        bullsEye: pred.prediction.bullsEye,
        pointsEarned: pred.prediction.points_earned
      }));
      
      // Calculate stats
      const homeTeamWins = transformedPredictions.filter(p => p.homeScore > p.awayScore);
      const awayTeamWins = transformedPredictions.filter(p => p.awayScore > p.homeScore);
      
      const stats = {
        totalPredictions: transformedPredictions.length,
        homeTeamWinCount: homeTeamWins.length,
        awayTeamWinCount: awayTeamWins.length,
        homeTeamWinPercentage: transformedPredictions.length ? 
          (homeTeamWins.length / transformedPredictions.length) * 100 : 0,
        awayTeamWinPercentage: transformedPredictions.length ? 
          (awayTeamWins.length / transformedPredictions.length) * 100 : 0
      };
      
      return {
        predictions: transformedPredictions,
        stats: stats
      };
    } catch (error) {
      console.error('Error fetching matchup predictions:', error);
      throw error;
    }
  },

  /**
   * Activate upcoming matchup into In Progress status
   * @param {string} matchupId Matchup ID
   * @returns {Promise<Object>} Success response
   */
  activateMatchup: async (matchupId) => {
    try {
      const response = await apiClient.post('/prediction/activate_matchup', {
        matchup_id: matchupId
      });

      return response;
    } catch (error) {
      console.error('Error activating matchup:', error);
      throw error;
    }
  }
};

export default MatchupServices;
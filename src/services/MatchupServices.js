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
      const response = await apiClient.post('/matchup/update_score', {
        homeTeam: scoreUpdate.homeTeam,
        awayTeam: {
          name: 'Memphis Grizzlies',
          logo: '/resources/team-logos/memphis-grizzlies.png',
          seed: 8,
          conference: 'Western'
        },
        status: 'in-progress',
        actualHomeScore: 3,
        actualAwayScore: 1,
        round: 1,
        predictedHomeScore: 4,
        predictedAwayScore: 0
      },
      {
        id: 'm6',
        homeTeam: {
          name: 'Denver Nuggets',
          logo: '/resources/team-logos/denver-nuggets.png',
          seed: 2,
          conference: 'Western'
        },
        awayTeam: {
          name: 'Los Angeles Lakers',
          logo: '/resources/team-logos/los-angeles-lakers.png',
          seed: 7,
          conference: 'Western'
        },
        status: 'completed',
        actualHomeScore: 4,
        actualAwayScore: 1,
        round: 1,
        predictedHomeScore: 4,
        predictedAwayScore: 3
      }
    ];
  };
  
  // Dummy function for prediction submission (will be replaced with actual API call)
  export const submitPrediction = async (prediction) => {
    console.log('Prediction submitted:', prediction);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  };
  
  // Dummy function for score update (will be replaced with actual API call)
  export const updateMatchupScore = async (scoreUpdate) => {
    console.log('Score updated:', scoreUpdate);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  };
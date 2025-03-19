// For demo purposes - replace with actual API calls in production
const mockLeaguePredictions = {
    // Key format: 'homeTeam-awayTeam'
    'Denver Nuggets-Los Angeles Lakers': [
      { 
        userId: 'user1', 
        userName: 'John Doe', 
        userAvatar: null, 
        homeScore: 4, 
        awayScore: 2 
      },
      { 
        userId: 'user2', 
        userName: 'Jane Smith', 
        userAvatar: null, 
        homeScore: 3, 
        awayScore: 4 
      },
      { 
        userId: 'user3', 
        userName: 'Mike Johnson', 
        userAvatar: null, 
        homeScore: 2, 
        awayScore: 4 
      },
      { 
        userId: 'user5', 
        userName: 'Alex Brown', 
        userAvatar: null, 
        homeScore: 4, 
        awayScore: 1 
      },
      { 
        userId: 'user6', 
        userName: 'Chris Williams', 
        userAvatar: null, 
        homeScore: 4, 
        awayScore: 3 
      },
    ],
    'New York Knicks-Atlanta Hawks': [
      { 
        userId: 'user1', 
        userName: 'John Doe', 
        userAvatar: null, 
        homeScore: 4, 
        awayScore: 1 
      },
      { 
        userId: 'user2', 
        userName: 'Jane Smith', 
        userAvatar: null, 
        homeScore: 4, 
        awayScore: 3 
      },
      { 
        userId: 'user4', 
        userName: 'Sarah Wilson', 
        userAvatar: null, 
        homeScore: 3, 
        awayScore: 4 
      },
      { 
        userId: 'user7', 
        userName: 'David Taylor', 
        userAvatar: null, 
        homeScore: 2, 
        awayScore: 4 
      },
    ],
    'Milwaukee Bucks-Indiana Pacers': [
      { 
        userId: 'user1', 
        userName: 'John Doe', 
        userAvatar: null, 
        homeScore: 4, 
        awayScore: 3 
      },
      { 
        userId: 'user2', 
        userName: 'Jane Smith', 
        userAvatar: null, 
        homeScore: 4, 
        awayScore: 2 
      },
      { 
        userId: 'user3', 
        userName: 'Mike Johnson', 
        userAvatar: null, 
        homeScore: 3, 
        awayScore: 4 
      },
      { 
        userId: 'user8', 
        userName: 'Emily Clark', 
        userAvatar: null, 
        homeScore: 4, 
        awayScore: 0 
      },
    ],
    'Oklahoma City Thunder-Memphis Grizzlies': [
      { 
        userId: 'user1', 
        userName: 'John Doe', 
        userAvatar: null, 
        homeScore: 4, 
        awayScore: 1 
      },
      { 
        userId: 'user4', 
        userName: 'Sarah Wilson', 
        userAvatar: null, 
        homeScore: 4, 
        awayScore: 2 
      },
      { 
        userId: 'user5', 
        userName: 'Alex Brown', 
        userAvatar: null, 
        homeScore: 4, 
        awayScore: 3 
      },
    ]
  };
  
  /**
   * Fetch predictions for a specific matchup
   * @param {string} homeTeam - Home team name
   * @param {string} awayTeam - Away team name
   * @returns {Promise<Array>} - Array of user predictions
   */
  export const getMatchupPredictions = async (homeTeam, awayTeam) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const key = `${homeTeam}-${awayTeam}`;
        const predictions = mockLeaguePredictions[key] || [];
        resolve(predictions);
      }, 300); // Simulate network delay
    });
  };
  
  /**
   * Get prediction statistics for a matchup
   * @param {string} homeTeam - Home team name
   * @param {string} awayTeam - Away team name
   * @returns {Promise<Object>} - Statistics about predictions
   */
  export const getMatchupPredictionStats = async (homeTeam, awayTeam) => {
    const predictions = await getMatchupPredictions(homeTeam, awayTeam);
    
    // No predictions
    if (predictions.length === 0) {
      return {
        totalPredictions: 0,
        homeTeamWinCount: 0,
        awayTeamWinCount: 0,
        homeTeamWinPercentage: 0,
        awayTeamWinPercentage: 0,
        mostCommonScore: null
      };
    }
    
    // Count predictions for each team
    const homeTeamWins = predictions.filter(p => p.homeScore > p.awayScore);
    const awayTeamWins = predictions.filter(p => p.awayScore > p.homeScore);
    
    // Count occurrences of each score
    const scoreMap = {};
    predictions.forEach(p => {
      const scoreKey = `${p.homeScore}-${p.awayScore}`;
      scoreMap[scoreKey] = (scoreMap[scoreKey] || 0) + 1;
    });
    
    // Find most common score
    let mostCommonScore = null;
    let maxCount = 0;
    
    Object.entries(scoreMap).forEach(([score, count]) => {
      if (count > maxCount) {
        mostCommonScore = score;
        maxCount = count;
      }
    });
    
    // Parse the most common score
    let mostCommonHomeScore = null;
    let mostCommonAwayScore = null;
    
    if (mostCommonScore) {
      const [home, away] = mostCommonScore.split('-');
      mostCommonHomeScore = parseInt(home);
      mostCommonAwayScore = parseInt(away);
    }
    
    return {
      totalPredictions: predictions.length,
      homeTeamWinCount: homeTeamWins.length,
      awayTeamWinCount: awayTeamWins.length,
      homeTeamWinPercentage: (homeTeamWins.length / predictions.length) * 100,
      awayTeamWinPercentage: (awayTeamWins.length / predictions.length) * 100,
      mostCommonScore: mostCommonScore ? {
        homeScore: mostCommonHomeScore,
        awayScore: mostCommonAwayScore,
        count: maxCount,
        percentage: (maxCount / predictions.length) * 100
      } : null
    };
  };
// Sample matchup data
export const getMatchups = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      {
        id: 'm1',
        homeTeam: {
          name: 'Boston Celtics',
          logo: '/resources/team-logos/boston-celtics.png',
          seed: 1,
          conference: 'Eastern'
        },
        awayTeam: {
          name: 'Miami Heat',
          logo: '/resources/team-logos/miami-heat.png',
          seed: 8,
          conference: 'Eastern'
        },
        status: 'upcoming',
        round: 1,
        predictedHomeScore: 4,
        predictedAwayScore: 1
      },
      {
        id: 'm2',
        homeTeam: {
          name: 'New York Knicks',
          logo: '/resources/team-logos/new-york-knicks.png',
          seed: 2,
          conference: 'Eastern'
        },
        awayTeam: {
          name: 'Atlanta Hawks',
          logo: '/resources/team-logos/atlanta-hawks.png',
          seed: 7,
          conference: 'Eastern'
        },
        status: 'in-progress',
        actualHomeScore: 2,
        actualAwayScore: 1,
        round: 1,
        predictedHomeScore: 4,
        predictedAwayScore: 1
      },
      {
        id: 'm3',
        homeTeam: {
          name: 'Milwaukee Bucks',
          logo: '/resources/team-logos/milwaukee-bucks.png',
          seed: 3,
          conference: 'Eastern'
        },
        awayTeam: {
          name: 'Indiana Pacers',
          logo: '/resources/team-logos/indiana-pacers.png',
          seed: 6,
          conference: 'Eastern'
        },
        status: 'completed',
        actualHomeScore: 4,
        actualAwayScore: 2,
        round: 1,
        predictedHomeScore: 4,
        predictedAwayScore: 1
      },
      {
        id: 'm4',
        homeTeam: {
          name: 'Cleveland Cavaliers',
          logo: '/resources/team-logos/cleveland-cavaliers.png',
          seed: 4,
          conference: 'Eastern'
        },
        awayTeam: {
          name: 'Orlando Magic',
          logo: '/resources/team-logos/orlando-magic.png',
          seed: 5,
          conference: 'Eastern'
        },
        status: 'upcoming',
        round: 1
      },
      {
        id: 'm5',
        homeTeam: {
          name: 'Oklahoma City Thunder',
          logo: '/resources/team-logos/oklahoma-city-thunder.png',
          seed: 1,
          conference: 'Western'
        },
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
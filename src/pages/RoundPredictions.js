import React from 'react';
import MatchupPredictionCard from '../components/MatchupPredictionCard';

const RoundPredictions = () => {
  // Mock data for demonstration
  const sampleMatchups = {
    upcoming: {
      homeTeam: {
        name: 'Los Angeles Lakers',
        logo: '/resources/team-logos/los-angeles-lakers.png',
        seed: 1,
        conference: 'Western'
      },
      awayTeam: {
        name: 'Golden State Warriors',
        logo: '/resources/team-logos/golden-state-warriors.png',
        seed: 8,
        conference: 'Western'
      }
    },
    completed: {
      homeTeam: {
        name: 'Boston Celtics',
        logo: '/resources/team-logos/boston-celtics.png',
        seed: 1,
        conference: 'Eastern'
      },
      awayTeam: {
        name: 'Philadelphia 76ers',
        logo: '/resources/team-logos/philadelphia-76ers.png',
        seed: 4,
        conference: 'Eastern'
      },
      status: 'completed',
      actualHomeScore: 4,
      actualAwayScore: 1,
      predictedHomeScore: 4,
      predictedAwayScore: 2
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Round Predictions</h2>
      <h3 className="text-xl font-semibold mb-2">Upcoming Matchup</h3>
      <MatchupPredictionCard 
        homeTeam={sampleMatchups.upcoming.homeTeam}
        awayTeam={sampleMatchups.upcoming.awayTeam}
        onSubmitPrediction={(prediction) => {
          console.log('Prediction submitted:', prediction);
        }}
      />
      <h3 className="text-xl font-semibold mb-2 mt-4">Completed Matchup</h3>
      <MatchupPredictionCard 
        homeTeam={sampleMatchups.completed.homeTeam}
        awayTeam={sampleMatchups.completed.awayTeam}
        status="completed"
        actualHomeScore={sampleMatchups.completed.actualHomeScore}
        actualAwayScore={sampleMatchups.completed.actualAwayScore}
        predictedHomeScore={sampleMatchups.completed.predictedHomeScore}
        predictedAwayScore={sampleMatchups.completed.predictedAwayScore}
        onSubmitPrediction={(prediction) => {
          console.log('Prediction submitted:', prediction);
        }}
      />
    </div>
  );
};

export default RoundPredictions;
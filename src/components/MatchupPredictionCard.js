import React, { useState } from 'react';
import Team from './Team';

const MatchupPredictionCard = ({ 
  homeTeam, 
  awayTeam, 
  status = 'upcoming',
  actualHomeScore = null,
  actualAwayScore = null,
  onSubmitPrediction 
}) => {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);

  const handleSubmitPrediction = () => {
    if (onSubmitPrediction) {
      onSubmitPrediction({
        homeTeam: homeTeam.name,
        awayTeam: awayTeam.name,
        homeScore,
        awayScore
      });
    }
  };

  return (
    <div className="matchup-prediction-card border rounded-lg p-4 mb-4 shadow-md">
      <div className="matchup-teams flex justify-between items-center mb-4">
        <Team 
          name={homeTeam.name}
          logo={homeTeam.logo}
          seed={homeTeam.seed}
          conference={homeTeam.conference}
        />
        <span className="vs text-xl font-bold mx-4">VS</span>
        <Team 
          name={awayTeam.name}
          logo={awayTeam.logo}
          seed={awayTeam.seed}
          conference={awayTeam.conference}
        />
      </div>

      {status === 'upcoming' && (
        <div className="prediction-input flex justify-center items-center">
          <div className="home-team-score mr-4">
            <label className="block text-sm font-medium text-gray-700">
              {homeTeam.name} Score
            </label>
            <input 
              type="number" 
              value={homeScore}
              onChange={(e) => setHomeScore(Number(e.target.value))}
              className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm"
              min="0"
              max="4"
              />
          </div>
          <div className="away-team-score">
            <label className="block text-sm font-medium text-gray-700">
              {awayTeam.name} Score
            </label>
            <input 
              type="number" 
              value={awayScore}
              onChange={(e) => setAwayScore(Number(e.target.value))}
              className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm"
              min="0"
              max="4"
            />
          </div>
        </div>
      )}

      {status !== 'upcoming' && actualHomeScore !== null && actualAwayScore !== null && (
        <div className="actual-score text-center">
          <span className="font-bold">Final Score:</span>
          <span className="ml-2">
            {homeTeam.name} {actualHomeScore} - {awayTeam.name} {actualAwayScore}
          </span>
        </div>
      )}

      {status === 'upcoming' && (
        <div className="submit-prediction text-center mt-4">
          <button 
            onClick={handleSubmitPrediction}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Submit Prediction
          </button>
        </div>
      )}
    </div>
  );
};

export default MatchupPredictionCard;
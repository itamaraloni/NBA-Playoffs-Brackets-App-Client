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
  const [validationError, setValidationError] = useState('');

  // Validate NBA Playoff series scoring rules
  const validateScore = (home, away) => {
    // Ensure only one team has 4 wins
    if (home < 4 && away < 4) {
      return 'Invalid score: One team must have 4 wins';
    }
    else if (home === 4 && away === 4) {
      return 'Invalid score: Only one team can have 4 wins';
    }
    
    return '';
  };

  const handleSubmitPrediction = () => {
    // Validate scores before submission
    const error = validateScore(homeScore, awayScore);
    console.log('error:', error);
    if (error) {
      setValidationError(error);
      return;
    }

    // Clear any previous validation errors
    setValidationError('');

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
        <div className="prediction-input flex flex-col justify-center items-center">
          <div className="flex justify-center items-center">
          <div className="home-team-score mr-4">
            <label className="block text-sm font-medium text-gray-700">
                {homeTeam.name}
            </label>
            <input 
              type="number" 
              value={homeScore}
                onChange={(e) => {
                  const value = Math.min(4, Math.max(0, Number(e.target.value)));
                  setHomeScore(value);
                }}
              className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm"
              min="0"
              max="4"
              />
          </div>
            
          <div className="away-team-score">
            <label className="block text-sm font-medium text-gray-700">
                {awayTeam.name}
            </label>
            <input 
              type="number" 
              value={awayScore}
                onChange={(e) => {
                  const value = Math.min(4, Math.max(0, Number(e.target.value)));
                  setAwayScore(value);
                }}
              className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm"
              min="0"
              max="4"
            />
          </div>
        </div>

          {/* Validation Error Display */}
          {validationError && (
            <div className="text-red-500 mt-2 text-sm">
              {validationError}
        </div>
      )}

        <div className="submit-prediction text-center mt-4">
          <button 
            onClick={handleSubmitPrediction}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Submit Prediction
          </button>
        </div>
        </div>
      )}
    </div>
  );
};

export default MatchupPredictionCard;
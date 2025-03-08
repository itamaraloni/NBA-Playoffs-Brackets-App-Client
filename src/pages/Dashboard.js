import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [leagueCode, setLeagueCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const playerId = localStorage.getItem('player_id');
  const navigate = useNavigate();

  const handleCreateLeague = () => {
    navigate('/create-league');
  };

  const handleJoinLeague = async () => {
    if (!leagueCode.trim()) {
      setCodeError('Please enter a league code');
      return;
    }

    setIsLoading(true);
    setCodeError('');

    try {
      // TODO: Replace with actual API call
      // Dummy API call for now
      console.log(`Checking league code: ${leagueCode}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dummy validation - in real implementation, this would be a backend call
      const isValidCode = leagueCode.length >= 6;
      
      if (isValidCode) {
        // Store league ID for use in CreatePlayerPage
        localStorage.setItem('joinLeagueId', 'dummy-league-id');
        navigate('/create-player');
      } else {
        setCodeError('League not found. Please check the code and try again.');
      }
    } catch (error) {
      console.error('Error joining league:', error);
      setCodeError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If user has no player_id yet (new user)
  const renderNewUserContent = () => (
    <div className="dashboard-sections grid md:grid-cols-2 gap-6">
      <div className="section bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Create a League</h2>
        <p className="text-gray-600">Start your own league and invite friends to join!</p>
        <button 
          onClick={handleCreateLeague}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Create League
        </button>
      </div>

      <div className="section bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Join a League</h2>
        <p className="text-gray-600">Enter the league code provided by your friends:</p>
        <div className="mt-3">
          <input
            type="text"
            value={leagueCode}
            onChange={(e) => setLeagueCode(e.target.value)}
            placeholder="Enter league code"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {codeError && <p className="text-red-500 mt-1 text-sm">{codeError}</p>}
        </div>
        <button
          onClick={handleJoinLeague}
          disabled={isLoading}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition disabled:bg-gray-400"
        >
          {isLoading ? 'Checking...' : 'Join League'}
        </button>
      </div>
      
      <div className="section bg-white shadow-md rounded-lg p-6 md:col-span-2">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-3">
            <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="font-bold text-blue-600">1</span>
            </div>
            <h3 className="font-medium">Create or Join a League</h3>
            <p className="text-sm text-gray-600 mt-1">Start your own league or join your friends using their league code</p>
          </div>
          <div className="text-center p-3">
            <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="font-bold text-blue-600">2</span>
            </div>
            <h3 className="font-medium">Turn on your Crystal Ball</h3>
            <p className="text-sm text-gray-600 mt-1">Bet on the team to lift the trophy and the MVP that will be crowned in the end of the playoffs </p>
          </div>
          <div className="text-center p-3">
            <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="font-bold text-blue-600">3</span>
            </div>
            <h3 className="font-medium">Make Your Predictions</h3>
            <p className="text-sm text-gray-600 mt-1">Predict outcomes for every matchup series of the NBA playoffs</p>
          </div>
          <div className="text-center p-3">
            <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="font-bold text-blue-600">4</span>
            </div>
            <h3 className="font-medium">Compete & Win</h3>
            <p className="text-sm text-gray-600 mt-1">Score points and climb the leaderboard</p>
          </div>
          <div className="text-center p-3">
            <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="font-bold text-blue-600">5</span>
            </div>
            <h3 className="font-medium">Sweep all the glory</h3>
            <p className="text-sm text-gray-600 mt-1">Finish the playoffs at the top of your league, and earn a whole year long of your friends respect</p>
          </div>
        </div>
      </div>
    </div>
  );

  // If user already has a player_id
  const renderExistingPlayerContent = () => (
    <div className="dashboard-sections grid md:grid-cols-2 gap-6">
      <div className="section bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Your League Stats</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="stat-card bg-blue-50 p-3 rounded-lg text-center">
            <p className="text-gray-600 text-sm">Current Rank</p>
            <p className="text-2xl font-bold text-blue-600">3rd</p>
          </div>
          <div className="stat-card bg-green-50 p-3 rounded-lg text-center">
            <p className="text-gray-600 text-sm">Your Score</p>
            <p className="text-2xl font-bold text-green-600">76</p>
          </div>
          <div className="stat-card bg-purple-50 p-3 rounded-lg text-center">
            <p className="text-gray-600 text-sm">Correct Picks</p>
            <p className="text-2xl font-bold text-purple-600">14</p>
          </div>
          <div className="stat-card bg-orange-50 p-3 rounded-lg text-center">
            <p className="text-gray-600 text-sm">Win Streak</p>
            <p className="text-2xl font-bold text-orange-600">3</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/league')}
          className="w-full mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          View League Details
        </button>
      </div>

      <div className="section bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Upcoming Games</h2>
        <div className="space-y-3">
          <div className="game-item p-3 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="team-info flex items-center">
                <span className="team-logo mr-2">🏀</span>
                <span>Lakers</span>
              </div>
              <span className="text-sm text-gray-500">vs</span>
              <div className="team-info flex items-center">
                <span>Celtics</span>
                <span className="team-logo ml-2">🏀</span>
              </div>
            </div>
            <div className="text-center mt-2">
              <span className="text-xs text-gray-500">Today, 7:30 PM</span>
              <button className="w-full mt-1 bg-green-500 text-white text-sm px-3 py-1 rounded hover:bg-green-600">
                Make Prediction
              </button>
            </div>
          </div>
          
          <div className="game-item p-3 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="team-info flex items-center">
                <span className="team-logo mr-2">🏀</span>
                <span>Warriors</span>
              </div>
              <span className="text-sm text-gray-500">vs</span>
              <div className="team-info flex items-center">
                <span>Nets</span>
                <span className="team-logo ml-2">🏀</span>
              </div>
            </div>
            <div className="text-center mt-2">
              <span className="text-xs text-gray-500">Tomorrow, 8:00 PM</span>
              <button className="w-full mt-1 bg-green-500 text-white text-sm px-3 py-1 rounded hover:bg-green-600">
                Make Prediction
              </button>
            </div>
          </div>
        </div>
        <button 
          onClick={() => navigate('/predictions')}
          className="w-full mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          View All Games
        </button>
      </div>
    </div>
  );

  return (
    <div className="dashboard p-4">
      <h1 className="text-3xl font-bold mb-6">NBA Playoff Predictions</h1>
      
      {playerId ? renderExistingPlayerContent() : renderNewUserContent()}
    </div>
  );
};

export default Dashboard;
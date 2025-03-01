import React from 'react';
import League from '../components/League';
import PlayerCard from '../components/PlayerCard';
import { FaShare, FaClipboard, FaTrophy } from 'react-icons/fa';

const LeaguePage = () => {
  // Mock data for a league the player is already in
  const mockLeague = {
    id: 'league1',
    name: 'NBA Fanatics League',
    season: '2024-2025',
    isActive: true,
    code: 'NBAPLAY2025',
    playerCount: 4,
    // We'll use this for the full table view
    players: [
      { 
        id: 'player1', 
        name: 'BasketballFan23',
        championshipPrediction: 'Boston Celtics',
        mvpPrediction: 'Jayson Tatum',
        leagueId: 'league1',
        score: 125
      },
      { 
        id: 'player2', 
        name: 'HoopMaster',
        championshipPrediction: 'Denver Nuggets',
        mvpPrediction: 'Nikola Jokić',
        leagueId: 'league1',
        score: 110
      },
      { 
        id: 'player3', 
        name: 'LakersNation',
        championshipPrediction: 'Los Angeles Lakers',
        mvpPrediction: 'LeBron James',
        leagueId: 'league1',
        score: 95
      },
      { 
        id: 'player4', 
        name: 'Current Player', // This would be the currently logged-in player
        championshipPrediction: 'Milwaukee Bucks',
        mvpPrediction: 'Giannis Antetokounmpo',
        leagueId: 'league1',
        score: 80
      }
    ]
  };
  
  // Assume the current player's ID
  const currentPlayerId = 'player4';
  
  // Copy league code to clipboard
  const copyLeagueCode = () => {
    navigator.clipboard.writeText(mockLeague.code);
    alert('League code copied to clipboard!');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">League: {mockLeague.name}</h1>
      
      {/* League Header with info and share code */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">Season: {mockLeague.season}</h2>
            <p className="text-gray-600 mt-1">Players: {mockLeague.playerCount}</p>
            {mockLeague.isActive && (
              <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                Active
              </span>
            )}
          </div>
          
          {/* Share code section */}
          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="flex items-center mb-2">
              <FaShare className="text-blue-500 mr-2" />
              <span className="font-semibold">Share League Code</span>
            </div>
            <div className="flex items-center">
              <code className="bg-white px-3 py-1 rounded border font-mono mr-2">
                {mockLeague.code}
              </code>
              <button 
                onClick={copyLeagueCode}
                className="text-blue-500 hover:text-blue-700"
                title="Copy to clipboard"
              >
                <FaClipboard />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Player Standings Table */}
      <h2 className="text-xl font-semibold mb-4">Player Standings</h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Championship</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MVP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
            </tr>
          </thead>
          <tbody>
            {mockLeague.players
              .sort((a, b) => b.score - a.score) // Sort by score descending
              .map((player, index) => (
                <tr 
                  key={player.id} 
                  className={`
                    border-b 
                    ${player.id === currentPlayerId ? 'bg-blue-50' : 'hover:bg-gray-50'}
                  `}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {index === 0 ? (
                      <div className="flex items-center">
                        <FaTrophy className="text-yellow-500 mr-1" />
                        <span className="font-bold">{index + 1}</span>
                      </div>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <span className="text-xs font-bold">{player.name.charAt(0)}</span>
                      </div>
                      <span className={player.id === currentPlayerId ? 'font-bold' : ''}>
                        {player.name}
                        {player.id === currentPlayerId && <span className="text-gray-500 ml-2">(You)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{player.championshipPrediction}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{player.mvpPrediction}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold">{player.score}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      
      {/* Scoring Rules Section */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold mb-3">Scoring Rules</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Correct championship team prediction: 50 points</li>
          <li>Correct MVP prediction: 30 points</li>
          <li>Correct series outcome: 15 points per series</li>
          <li>Correct series score: 10 additional points</li>
        </ul>
      </div>
    </div>
  );
};

export default LeaguePage;
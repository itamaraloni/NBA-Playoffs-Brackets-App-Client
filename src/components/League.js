import React from 'react';
import PropTypes from 'prop-types';
import { FaUsers, FaTrophy, FaCalendarAlt } from 'react-icons/fa';
import PlayerCard from './PlayerCard';

/**
 * League component to display league information and members
 */
const League = ({ 
  league, 
  currentPlayerId = null,
  showPlayers = true,
  onJoinLeague = null,
  isPreview = false
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* League Header */}
      <div className={`p-4 ${league.isActive ? 'bg-green-50' : 'bg-gray-50'}`}>
        <h3 className="font-bold text-xl mb-2">{league.name}</h3>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <FaCalendarAlt className="mr-2 text-blue-500" />
            <span>Season: {league.season}</span>
          </div>
          
          <div className="flex items-center">
            <FaUsers className="mr-2 text-blue-500" />
            <span>{league.playerCount || 0} players</span>
          </div>
          
          {league.isActive && (
            <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
              Active
            </div>
          )}
          
          {!league.isActive && (
            <div className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-semibold">
              Completed
            </div>
          )}
        </div>

        {/* Join League button */}
        {onJoinLeague && (
          <button 
            className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => onJoinLeague(league.id, league.code)}
          >
            Join League
          </button>
        )}
        
        {/* League code display for preview */}
        {isPreview && league.code && (
          <div className="mt-3 p-2 bg-gray-100 rounded border border-gray-300">
            <p className="text-sm">Join code: <span className="font-mono font-semibold">{league.code}</span></p>
          </div>
        )}
      </div>
      
      {/* League Players */}
      {showPlayers && league.players && league.players.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <h4 className="font-semibold text-lg mb-3">Players</h4>
          <div className="space-y-3">
            {league.players.map((player) => (
              <PlayerCard 
                key={player.id} 
                player={player}
                isCurrentPlayer={player.id === currentPlayerId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

League.propTypes = {
  league: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    season: PropTypes.string.isRequired,
    isActive: PropTypes.bool,
    code: PropTypes.string,
    playerCount: PropTypes.number,
    players: PropTypes.arrayOf(PropTypes.object)
  }).isRequired,
  currentPlayerId: PropTypes.string,
  showPlayers: PropTypes.bool,
  onJoinLeague: PropTypes.func,
  isPreview: PropTypes.bool
};

export default League;
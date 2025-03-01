import React from 'react';
import PropTypes from 'prop-types';
import { FaTrophy, FaMedal, FaUser } from 'react-icons/fa';

/**
 * A reusable card component for displaying player entity information
 */
const PlayerCard = ({ player, onClick, isSelectable = false }) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden ${
        isSelectable ? 'cursor-pointer hover:shadow-lg transition duration-300' : ''
      }`}
      onClick={isSelectable ? onClick : undefined}
    >
      <div className="p-4 flex items-center">
        {/* Avatar placeholder */}
        <div className="mr-4 w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
          <FaUser size={32} className="text-gray-400" />
        </div>
        
        {/* Player Info */}
        <div className="flex-grow">
          <h3 className="font-bold text-lg">{player.name}</h3>
          
          {/* Only show predictions if they exist */}
          {(player.championPrediction || player.mvpPrediction) && (
            <div className="text-sm text-gray-600">
              {player.championPrediction && (
                <div className="flex items-center">
                  <FaTrophy className="text-yellow-500 mr-1" size={12} />
                  <span>Champion: {player.championPrediction}</span>
                </div>
              )}
              
              {player.mvpPrediction && (
                <div className="flex items-center">
                  <FaMedal className="text-yellow-500 mr-1" size={12} />
                  <span>MVP: {player.mvpPrediction}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* League Status Badge */}
        {player.leagueId && (
          <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
            In League
          </div>
        )}
      </div>
    </div>
  );
};

PlayerCard.propTypes = {
  player: PropTypes.shape({
    name: PropTypes.string.isRequired,
    championPrediction: PropTypes.string,
    mvpPrediction: PropTypes.string,
    leagueId: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func,
  isSelectable: PropTypes.bool
};

export default PlayerCard;
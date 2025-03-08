import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './CreateLeaguePage.css';

// League avatar options
const avatarOptions = [
  { id: 1, src: '/resources/league-avatars/Kobe-Bryant.png', alt: 'Kobe Bryant' },
  { id: 2, src: '/resources/league-avatars/Lebron-James.png', alt: 'Lebron James' }
];

const CreateLeaguePage = () => {
  const [leagueName, setLeagueName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!leagueName.trim()) {
      setError('League name is required');
      return;
    }
    
    if (!selectedAvatar) {
      setError('Please select an avatar for your league');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Store league data in localStorage to use later when creating player
      localStorage.setItem('leagueSetup', JSON.stringify({
        name: leagueName,
        avatarId: selectedAvatar
      }));
      
      // Navigate to player creation page
      navigate('/create-player');
    } catch (err) {
      console.error('Error preparing league creation:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-league-container">
      <h1>Create Your League</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="leagueName">League Name</label>
          <input
            type="text"
            id="leagueName"
            value={leagueName}
            onChange={(e) => setLeagueName(e.target.value)}
            placeholder="Enter your league name"
            maxLength={30}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Select League Avatar</label>
          <div className="avatar-grid">
            {avatarOptions.map((avatar) => (
              <div 
                key={avatar.id}
                className={`avatar-option ${selectedAvatar === avatar.id ? 'selected' : ''}`}
                onClick={() => setSelectedAvatar(avatar.id)}
              >
                <img src={avatar.src} alt={avatar.alt} />
              </div>
            ))}
          </div>
        </div>
        
        <div className="scoring-info">
          <h3>Scoring System</h3>
          <p>
            Our league uses a point-based system:
          </p>
          <ul>
            <li>Bulls eye hit in the exact matchup score: 5 points</li>
            <li>Direction hit in the winner of the matchup: 2 point</li>
            <li>Loser you picked the wrong team: 0 points</li>
          </ul>
          <p>
            Players are ranked based on total points, with tie-breakers determined by 
            number of bulls eye hits, the more accurate the more chances to win.
          </p>
        </div>
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Next: Create Player'}
        </button>
      </form>
    </div>
  );
};

export default CreateLeaguePage;
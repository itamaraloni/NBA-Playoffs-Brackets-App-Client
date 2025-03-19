import React, { useState } from 'react';
import TeamsDisplay from './common/MatchupTeamsDisplay';
import ScoreCounter from './common/ScoreCounter';
import MatchScoreDisplay from './common/MatchupScoreDisplay';
import AdminScoreEditor from './common/MatchupAdminScoreEditor';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';

/**
 * Card component displaying a playoff matchup with prediction functionality
 */
const MatchupPredictionCard = ({ 
  homeTeam, 
  awayTeam, 
  status = 'upcoming',
  actualHomeScore = null,
  actualAwayScore = null,
  predictedHomeScore = null,
  predictedAwayScore = null,
  onSubmitPrediction,
  isAdmin = false,
  onUpdateScore,
  onViewDetails
}) => {
  const [homeScore, setHomeScore] = useState(predictedHomeScore || 0);
  const [awayScore, setAwayScore] = useState(predictedAwayScore || 0);
  const [validationError, setValidationError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [actualHome, setActualHome] = useState(actualHomeScore || 0);
  const [actualAway, setActualAway] = useState(actualAwayScore || 0);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  /**
   * Validate NBA Playoff series scoring rules
   */
  const validateScore = (home, away) => {
    if (home < 4 && away < 4) {
      return 'Invalid score: One team must have 4 wins';
    }
    else if (home === 4 && away === 4) {
      return 'Invalid score: Only one team can have 4 wins';
    }
    
    return '';
  };

  /**
   * Handle user prediction submission
   */
  const handleSubmitPrediction = () => {
    const error = validateScore(homeScore, awayScore);
    if (error) {
      setValidationError(error);
      return;
    }

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

  /**
   * Handle admin score update
   */
  const handleUpdateScore = () => {
    setEditMode(false);

    if (onUpdateScore) {
      onUpdateScore({
        homeTeam: homeTeam.name,
        awayTeam: awayTeam.name,
        homeScore: actualHome,
        awayScore: actualAway
      });
    }
  };

  /**
   * Handle viewing league predictions
   */
  const handleViewDetails = () => {
    if (onViewDetails && status !== 'upcoming') {
      onViewDetails({
        homeTeam,
        awayTeam,
        status,
        actualHomeScore,
        actualAwayScore,
        predictedHomeScore,
        predictedAwayScore
      });
    }
  };

  /**
   * Render prediction input for upcoming games
   */
  const renderUpcomingMatchup = () => (
    <Box sx={{ mt: 3 }}>
      {predictedHomeScore !== null && predictedAwayScore !== null && (
        <MatchScoreDisplay
          label="Your Prediction"
          homeTeam={homeTeam.name}
          awayTeam={awayTeam.name}
          homeScore={predictedHomeScore}
          awayScore={predictedAwayScore}
          sx={{ mb: 2 }}
        />
      )}

      <Typography variant="subtitle1" sx={{ mb: 1, textAlign: 'center' }}>
        {predictedHomeScore !== null ? 'Update Your Prediction' : 'Make Your Prediction'}
      </Typography>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center', 
        gap: 3,
        px: 3
      }}>
        <ScoreCounter
          label={homeTeam.name}
          value={homeScore}
          onChange={setHomeScore}
          sx={{ width: '100%', maxWidth: 200 }}
        />
        
        <ScoreCounter
          label={awayTeam.name}
          value={awayScore}
          onChange={setAwayScore}
          sx={{ width: '100%', maxWidth: 200 }}
        />
      </Box>

      {validationError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {validationError}
        </Alert>
      )}

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSubmitPrediction}
        >
          Submit Prediction
        </Button>
      </Box>
    </Box>
  );

  /**
   * Render display for in-progress games
   */
  const renderInProgressMatchup = () => (
    <Box sx={{ mt: 2 }}>
      <MatchScoreDisplay
        label="Current Score"
        homeTeam={homeTeam.name}
        awayTeam={awayTeam.name}
        homeScore={actualHomeScore}
        awayScore={actualAwayScore}
        sx={{ mb: 1 }}
      />

      {predictedHomeScore !== null && predictedAwayScore !== null && (
        <MatchScoreDisplay
          label="Your Prediction"
          homeTeam={homeTeam.name}
          awayTeam={awayTeam.name}
          homeScore={predictedHomeScore}
          awayScore={predictedAwayScore}
          sx={{ mt: 2 }}
        />
      )}

      {isAdmin && (
        <AdminScoreEditor
          editMode={editMode}
          setEditMode={setEditMode}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          homeScore={actualHome}
          awayScore={actualAway}
          setHomeScore={setActualHome}
          setAwayScore={setActualAway}
          validationError={validationError}
          onSave={handleUpdateScore}
        />
      )}
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="outlined"
          onClick={handleViewDetails}
          size="small"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          View League Predictions
        </Button>
      </Box>
    </Box>
  );

  /**
   * Render display for completed games
   */
  const renderCompletedMatchup = () => (
    <Box sx={{ mt: 2 }}>
      <MatchScoreDisplay
        label="Final Score"
        homeTeam={homeTeam.name}
        awayTeam={awayTeam.name}
        homeScore={actualHomeScore}
        awayScore={actualAwayScore}
        sx={{ mb: 1 }}
      />

      {predictedHomeScore !== null && predictedAwayScore !== null && (
        <MatchScoreDisplay
          label="Your Prediction"
          homeTeam={homeTeam.name}
          awayTeam={awayTeam.name}
          homeScore={predictedHomeScore}
          awayScore={predictedAwayScore}
          sx={{ mt: 2 }}
        />
      )}
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="outlined"
          onClick={handleViewDetails}
          size="small"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          View League Predictions
        </Button>
      </Box>
    </Box>
  );

  /**
   * Render content based on matchup status
   */
  const renderMatchupContent = () => {
    switch (status) {
      case 'upcoming':
        return renderUpcomingMatchup();
      case 'in-progress':
        return renderInProgressMatchup();
      case 'completed':
        return renderCompletedMatchup();
      default:
        return null;
    }
  };

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        mb: 2, 
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'relative'
      }}
    >

      <CardContent>
        {/* Teams Display */}
        <TeamsDisplay 
          homeTeam={homeTeam} 
          awayTeam={awayTeam} 
          sx={{ mb: 2 }}
        />

        {/* Matchup content based on status */}
        {renderMatchupContent()}
      </CardContent>
    </Card>
  );
};

export default MatchupPredictionCard;
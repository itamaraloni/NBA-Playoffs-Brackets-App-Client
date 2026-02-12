import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material';
import TeamsDisplay from './common/MatchupTeamsDisplay';
import ScoreCounter from './common/ScoreCounter';
import MatchScoreDisplay from './common/MatchupScoreDisplay';
import AdminScoreEditor from './common/MatchupAdminScoreEditor';
import PlayInTeamSelector from './common/PlayInTeamSelector';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
  Chip
} from '@mui/material';
import { RocketLaunch, EmojiEvents } from '@mui/icons-material';
import MatchupServices from '../services/MatchupServices';
import { Close } from '@mui/icons-material';
import { BsBullseye } from 'react-icons/bs';
import { TbCrystalBall } from 'react-icons/tb';

/**
 * Card component displaying a playoff matchup with prediction functionality
 */
const MatchupPredictionCard = ({
  homeTeam,
  awayTeam,
  matchupId,
  status = 'upcoming',
  actualHomeScore = null,
  actualAwayScore = null,
  predictedHomeScore = null,
  predictedAwayScore = null,
  round = 1,
  onSubmitPrediction,
  isAdmin = false,
  onUpdateScore,
  onViewDetails,
  onActivateMatchup
}) => {
  const [homeScore, setHomeScore] = useState(predictedHomeScore || 0);
  const [awayScore, setAwayScore] = useState(predictedAwayScore || 0);
  const [validationError, setValidationError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [actualHome, setActualHome] = useState(actualHomeScore || 0);
  const [actualAway, setActualAway] = useState(actualAwayScore || 0);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const theme = useTheme();

  /**
   * Get round display text
   */
  const getRoundDisplay = () => {
    switch (round) {
      case "playin_first": return "Play-In First Round"
      case "playin_second": return "Play-In Second Round"
      case "first": return "First Round";
      case "second": return "Conference Semifinals";
      case "conference_final": return "Conference Finals";
      case "final": return "NBA Finals";
      default: return `Round ${round}`;
    }
  };

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
        matchupId: matchupId,
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
        matchupId: matchupId,
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
        id: matchupId,
        homeTeam,
        awayTeam,
        status,
        actualHomeScore,
        actualAwayScore,
        predictedHomeScore,
        predictedAwayScore,
        round
      });
    }
  };

  /**
   * Handle activating 'Upcoming' matchup
   */
  const handleActivateMatchup = async () => {
    console.log('Activate matchup:', matchupId);
    try {
      const response = await MatchupServices.activateMatchup(matchupId);
      console.log("matchup activation response", response);
      // Show success notification
      if (window.notify) {
        window.notify.success('Prediction submitted successfully!');
      }
      
      // Notify the parent component to refresh data
      if (onActivateMatchup) {
        onActivateMatchup();
      }
    } catch (err) {
      // Show error notification
      if (window.notify) {
        window.notify.error('Failed to activate matchup');
      }
    }
  };

  /**
   * Reset selected team when component is mounted or prediction type changes
   */
  useEffect(() => {
    // If we have a previous prediction, set the selected team
    if (round === "playin_first" || round === "playin_second") {
      if (predictedHomeScore === 1) {
        setSelectedTeam('home');
      } else if (predictedAwayScore === 1) {
        setSelectedTeam('away');
      } else {
        setSelectedTeam(null);
      }
    }
  }, [round, predictedHomeScore, predictedAwayScore]);

  /**
   * Render prediction input for upcoming games
   */
  const renderUpcomingMatchup = () => {
    // For Play-In games (single elimination)
    if (round === "playin_first" || round === "playin_second") {
      const handleTeamSelect = (team) => {
        // Toggle selection if clicking the same team
        if (selectedTeam === team) {
          setSelectedTeam(null);
        } else {
          setSelectedTeam(team);
        }
        setValidationError('');
      };

      const handlePlayInPrediction = () => {
        if (!selectedTeam) {
          setValidationError('Please select a team to win');
          return;
        }

        if (onSubmitPrediction) {
          const homeWin = selectedTeam === 'home';
          onSubmitPrediction({
            matchupId: matchupId,
            homeScore: homeWin ? 1 : 0,
            awayScore: homeWin ? 0 : 1
          });
        }
      };

      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <PlayInTeamSelector
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            selectedTeam={selectedTeam}
            onSelectTeam={handleTeamSelect}
            predictedHomeScore={predictedHomeScore}
            predictedAwayScore={predictedAwayScore}
            validationError={validationError}
          />

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<RocketLaunch />}
              onClick={handlePlayInPrediction}
              sx={{ minWidth: '180px' }}
            >
              Submit Prediction
            </Button>
          </Box>

          {isAdmin && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button 
                variant="contained" 
                color="secondary"
                startIcon={<RocketLaunch />}
                onClick={handleActivateMatchup}
                sx={{ minWidth: '180px' }}
              >
                Activate Prediction
              </Button>
            </Box>
          )}
        </Box>
      );
    }
    
    // For regular playoff series (best of 7)
    return (
      <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        <Typography variant="subtitle1" sx={{ mb: 1, textAlign: 'center', fontWeight: 500 }}>
          {predictedHomeScore !== null ? 'Update Your Prediction' : 'Make Your Prediction'}
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center', 
          gap: 3,
          width: '100%',
          maxWidth: '500px',
          px: 2
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
          <Alert severity="error" sx={{ mt: 2, width: '100%', maxWidth: '500px' }}>
            {validationError}
          </Alert>
        )}

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<RocketLaunch />}
            onClick={handleSubmitPrediction}
            sx={{ minWidth: '180px' }}
          >
            Submit Prediction
          </Button>
        </Box>

        {isAdmin && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button 
              variant="contained" 
              color="secondary"
              startIcon={<RocketLaunch />}
              onClick={handleActivateMatchup}
              sx={{ minWidth: '180px' }}
            >
              Activate Matchup
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  /**
   * Render display for in-progress games
   */
  const renderInProgressMatchup = () => (
    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <MatchScoreDisplay
        label="Current Score"
        homeTeam={homeTeam.name}
        awayTeam={awayTeam.name}
        homeScore={actualHomeScore}
        awayScore={actualAwayScore}
        round={round}
        sx={{ mb: 1, width: '100%' }}
      />

      {predictedHomeScore !== null && predictedAwayScore !== null && (
        <MatchScoreDisplay
          label="Your Prediction"
          homeTeam={homeTeam.name}
          awayTeam={awayTeam.name}
          homeScore={predictedHomeScore}
          awayScore={predictedAwayScore}
          round={round}
          sx={{ mt: 2, width: '100%' }}
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
          sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: '200px' }}
        >
          View League Predictions
        </Button>
      </Box>
    </Box>
  );

  /**
   * Render display for completed games
   */
  const renderCompletedMatchup = () => {
    const accuracy = getPredictionAccuracy();
    
    return (
      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <MatchScoreDisplay
          label="Final Score"
          homeTeam={homeTeam.name}
          awayTeam={awayTeam.name}
          homeScore={actualHomeScore}
          awayScore={actualAwayScore}
          round={round}
          sx={{ mb: 1, width: '100%' }}
        />

        {predictedHomeScore !== null && predictedAwayScore !== null && (
          <>
            <MatchScoreDisplay
              label="Your Prediction"
              homeTeam={homeTeam.name}
              awayTeam={awayTeam.name}
              homeScore={predictedHomeScore}
              awayScore={predictedAwayScore}
              round={round}
              sx={{ mt: 2, width: '100%' }}
            />
            
            {/* Accuracy Indicator */}
            {accuracy.type !== 'none' && (
              <Box 
                sx={{
                  mt: 2,
                  px: 2,
                  py: 0.5,
                  borderRadius: '16px',
                  backgroundColor: `${accuracy.color}20`,
                  border: `1px solid ${accuracy.color}`,
                  color: theme.palette.mode === 'dark' ? accuracy.color : accuracy.color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                {accuracy.type === 'bullsEye' && <TbCrystalBall size={18} color={accuracy.color} />}
                {accuracy.type === 'hit' && <BsBullseye size={18} color={accuracy.color} />}
                {accuracy.type === 'miss' && <Close fontSize="small" sx={{ color: accuracy.color }} />}
                <Typography variant="body2" fontWeight="medium" sx={{ color: accuracy.color }}>
                  {accuracy.label}
                </Typography>
                
                {/* Show points earned for hits and bullseye */}
                {(accuracy.type === 'hit' || accuracy.type === 'bullsEye') && (
                  <Typography variant="body2" sx={{ ml: 1, color: accuracy.color }}>
                    (+{getPointsForPrediction(accuracy.type, round)})
                  </Typography>
                )}
              </Box>
            )}
          </>
        )}
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={handleViewDetails}
            size="small"
            sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: '200px' }}
          >
            View League Predictions
          </Button>
        </Box>
      </Box>
    );
  };

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

  /**
   * Get status chip color
   */
  const getStatusColor = () => {
    switch (status) {
      case 'upcoming': return 'info';
      case 'in-progress': return 'warning';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  /**
   * Get status display text
   */
  const getStatusText = () => {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  /**
   * Determine prediction accuracy (bullsEye, hit, or miss)
   */
  const getPredictionAccuracy = () => {
    // If no prediction made
    if (predictedHomeScore === null || predictedAwayScore === null) {
      return { type: 'none', label: 'No Prediction' };
    }

    // Get actual winner
    const actualWinner = actualHomeScore > actualAwayScore ? homeTeam.name : awayTeam.name;
    
    // Get predicted winner
    const predictedWinner = predictedHomeScore > predictedAwayScore ? homeTeam.name : awayTeam.name;
    
    // Miss - wrong winner
    if (actualWinner !== predictedWinner) {
      return { type: 'miss', label: 'Miss', color: theme.palette.error.main };
    }
    
    // For play-in games, there's no concept of "exact score" (just winner)
    if (round === "playin_first" || round === "playin_second") {
      return { type: 'hit', label: 'Hit', color: theme.palette.warning.main };
    }
    
    // Bulls-Eye - correct winner and exact score
    const actualScoreDiff = Math.abs(actualHomeScore - actualAwayScore);
    const predictedScoreDiff = Math.abs(predictedHomeScore - predictedAwayScore);
    
    if (actualScoreDiff === predictedScoreDiff) {
      return { type: 'bullsEye', label: 'Bulls-Eye', color: theme.palette.success.main };
    }
    
    // Hit - correct winner but wrong score
    return { type: 'hit', label: 'Hit', color: theme.palette.warning.main };
  };

  /**
   * Calculate points earned based on prediction type and round
   */
  const getPointsForPrediction = (predictionType, round) => {
    let hitPoints = 0;
    let bullsEyePoints = 0;
    
    switch (round) {
      case "playin_first":
      case "playin_second":
        hitPoints = 2;
        bullsEyePoints = 2; // Play-in games don't have bullseye distinction
        break;
      case 'first':
        hitPoints = 4;
        bullsEyePoints = 6;
        break;
      case 'second':
        hitPoints = 6;
        bullsEyePoints = 9;
        break;
      case 'conference_final':
        hitPoints = 8;
        bullsEyePoints = 12;
        break;
      case 'final':
        hitPoints = 10;
        bullsEyePoints = 15;
        break;
      default:
        return 0;
    }
    
    return predictionType === 'bullsEye' ? bullsEyePoints : hitPoints;
  };

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        mb: 2, 
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'visible'
      }}
    >
      {/* Round Badge */}
      <Chip
        icon={<EmojiEvents fontSize="small" />}
        label={getRoundDisplay()}
        color="primary"
        sx={{
          position: 'absolute',
          top: -12,
          left: '50%',
          transform: 'translateX(-50%)',
          fontWeight: 'bold',
          zIndex: 1
        }}
      />
      
      {/* Status Chip */}
      <Chip
        label={getStatusText()}
        color={getStatusColor()}
        size="small"
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          fontWeight: 'medium'
        }}
      />
      
      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 4 }}>
        {/* Teams Display */}
        <TeamsDisplay 
          homeTeam={homeTeam} 
          awayTeam={awayTeam}
          round={round}
          sx={{ mb: 2, width: '100%' }}
        />

        {/* Matchup content based on status */}
        {renderMatchupContent()}
      </CardContent>
    </Card>
  );
};

export default MatchupPredictionCard;
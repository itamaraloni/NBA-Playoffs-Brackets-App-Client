import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  Avatar,
  Chip,
  useMediaQuery,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import CancelIcon from '@mui/icons-material/Cancel';
import { BsBullseye } from 'react-icons/bs';
import { TbCrystalBall } from 'react-icons/tb';
import MatchupTeamsDisplay from './common/MatchupTeamsDisplay';
import MatchupScoreDisplay from './common/MatchupScoreDisplay';
import MatchupPredictionsStats from './MatchupPredictionsStats';
import { useAuth } from '../contexts/AuthContext';

/**
 * Dialog to display league predictions for a matchup
 */
const MatchupDetailsDialog = ({
  open,
  onClose,
  matchup,
  leaguePredictions = []
}) => {
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const { activePlayer } = useAuth();

  // If no matchup data, don't render
  if (!matchup) return null;

  const { homeTeam, awayTeam, status, actualHomeScore, actualAwayScore, round } = matchup;
  
  // More robust play-in detection
  const isPlayInByRound = round?.startsWith('playin_');
  const isPlayInByScore = (actualHomeScore === 1 && actualAwayScore === 0) || 
                          (actualHomeScore === 0 && actualAwayScore === 1);
  const isPlayIn = isPlayInByRound && isPlayInByScore;
  
  /**
   * Determine prediction accuracy for completed matchups
   */
  const getPredictionAccuracy = (prediction) => {
    if (status !== 'completed') return null;

    // Special handling for Play-In games
    if (isPlayIn) {
      const actualWinner = actualHomeScore === 1 ? 'home' : 'away';
      const predictedWinner = prediction.homeScore === 1 ? 'home' : 'away';
      
      // For Play-In games, it's either correct or wrong
      return actualWinner === predictedWinner ? 'hit' : 'miss';
    }
    
    // For regular playoff series
    const actualWinner = actualHomeScore > actualAwayScore ? 'home' : 'away';
    const predictedWinner = prediction.homeScore > prediction.awayScore ? 'home' : 'away';
    
    // Bulls-eye: correct winner and exact score
    if (
      prediction.homeScore === actualHomeScore && 
      prediction.awayScore === actualAwayScore
    ) {
      return 'bullseye';
    }
    // Hit: correct winner but wrong score
    else if (actualWinner === predictedWinner) {
      return 'hit';
    }
    // Miss: wrong winner
    else {
      return 'miss';
    }
  };

  /**
   * Render accuracy indicator chip
   */
  const renderAccuracyIndicator = (accuracy) => {
    switch (accuracy) {
      case 'bullseye':
        return (
          <Chip 
            icon={<TbCrystalBall />} 
            label="Bulls-eye" 
            color="success" 
            size="small" 
            sx={{ ml: isSmall ? 0 : 1, mt: isSmall ? 1 : 0 }} 
          />
        );
      case 'hit':
        return (
          <Chip 
            icon={<BsBullseye />} 
            label="Hit" 
            color="primary" 
            size="small" 
            sx={{ ml: isSmall ? 0 : 1, mt: isSmall ? 1 : 0 }} 
          />
        );
      case 'miss':
        return (
          <Chip 
            icon={<CancelIcon />} 
            label="Miss" 
            color="error" 
            size="small" 
            sx={{ ml: isSmall ? 0 : 1, mt: isSmall ? 1 : 0 }} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={fullScreen}
      aria-labelledby="matchup-details-dialog-title"
    >
      <DialogTitle id="matchup-details-dialog-title">
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <Typography variant="h5" component="div">
            League Predictions
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {/* Matchup Details */}
        <Box sx={{ mb: 3 }}>
          <MatchupTeamsDisplay
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            round={round}
          />
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            {status === 'completed' ? (
              <MatchupScoreDisplay
                label="Final Score"
                homeTeam={homeTeam.name}
                awayTeam={awayTeam.name}
                homeScore={actualHomeScore}
                awayScore={actualAwayScore}
                round={round}
              />
            ) : status === 'in-progress' ? (
              <MatchupScoreDisplay
                label="Current Score"
                homeTeam={homeTeam.name}
                awayTeam={awayTeam.name}
                homeScore={actualHomeScore}
                awayScore={actualAwayScore}
                round={round}
              />
            ) : (
              <Typography variant="subtitle1">Upcoming Matchup</Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />
        
        {/* Prediction Statistics */}
        <MatchupPredictionsStats 
          stats={matchup?.predictionStats} 
          loading={loading} 
          homeTeam={homeTeam} 
          awayTeam={awayTeam}
          leaguePredictions={leaguePredictions}
          round={round}
        />
        
        <Divider sx={{ mb: 3 }} />

        {/* League Predictions List */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          League Predictions
        </Typography>

        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {leaguePredictions.length > 0 ? (
            leaguePredictions.map((prediction, index) => {
              const accuracy = getPredictionAccuracy(prediction);
              const isCurrentPlayer = prediction.userName === activePlayer?.player_name;
              
              // Check if this prediction is for a play-in game
              const isPredictionPlayIn = isPlayIn || 
                ((prediction.homeScore === 0 || prediction.homeScore === 1) && 
                (prediction.awayScore === 0 || prediction.awayScore === 1) && 
                prediction.homeScore + prediction.awayScore === 1);
              
              return (
                <ListItem 
                  key={`${prediction.userName}-${index}`}
                  divider={index < leaguePredictions.length - 1}
                  sx={{ 
                    py: 2,
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    bgcolor: isCurrentPlayer ? 'action.selected' : 'inherit',
                    borderRadius: 1
                  }}
                >
                  {/* Avatar section */}
                  <Box sx={{ 
                    display: 'flex', 
                    width: '100%', 
                    alignItems: 'center',
                    flexDirection: { xs: 'column', sm: 'row' },
                    mb: { xs: 1, sm: 0 }
                  }}>
                    <Avatar 
                      src={prediction.userAvatar} 
                      alt={prediction.userName}
                      sx={{ mr: { xs: 0, sm: 2 }, mb: { xs: 1, sm: 0 } }}
                    >
                      {prediction.userName?.charAt(0) || '?'}
                    </Avatar>
                    
                    <Box sx={{ 
                      flexGrow: 1,
                      textAlign: { xs: 'center', sm: 'left' },
                      mb: { xs: 1, sm: 0 }
                    }}>
                      <Typography variant="subtitle1">
                        {prediction.userName}{isCurrentPlayer && ' (You)'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        flexDirection: { xs: 'column', sm: 'row' },
                        mr: { xs: 0, sm: 2 }
                    }}>
                        {status === 'completed' && renderAccuracyIndicator(accuracy)}
                    
                        {isPredictionPlayIn ? (
                          // Display for Play-In games
                          <Typography variant="body1" sx={{ 
                              fontWeight: 'bold',
                              mb: { xs: status === 'completed' ? 1 : 0, sm: 0 },
                              ml: { xs: 0, sm: status === 'completed' ? 1 : 0 }
                          }}>
                              Picked: {prediction.homeScore === 1 ? homeTeam.name : awayTeam.name}
                          </Typography>
                        ) : (
                          // Display for regular playoff series
                          <Typography variant="body1" sx={{ 
                              fontWeight: 'bold',
                              mb: { xs: status === 'completed' ? 1 : 0, sm: 0 },
                              ml: { xs: 0, sm: status === 'completed' ? 1 : 0 }
                          }}>
                              {homeTeam.name} {prediction.homeScore} - {prediction.awayScore} {awayTeam.name}
                          </Typography>
                        )}
                    </Box>
                  </Box>
                </ListItem>
              );
            })
          ) : (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body1" color="text.secondary">
                No predictions available for this matchup.
              </Typography>
            </Box>
          )}
        </List>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MatchupDetailsDialog;
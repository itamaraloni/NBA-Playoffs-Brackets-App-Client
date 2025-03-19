import React, { useState, useEffect } from 'react';
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
  Grid,
  Paper,
  CircularProgress,
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
import { getMatchupPredictionStats } from '../services/LeaguePredictionsServices';

/**
 * Dialog to display league predictions for a matchup
 */
const MatchupDetailsDialog = ({
  open,
  onClose,
  matchup,
  leaguePredictions = []
}) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  // Load prediction statistics when matchup changes
  useEffect(() => {
    const loadStats = async () => {
      if (matchup && open) {
        setLoading(true);
        try {
          const predictionStats = await getMatchupPredictionStats(
            matchup?.homeTeam?.name, 
            matchup?.awayTeam?.name
          );
          setStats(predictionStats);
        } catch (error) {
          console.error("Error loading prediction stats:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadStats();
  }, [matchup, open]);

  // If no matchup data, don't render
  if (!matchup) return null;

  const { homeTeam, awayTeam, status, actualHomeScore, actualAwayScore } = matchup;
  

  /**
   * Determine prediction accuracy for completed matchups
   */
  const getPredictionAccuracy = (prediction) => {
    if (status !== 'completed') return null;

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
          />
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            {status === 'completed' ? (
              <MatchupScoreDisplay
                label="Final Score"
                homeTeam={homeTeam.name}
                awayTeam={awayTeam.name}
                homeScore={actualHomeScore}
                awayScore={actualAwayScore}
              />
            ) : status === 'in-progress' ? (
              <MatchupScoreDisplay
                label="Current Score"
                homeTeam={homeTeam.name}
                awayTeam={awayTeam.name}
                homeScore={actualHomeScore}
                awayScore={actualAwayScore}
              />
            ) : (
              <Typography variant="subtitle1">Upcoming Matchup</Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />
        
        {/* Prediction Statistics */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Prediction Statistics
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : stats ? (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Predictions
                </Typography>
                <Typography variant="h4">
                  {stats.totalPredictions}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Team Win Distribution
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2">{homeTeam.name}</Typography>
                    <Typography variant="h5">{Math.round(stats.homeTeamWinPercentage)}%</Typography>
                    <Typography variant="body2" color="text.secondary">{stats.homeTeamWinCount} picks</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2">{awayTeam.name}</Typography>
                    <Typography variant="h5">{Math.round(stats.awayTeamWinPercentage)}%</Typography>
                    <Typography variant="body2" color="text.secondary">{stats.awayTeamWinCount} picks</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Most Common Prediction
                </Typography>
                {stats.mostCommonScore ? (
                  <>
                    <Typography variant="h5" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                      {homeTeam.name} {stats.mostCommonScore.homeScore} - {stats.mostCommonScore.awayScore} {awayTeam.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stats.mostCommonScore.count} users ({Math.round(stats.mostCommonScore.percentage)}%)
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body1">No common prediction</Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No prediction statistics available.
          </Typography>
        )}
        
        <Divider sx={{ mb: 3 }} />

        {/* League Predictions List */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          League Predictions
        </Typography>

        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {leaguePredictions.length > 0 ? (
            leaguePredictions.map((prediction, index) => {
              const accuracy = getPredictionAccuracy(prediction);
              
              return (
                <ListItem 
                  key={`${prediction.userId}-${index}`}
                  divider={index < leaguePredictions.length - 1}
                  sx={{ 
                    py: 2,
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' }
                  }}
                >
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
                        {prediction.userName}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        flexDirection: { xs: 'column', sm: 'row' },
                        mr: { xs: 0, sm: 2 }
                    }}>
                        {status === 'completed' && renderAccuracyIndicator(accuracy)}
                    
                        <Typography variant="body1" sx={{ 
                            fontWeight: 'bold',
                            mb: { xs: status === 'completed' ? 1 : 0, sm: 0 },
                            ml: { xs: 0, sm: status === 'completed' ? 1 : 0 }
                    }}>
                            {homeTeam.name} {prediction.homeScore} - {prediction.awayScore} {awayTeam.name}
                        </Typography>
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
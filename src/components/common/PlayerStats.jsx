import React from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Typography,
  Box,
  Chip,
  Divider,
  Paper,
  IconButton,
  useTheme
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  MilitaryTech as MvpIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { BsBullseye } from 'react-icons/bs';
import { TbCrystalBall } from 'react-icons/tb';
import { AiOutlineCloseCircle } from 'react-icons/ai';

const PlayerStats = ({ 
  player, 
  showScoreBreakdown = true,
  allowEditing = false,
  onEditMvp = () => {},
  onEditChampionship = () => {}
}) => {
  const currentDate = new Date();
  const editDeadline = new Date('2025-04-14T23:59:59');
  const canEdit = allowEditing && currentDate < editDeadline;
  const theme = useTheme();

  // Custom styling to align React icons with Material-UI icons
  const reactIconStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24
  };

  if (!player) return null;

  return (
    <Grid container spacing={3} justifyContent="center">
      {/* Main Predictions */}
      <Grid item xs={12} md={10}>
        <Typography variant="h6" gutterBottom align="center">
          Player Predictions
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 3, 
                mb: 3,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(232, 244, 253, 0.8)',
                borderColor: theme.palette.primary.main
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrophyIcon sx={{ color: 'gold' }} />
                  <Typography variant="body1" fontWeight="medium" sx={{ ml: 1 }}>
                    Championship Winner
                  </Typography>
                </Box>
                {canEdit && (
                  <IconButton 
                    size="small" 
                    color="primary" 
                    onClick={() => onEditChampionship(player)} 
                    sx={{ ml: 1 }}
                    aria-label="Edit championship prediction"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
              <Chip 
                label={player.championshipPrediction} 
                color="primary" 
                variant="outlined" 
                sx={{ fontWeight: 'medium', fontSize: '1rem' }}
              />
              {player.championship_team_points !== undefined && (
                <Typography variant="body2" fontWeight="medium" sx={{ mt: 2, color: theme.palette.primary.main }}>
                  {player.championship_team_points} points earned
                </Typography>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 3, 
                mb: 3,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(156, 39, 176, 0.08)' : 'rgba(243, 229, 245, 0.8)',
                borderColor: theme.palette.secondary.main
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MvpIcon sx={{ color: 'gold' }} />
                  <Typography variant="body1" fontWeight="medium" sx={{ ml: 1 }}>
                    MVP Prediction
                  </Typography>
                </Box>
                {canEdit && (
                  <IconButton 
                    size="small" 
                    color="secondary" 
                    onClick={() => onEditMvp(player)}
                    sx={{ ml: 1 }}
                    aria-label="Edit MVP prediction"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
              <Chip 
                label={player.mvpPrediction} 
                color="secondary" 
                variant="outlined" 
                sx={{ fontWeight: 'medium', fontSize: '1rem' }}
              />
              {player.mvp_points !== undefined && (
                <Typography variant="body2" fontWeight="medium" sx={{ mt: 2, color: theme.palette.secondary.main }}>
                  {player.mvp_points} points earned
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Grid>

      {/* Score Breakdown */}
      {showScoreBreakdown && (
        <Grid item xs={12} md={10}>
          <Typography variant="h6" gutterBottom align="center" sx={{ mb: 3 }}>
            Score Breakdown
          </Typography>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2.5, 
              mb: 4,
              bgcolor: theme.palette.background.paper
            }}
          >
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <div style={{ ...reactIconStyle, margin: '0 auto', marginBottom: '8px' }}>
                    <TbCrystalBall size={24} style={{ color: theme.palette.success.main }} />
                  </div>
                  <Typography variant="body2" color="text.secondary">Bulls-Eye</Typography>
                  <Typography variant="h6" color="success.main" fontWeight="bold">
                    {player.bullsEye || 0}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <div style={{ ...reactIconStyle, margin: '0 auto', marginBottom: '8px' }}>
                    <BsBullseye size={24} style={{ color: theme.palette.warning.main }} />
                  </div>
                  <Typography variant="body2" color="text.secondary">Hits</Typography>
                  <Typography variant="h6" color="warning.main" fontWeight="bold">
                    {player.hits || 0}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <div style={{ ...reactIconStyle, margin: '0 auto', marginBottom: '8px' }}>
                    <AiOutlineCloseCircle size={24} style={{ color: theme.palette.error.main }} />
                  </div>
                  <Typography variant="body2" color="text.secondary">Misses</Typography>
                  <Typography variant="h6" color="error.main" fontWeight="bold">
                    {player.misses || 0}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="subtitle1" fontWeight="medium">Total Score</Typography>
              <Typography variant="subtitle1" fontWeight="bold" color="primary">{player.score || 0} pts</Typography>
            </Box>
          </Paper>
        </Grid>
      )}
    </Grid>
  );
};

PlayerStats.propTypes = {
  player: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    championshipPrediction: PropTypes.string,
    mvpPrediction: PropTypes.string,
    bullsEye: PropTypes.number,
    hits: PropTypes.number,
    misses: PropTypes.number,
    score: PropTypes.number,
    championship_team_points: PropTypes.number,
    mvp_points: PropTypes.number,
    round_predictions_points: PropTypes.number
  }).isRequired,
  showScoreBreakdown: PropTypes.bool,
  allowEditing: PropTypes.bool,
  onEditMvp: PropTypes.func,
  onEditChampionship: PropTypes.func
};

export default PlayerStats;
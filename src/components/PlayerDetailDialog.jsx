import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Typography,
  Avatar,
  Box,
  Chip,
  IconButton,
  useMediaQuery,
  useTheme,
  Divider,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  EmojiEvents as TrophyIcon,
  MilitaryTech as MvpIcon
} from '@mui/icons-material';
import { BsBullseye } from 'react-icons/bs';
import { TbCrystalBall } from 'react-icons/tb';

const PlayerDetailDialog = ({ player, open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              width: 48, 
              height: 48, 
              mr: 2,
              bgcolor: theme.palette.primary.main
            }}
          >
            {player.name.charAt(0)}
          </Avatar>
          <Typography variant="h6">
            {player.name}
            {player.score !== undefined && (
              <Typography 
                component="span" 
                variant="h6" 
                color="primary" 
                sx={{ ml: 2, fontWeight: 'bold' }}
              >
                {player.score} pts
              </Typography>
            )}
          </Typography>
        </Box>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 3 }}>
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
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <TrophyIcon sx={{ color: 'gold' }} />
                    <Typography variant="body1" fontWeight="medium" sx={{ ml: 1 }}>
                      Championship Winner
                    </Typography>
                  </Box>
                  <Chip 
                    label={player.championshipPrediction} 
                    color="primary" 
                    variant="outlined" 
                    sx={{ fontWeight: 'medium', fontSize: '1rem' }}
                  />
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
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <MvpIcon sx={{ color: 'gold' }} />
                    <Typography variant="body1" fontWeight="medium" sx={{ ml: 1 }}>
                      MVP Prediction
                    </Typography>
                  </Box>
                  <Chip 
                    label={player.mvpPrediction} 
                    color="secondary" 
                    variant="outlined" 
                    sx={{ fontWeight: 'medium', fontSize: '1rem' }}
                  />
                </Paper>
              </Grid>
            
              <Grid item xs={12} md={6}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 3,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.08)' : 'rgba(237, 247, 237, 0.8)',
                    borderColor: theme.palette.success.main
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <div style={reactIconStyle}>
                      <TbCrystalBall size={20} style={{ color: theme.palette.success.main }} />
                    </div>
                    <Typography variant="body1" fontWeight="medium" sx={{ ml: 1 }}>
                      Bulls-Eye Predictions
                    </Typography>
                  </Box>
                  <Chip
                    label={`${player.bullsEye || 0} Bulls-Eye`}
                    color="success"
                    variant="outlined"
                    sx={{ fontWeight: 'medium', fontSize: '1rem' }}
                  />
                </Paper>
              </Grid>
            
              <Grid item xs={12} md={6}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 3,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(237, 108, 2, 0.08)' : 'rgba(255, 244, 229, 0.8)',
                    borderColor: theme.palette.warning.main
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <div style={reactIconStyle}>
                      <BsBullseye size={20} style={{ color: theme.palette.warning.main }} />
                    </div>
                    <Typography variant="body1" fontWeight="medium" sx={{ ml: 1 }}>
                      Outcome Hits Predictions
                    </Typography>
                  </Box>
                  <Chip
                    label={`${player.hits || 0} HITS`}
                    color="warning"
                    variant="outlined"
                    sx={{ fontWeight: 'medium', fontSize: '1rem' }}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

PlayerDetailDialog.propTypes = {
  player: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    championshipPrediction: PropTypes.string,
    mvpPrediction: PropTypes.string,
    bullsEye: PropTypes.number,
    hits: PropTypes.number,
    score: PropTypes.number
  }),
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default PlayerDetailDialog;
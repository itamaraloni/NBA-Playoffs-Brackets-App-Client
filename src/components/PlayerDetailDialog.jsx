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

const PlayerDetailDialog = ({ player, open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom align="center">
              Player Predictions
            </Typography>
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrophyIcon sx={{ color: 'gold', mr: 1 }} />
                <Typography variant="body1" fontWeight="medium">
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
            
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <MvpIcon sx={{ color: 'gold', mr: 1 }} />
                <Typography variant="body1" fontWeight="medium">
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
    score: PropTypes.number
  }),
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default PlayerDetailDialog;
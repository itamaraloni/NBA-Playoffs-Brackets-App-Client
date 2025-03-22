import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Avatar,
  IconButton,
  useMediaQuery,
  useTheme,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon
} from '@mui/icons-material';
import PlayerStats from './common/PlayerStats';

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
        <PlayerStats player={player} />
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
    misses: PropTypes.number,
    score: PropTypes.number,
    championship_team_points: PropTypes.number,
    mvp_points: PropTypes.number,
    round_predictions_points: PropTypes.number
  }),
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default PlayerDetailDialog;
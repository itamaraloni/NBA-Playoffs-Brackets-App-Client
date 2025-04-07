import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon
} from '@mui/icons-material';
import PlayerStatsCard from './PlayerStatsCard';
import UserServices from '../services/UserServices';

const PlayerDetailDialog = ({ player, leagueName, open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayerProfile = async () => {
      if (!player?.id) return;
      
      setLoading(true);
      try {
        const response = await UserServices.getPlayerProfile(player.id);
        setPlayerData(response.player);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch player profile:', err);
        setError('Failed to load player data');
        setLoading(false);
      }
    };

    if (open && player) {
      fetchPlayerProfile();
    }
  }, [player, open]);

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
        <Typography variant="h5">
          Player Dialog
        </Typography>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">{error}</Typography>
        ) : (
          <PlayerStatsCard 
            playerData={playerData || player}
            leagueData={{ name: leagueName }}
            elevation={0}
            allowEditing={false}
          />
        )}
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
    player_avatar: PropTypes.string,
    score: PropTypes.number,
    championship_team_points: PropTypes.number,
    mvp_points: PropTypes.number
  }),
  leagueName: PropTypes.string,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default PlayerDetailDialog;
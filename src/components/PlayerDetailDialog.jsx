import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Alert,
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

const BOT_INFO = {
  '100': 'Always bets on the favorite',
  '101': 'Bets randomly on each matchup',
};

const PlayerDetailDialog = ({ player, leagueName, open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !player) return;

    setPlayerData(null);
    setError(null);
    setLoading(true);

    const fetchPlayerProfile = async () => {
      try {
        const response = await UserServices.getPlayerProfile(player.id);
        setPlayerData(response.player);
      } catch (err) {
        console.error('Failed to fetch player profile:', err);
        setError('Failed to load player data');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerProfile();
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
        <Typography variant="h5" fontWeight={600}>
          {player?.name || 'Player Stats'}
        </Typography>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 3 }}>
        {BOT_INFO[player?.playerAvatar] && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {BOT_INFO[player.playerAvatar]}
          </Alert>
        )}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">{error}</Typography>
        ) : (
          <PlayerStatsCard
            playerData={playerData}
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
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }),
  leagueName: PropTypes.string,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default PlayerDetailDialog;
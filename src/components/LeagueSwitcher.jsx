import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  ExpandMore as ExpandIcon,
  Add as AddIcon,
  Login as JoinIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LeagueServices from '../services/LeagueServices';

const LeagueSwitcher = () => {
  const { userPlayers, activePlayer, switchActivePlayer } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const navigate = useNavigate();

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSwitchLeague = (playerId) => {
    switchActivePlayer(playerId);
    handleClose();
  };

  const handleCreateLeague = () => {
    navigate('/create-league');
    handleClose();
  };

  const handleOpenJoinDialog = () => {
    setJoinCode('');
    setJoinError('');
    setJoinDialogOpen(true);
    handleClose();
  };

  const handleJoinSubmit = async () => {
    if (!joinCode.trim()) {
      setJoinError('Please enter a league code');
      return;
    }
    if (!/^\d{6}$/.test(joinCode)) {
      setJoinError('League code must be a 6-digit number');
      return;
    }

    setJoinLoading(true);
    setJoinError('');

    try {
      const response = await LeagueServices.validateLeagueCode(joinCode);
      if (userPlayers.some(p => p.league_id === response.league_id)) {
        setJoinError("You're already a member of this league.");
        return;
      }
      localStorage.setItem('joinLeagueId', response.league_id);
      setJoinDialogOpen(false);
      navigate('/create-player');
    } catch (error) {
      setJoinError(error.message || 'Invalid league code. Please try again.');
    } finally {
      setJoinLoading(false);
    }
  };

  // Don't render if user has no leagues
  if (!activePlayer || userPlayers.length === 0) {
    return null;
  }

  // Format: "player_name | league_name"
  const displayText = `${activePlayer.player_name} | ${activePlayer.league_name}`;

  // Single league — show static text, no dropdown needed
  if (userPlayers.length === 1) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
        <TrophyIcon fontSize="small" />
        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
          {displayText}
        </Typography>
      </Box>
    );
  }

  // Multiple leagues — show dropdown switcher
  return (
    <>
      <Box sx={{ mr: 1 }}>
        <Button
          onClick={handleOpen}
          endIcon={<ExpandIcon />}
          startIcon={<TrophyIcon />}
          sx={{ textTransform: 'none', color: 'inherit' }}
        >
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body2" fontWeight="medium" noWrap sx={{ maxWidth: 200 }}>
              {displayText}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {userPlayers.length} leagues
            </Typography>
          </Box>
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: { minWidth: 250 }
          }}
        >
          <Typography variant="overline" sx={{ px: 2, color: 'text.secondary' }}>
            Your Leagues
          </Typography>

          {userPlayers.map((player) => (
            <MenuItem
              key={player.player_id}
              onClick={() => handleSwitchLeague(player.player_id)}
              selected={player.player_id === activePlayer.player_id}
            >
              <ListItemIcon>
                <TrophyIcon
                  fontSize="small"
                  color={player.player_id === activePlayer.player_id ? 'primary' : 'inherit'}
                />
              </ListItemIcon>
              <ListItemText
                primary={`${player.player_name} | ${player.league_name}`}
                secondary={`${player.total_points} points`}
              />
            </MenuItem>
          ))}

          <Divider />

          <MenuItem onClick={handleCreateLeague}>
            <ListItemIcon>
              <AddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Create New League" />
          </MenuItem>

          <MenuItem onClick={handleOpenJoinDialog}>
            <ListItemIcon>
              <JoinIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Join League" />
          </MenuItem>
        </Menu>
      </Box>

      <Dialog
        open={joinDialogOpen}
        onClose={() => setJoinDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Join a League</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the 6-digit code provided by the league commissioner:
          </Typography>
          <TextField
            fullWidth
            label="League Code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJoinSubmit()}
            error={!!joinError}
            helperText={joinError}
            placeholder="000000"
            inputProps={{ maxLength: 6 }}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialogOpen(false)} disabled={joinLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleJoinSubmit}
            disabled={joinLoading}
            startIcon={joinLoading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {joinLoading ? 'Checking...' : 'Join'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LeagueSwitcher;

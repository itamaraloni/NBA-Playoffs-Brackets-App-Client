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
  TextField
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  ExpandMore as ExpandIcon,
  Add as AddIcon,
  Login as JoinIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { extractTokenFromInput } from '../utils/inviteUtils';

const LeagueSwitcher = () => {
  const { userPlayers, activePlayer, switchActivePlayer } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinInput, setJoinInput] = useState('');
  const [joinError, setJoinError] = useState('');
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
    setJoinInput('');
    setJoinError('');
    setJoinDialogOpen(true);
    handleClose();
  };

  const handleJoinSubmit = () => {
    const token = extractTokenFromInput(joinInput);
    if (!token) {
      setJoinError('Please paste an invite link or token');
      return;
    }

    setJoinDialogOpen(false);
    navigate(`/invite/${token}`);
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
                secondary={`${player.total_score} points`}
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
            Paste an invite link or token from the league commissioner:
          </Typography>
          <TextField
            fullWidth
            label="Invite Link or Token"
            value={joinInput}
            onChange={(e) => setJoinInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJoinSubmit()}
            error={!!joinError}
            helperText={joinError}
            placeholder="Paste invite link or token"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleJoinSubmit}>
            Join
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LeagueSwitcher;

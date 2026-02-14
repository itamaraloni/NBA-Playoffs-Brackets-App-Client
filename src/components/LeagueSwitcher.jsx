import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  ExpandMore as ExpandIcon,
  Add as AddIcon,
  Login as JoinIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LeagueSwitcher = () => {
  const { userPlayers, activePlayer, switchActivePlayer } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
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

  const handleJoinLeague = () => {
    navigate('/dashboard');
    handleClose();
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

        <MenuItem onClick={handleJoinLeague}>
          <ListItemIcon>
            <JoinIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Join League" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default LeagueSwitcher;

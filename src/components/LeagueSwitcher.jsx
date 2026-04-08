import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
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
  useMediaQuery,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  EmojiEvents as TrophyIcon,
  SwitchAccount as SwitchAccountIcon,
  ExpandMore as ExpandIcon,
  Add as AddIcon,
  Login as JoinIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { extractTokenFromInput } from '../utils/inviteUtils';

const LeagueSwitcher = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
  const otherPlayers = userPlayers.filter((player) => player.player_id !== activePlayer.player_id);
  const isSingleLeague = userPlayers.length === 1;
  const joinDialog = (
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
  );
  const leagueActionItems = (
    <>
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
    </>
  );

  // Single league — show static text, no dropdown needed
  if (!isMobile && isSingleLeague) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: { md: 1 }, minWidth: 0 }}>
        <TrophyIcon fontSize="small" />
        <Typography variant="body2" noWrap sx={{ maxWidth: { xs: '100%', md: 200 }, minWidth: 0 }}>
          {displayText}
        </Typography>
      </Box>
    );
  }

  if (isMobile) {
    return (
      <>
        <Box sx={{ mr: { md: 1 }, minWidth: 0 }}>
          <IconButton
            onClick={handleOpen}
            color="inherit"
            size="small"
            aria-label="Switch player or league"
          >
            <SwitchAccountIcon />
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: { minWidth: 260 }
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SwitchAccountIcon color="primary" fontSize="small" />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={700} noWrap>
                  {activePlayer.player_name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {activePlayer.league_name}
                </Typography>
              </Box>
            </Box>
          </Box>

          {otherPlayers.length > 0 && (
            <Typography variant="overline" sx={{ px: 2, pt: 1.25, color: 'text.secondary', display: 'block' }}>
              Switch Player
            </Typography>
          )}

          {otherPlayers.map((player) => (
            <MenuItem
              key={player.player_id}
              onClick={() => handleSwitchLeague(player.player_id)}
            >
              <ListItemIcon>
                <SwitchAccountIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={player.player_name}
                secondary={player.league_name}
              />
            </MenuItem>
          ))}

          {leagueActionItems}
        </Menu>

        {joinDialog}
      </>
    );
  }

  // Multiple leagues — show dropdown switcher
  return (
    <>
      <Box sx={{ mr: { md: 1 }, width: { xs: '100%', md: 'auto' }, minWidth: 0 }}>
        <Button
          onClick={handleOpen}
          endIcon={<ExpandIcon />}
          startIcon={<TrophyIcon />}
          sx={{
            textTransform: 'none',
            color: 'inherit',
            width: { xs: '100%', md: 'auto' },
            minWidth: 0,
            justifyContent: isMobile ? 'space-between' : 'flex-start',
            px: { xs: 1, md: 1.5 },
          }}
        >
          <Box sx={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight="medium" noWrap sx={{ maxWidth: { xs: '100%', md: 200 } }}>
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

          {leagueActionItems}
        </Menu>
      </Box>

      {joinDialog}
    </>
  );
};

export default LeagueSwitcher;

import React, { useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { PLAYER_AVATARS } from '../../shared/GeneralConsts';
import BracketServices from '../../services/BracketServices';
import BracketView from './BracketView';
import { computeBracketHealth } from '../../utils/bracketUtils';

/**
 * Dialog for viewing league members' brackets after the deadline.
 * Shows a player list with bracket status; clicking a player loads their full bracket.
 */
const LeagueBracketsDialog = ({ open, onClose, leagueId, currentPlayerId }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  // Player list state
  const [players, setPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [playersError, setPlayersError] = useState(null);

  // Selected player's bracket state
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [bracketData, setBracketData] = useState(null);
  const [loadingBracket, setLoadingBracket] = useState(false);
  const [bracketError, setBracketError] = useState(null);

  // Fetch league bracket status when dialog opens
  useEffect(() => {
    if (!open || !leagueId) return;

    const fetchStatus = async () => {
      setLoadingPlayers(true);
      setPlayersError(null);
      try {
        const data = await BracketServices.getLeagueBracketStatus(leagueId);
        setPlayers(data.players);
      } catch (err) {
        console.error('Failed to fetch league bracket status:', err);
        setPlayersError('Failed to load league brackets.');
      } finally {
        setLoadingPlayers(false);
      }
    };

    fetchStatus();
  }, [open, leagueId]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedPlayer(null);
      setBracketData(null);
      setBracketError(null);
    }
  }, [open]);

  // Load a player's full bracket
  const handlePlayerClick = useCallback(async (player) => {
    if (!player.isBracketSubmitted) return;

    setSelectedPlayer(player);
    setLoadingBracket(true);
    setBracketError(null);
    setBracketData(null);

    try {
      const data = await BracketServices.getBracket(player.playerId, leagueId);
      setBracketData(data);
    } catch (err) {
      console.error('Failed to load player bracket:', err);
      setBracketError('Failed to load bracket.');
    } finally {
      setLoadingBracket(false);
    }
  }, [leagueId]);

  // Go back to player list
  const handleBack = useCallback(() => {
    setSelectedPlayer(null);
    setBracketData(null);
    setBracketError(null);
  }, []);

  const getAvatarSrc = (avatarId) =>
    PLAYER_AVATARS.find(a => a.id === avatarId)?.src;

  // -------------------------------------------------------------------------
  // Render: Player list view
  // -------------------------------------------------------------------------
  const renderPlayerList = () => {
    if (loadingPlayers) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (playersError) {
      return <Alert severity="error" sx={{ m: 2 }}>{playersError}</Alert>;
    }

    if (players.length === 0) {
      return (
        <Typography color="text.secondary" align="center" sx={{ p: 4 }}>
          No players found in this league.
        </Typography>
      );
    }

    // Sort: submitted first, then alphabetical
    const sorted = [...players].sort((a, b) => {
      if (a.isBracketSubmitted !== b.isBracketSubmitted) {
        return a.isBracketSubmitted ? -1 : 1;
      }
      return a.playerName.localeCompare(b.playerName);
    });

    return (
      <List disablePadding>
        {sorted.map((player) => {
          const isCurrentUser = player.playerId === currentPlayerId;

          return (
            <ListItemButton
              key={player.playerId}
              onClick={() => handlePlayerClick(player)}
              disabled={!player.isBracketSubmitted}
              sx={{
                py: 1.5,
                px: 2,
                bgcolor: isCurrentUser
                  ? alpha(theme.palette.primary.main, 0.06)
                  : 'transparent',
                '&:hover': {
                  bgcolor: player.isBracketSubmitted
                    ? alpha(theme.palette.primary.main, 0.1)
                    : undefined,
                },
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={getAvatarSrc(player.playerAvatar)}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: isCurrentUser
                      ? theme.palette.primary.main
                      : theme.palette.grey[300],
                  }}
                >
                  {player.playerName?.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography
                      variant="body1"
                      fontWeight={isCurrentUser ? 600 : 400}
                    >
                      {player.playerName}
                    </Typography>
                    {isCurrentUser && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        (You)
                      </Typography>
                    )}
                  </Box>
                }
                secondary={
                  player.isBracketSubmitted && player.bracketSubmittedAt
                    ? `Submitted ${new Date(player.bracketSubmittedAt).toLocaleDateString()}`
                    : null
                }
              />
              {player.isBracketSubmitted ? (
                <Chip
                  icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                  label="Submitted"
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
              ) : (
                <Chip
                  label="Not submitted"
                  size="small"
                  variant="outlined"
                  sx={{ color: 'text.secondary', fontWeight: 500 }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>
    );
  };

  // -------------------------------------------------------------------------
  // Render: Selected player's bracket view
  // -------------------------------------------------------------------------
  const renderBracketView = () => {
    if (loadingBracket) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (bracketError) {
      return <Alert severity="error" sx={{ m: 2 }}>{bracketError}</Alert>;
    }

    if (!bracketData) return null;

    const health = computeBracketHealth(bracketData, bracketData.scoringConfig);
    const bPicks = {
      championshipPick:       bracketData.championshipPick,
      mvpPick:                bracketData.mvpPick,
      championshipPickStatus: bracketData.championshipPickStatus,
      mvpPickStatus:          bracketData.mvpPickStatus,
      mvpPickTeam:            bracketData.mvpPickTeam,
    };

    return (
      <BracketView
        bracket={bracketData}
        isLocked
        predictedMatchups={bracketData.predictedMatchups}
        totalMatchups={bracketData.totalMatchups}
        deadline={bracketData.deadline}
        onMatchupClick={undefined}
        bracketHealth={health}
        viewingPlayerName={selectedPlayer?.playerId !== currentPlayerId ? selectedPlayer?.playerName : undefined}
        bonusPicks={bPicks}
        scoringConfig={bracketData.scoringConfig}
      />
    );
  };

  // -------------------------------------------------------------------------
  // Dialog title: player list or selected player name with back button
  // -------------------------------------------------------------------------
  const dialogTitle = selectedPlayer ? (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton
        size="small"
        onClick={handleBack}
        aria-label="back to player list"
      >
        <ArrowBackIcon />
      </IconButton>
      <Avatar
        src={getAvatarSrc(selectedPlayer.playerAvatar)}
        sx={{ width: 28, height: 28 }}
      >
        {selectedPlayer.playerName?.charAt(0)}
      </Avatar>
      <Typography variant="h6" noWrap>
        {selectedPlayer.playerName}'s Bracket
      </Typography>
    </Box>
  ) : (
    <Typography variant="h6">League Brackets</Typography>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          // On desktop, ensure dialog has good height for bracket viewing
          ...(!fullScreen && { minHeight: '70vh' }),
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
        }}
      >
        {dialogTitle}
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: selectedPlayer ? 2 : 0 }}>
        {selectedPlayer ? renderBracketView() : renderPlayerList()}
      </DialogContent>
    </Dialog>
  );
};

LeagueBracketsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  leagueId: PropTypes.string,
  currentPlayerId: PropTypes.string,
};

export default LeagueBracketsDialog;

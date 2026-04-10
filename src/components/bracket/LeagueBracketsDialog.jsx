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

const ADAM_SILVER_AVATAR = '/resources/commissioner/adam-silver.png';

const ACTUAL_BRACKET_ENTRY = {
  playerId: '__actual__',
  playerName: 'Adam Silver',
  playerAvatar: null,
  isBracketSubmitted: true,
  bracketSubmittedAt: null,
};

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

  // Load a player's full bracket (or the actual NBA bracket for Adam Silver)
  const handlePlayerClick = useCallback(async (player) => {
    if (!player.isBracketSubmitted) return;

    setSelectedPlayer(player);
    setLoadingBracket(true);
    setBracketError(null);
    setBracketData(null);

    try {
      const data = player.playerId === ACTUAL_BRACKET_ENTRY.playerId
        ? await BracketServices.getActualBracket()
        : await BracketServices.getBracket(player.playerId, leagueId);
      setBracketData(data);
    } catch (err) {
      console.error('Failed to load bracket:', err);
      setBracketError(err.status === 403
        ? 'You are not a member of this league.'
        : 'Failed to load bracket.');
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

  const getAvatarSrc = (player) =>
    player.playerId === ACTUAL_BRACKET_ENTRY.playerId
      ? ADAM_SILVER_AVATAR
      : PLAYER_AVATARS.find(a => a.id === player.playerAvatar)?.src;

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
        {/* Adam Silver — Actual NBA Bracket */}
        <ListItemButton
          onClick={() => handlePlayerClick(ACTUAL_BRACKET_ENTRY)}
          sx={{
            py: 1.5,
            px: 2,
            '&:hover': {
              bgcolor: alpha(theme.palette.warning.main, 0.08),
            },
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <ListItemAvatar>
            <Avatar
              src={ADAM_SILVER_AVATAR}
              sx={{
                width: 40,
                height: 40,
                bgcolor: theme.palette.warning.main,
              }}
            >
              AS
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography variant="body1" fontWeight={600}>
                Adam Silver
              </Typography>
            }
            secondary="NBA Commissioner — The Actual Bracket"
          />
          <Chip
            label="Official"
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 500,
              color: theme.palette.warning.main,
              borderColor: alpha(theme.palette.warning.main, 0.5),
            }}
          />
        </ListItemButton>

        <Divider sx={{ borderStyle: 'dashed' }} />

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
                  src={getAvatarSrc(player)}
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

    const isActual = bracketData.isActualBracket;
    const health = isActual ? null : computeBracketHealth(bracketData, bracketData.scoringConfig);
    const bPicks = isActual ? null : {
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
        stickyHeaderTop={0}
        isActualBracket={isActual}
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
        src={getAvatarSrc(selectedPlayer)}
        sx={{ width: 28, height: 28 }}
      >
        {selectedPlayer.playerName?.charAt(0)}
      </Avatar>
      <Typography variant="h6" component="span" noWrap>
        {selectedPlayer.playerName}'s Bracket
      </Typography>
    </Box>
  ) : (
    <Typography variant="h6" component="span">League Brackets</Typography>
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
      <DialogContent sx={{ p: selectedPlayer ? 2 : 0, ...(selectedPlayer && { pt: 0 }) }}>
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

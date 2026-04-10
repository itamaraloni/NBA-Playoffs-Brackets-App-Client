import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Button, CircularProgress, Alert, Typography,
  Menu, MenuItem, ListItemIcon, ListItemText, Divider,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  IconButton, Tooltip, useTheme, useMediaQuery,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import GroupsIcon from '@mui/icons-material/Groups';
import CasinoIcon from '@mui/icons-material/Casino';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BoltIcon from '@mui/icons-material/Bolt';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import IosShareIcon from '@mui/icons-material/IosShare';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useAuth } from '../contexts/AuthContext';
import { useAppTheme } from '../theme/ThemeProvider';
import BracketView from '../components/bracket/BracketView';
import PredictionDialog from '../components/bracket/PredictionDialog';
import LeagueBracketsDialog from '../components/bracket/LeagueBracketsDialog';
import BracketServices from '../services/BracketServices';
import { applyPick, countPicks, picksMatch, flattenBracketPicks, computeBracketHealth, randomFillBracket, clearAllPicks } from '../utils/bracketUtils';
import { PREDICTIONS_OPEN_DATE } from '../shared/SeasonConfig';
import { captureBracketImage, downloadBracketImage, shareBracketImage, copyBracketImage } from '../utils/bracketExport';

// PredictionDialog passes matchup.round (API key: 'playin_first', 'first', etc.)
// but applyPick / bracketUtils work with component round keys ('playin', 'r1', etc.)
const API_TO_COMPONENT_ROUND = {
  playin_first:      'playin',
  playin_second:     'survivor',
  first:             'r1',
  second:            'semis',
  conference_final:  'cf',
  final:             'final',
};

function formatPredictionsOpenText(dateString) {
  if (!dateString) return null;
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return null;

  const parts = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Jerusalem',
  }).formatToParts(parsed);

  const month = parts.find(part => part.type === 'month')?.value;
  const day = parts.find(part => part.type === 'day')?.value;
  const hour = parts.find(part => part.type === 'hour')?.value;
  const minute = parts.find(part => part.type === 'minute')?.value;
  const dayPeriod = parts.find(part => part.type === 'dayPeriod')?.value;

  if (!month || !day || !hour || !minute || !dayPeriod) return null;
  return `${month} ${day} at ${hour}:${minute} ${dayPeriod} Jerusalem time`;
}

const BracketPage = () => {
  // serverBracket: last confirmed server state — used to detect unsaved changes
  // bracketState:  live working copy that diverges from serverBracket during editing
  const [serverBracket, setServerBracket] = useState(null);
  const [bracketState, setBracketState]   = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [now, setNow]                     = useState(() => Date.now());

  // Dialog state
  const [dialogOpen, setDialogOpen]           = useState(false);
  const [selectedMatchup, setSelectedMatchup] = useState(null);

  // Submit in-flight guard
  const [submitting, setSubmitting] = useState(false);

  // League brackets dialog
  const [leagueBracketsOpen, setLeagueBracketsOpen] = useState(false);

  // Random fill
  const [randomFillAnchor, setRandomFillAnchor] = useState(null);
  const [confirmFillOpen, setConfirmFillOpen]   = useState(false);
  const [pendingStrategy, setPendingStrategy]   = useState('random');

  // Share / export
  const [exporting, setExporting]       = useState(false);
  const [shareAnchor, setShareAnchor]   = useState(null);

  const { activePlayer } = useAuth();
  const { mode: themeMode } = useAppTheme();
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // -------------------------------------------------------------------------
  // Load bracket on mount / league switch
  // -------------------------------------------------------------------------
  useEffect(() => {
    const loadBracket = async () => {
      if (!activePlayer) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await BracketServices.getBracket(
          activePlayer.player_id,
          activePlayer.league_id,
        );
        setServerBracket(data);
        setBracketState(data);
        setError(null);
      } catch (err) {
        setError('Failed to load bracket. Please try again later.');
        console.error('Error loading bracket:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBracket();
  }, [activePlayer]);

  // -------------------------------------------------------------------------
  // Derived state
  // -------------------------------------------------------------------------
  const predictedCount = useMemo(() => countPicks(bracketState), [bracketState]);
  const isComplete     = predictedCount === 21;

  const bracketHealth = useMemo(
    () => computeBracketHealth(bracketState, bracketState?.scoringConfig),
    [bracketState],
  );

  const bonusPicks = useMemo(() => {
    if (!bracketState) return null;
    return {
      championshipPick:       bracketState.championshipPick,
      mvpPick:                bracketState.mvpPick,
      championshipPickStatus: bracketState.championshipPickStatus,
      mvpPickStatus:          bracketState.mvpPickStatus,
      mvpPickTeam:            bracketState.mvpPickTeam,
    };
  }, [bracketState]);

  const predictionsOpenDate = bracketState?.predictionsOpenDate ?? PREDICTIONS_OPEN_DATE.toISOString();
  const predictionsOpenAt = useMemo(() => {
    const parsed = Date.parse(predictionsOpenDate);
    return Number.isNaN(parsed) ? null : parsed;
  }, [predictionsOpenDate]);
  const predictionsOpenLabel = useMemo(
    () => formatPredictionsOpenText(predictionsOpenDate),
    [predictionsOpenDate],
  );
  const deadlineAt = useMemo(() => {
    if (!bracketState?.deadline) return null;
    const parsed = Date.parse(bracketState.deadline);
    return Number.isNaN(parsed) ? null : parsed;
  }, [bracketState?.deadline]);
  const isPredictionsOpen = predictionsOpenAt === null || now >= predictionsOpenAt;
  const isBracketLocked = Boolean(
    bracketState?.isLocked || (deadlineAt !== null && now >= deadlineAt)
  );
  const isEditingEnabled = Boolean(bracketState && !isBracketLocked && isPredictionsOpen);
  const preOpenMessage = predictionsOpenLabel
    ? `Bracket submissions open ${predictionsOpenLabel}, after the regular season ends.`
    : 'Bracket submissions open after the regular season ends.';
  const preOpenInteractionHint = !isPredictionsOpen && !isBracketLocked ? preOpenMessage : null;

  useEffect(() => {
    if (!bracketState) return undefined;

    const pendingTransitions = [predictionsOpenAt, deadlineAt]
      .filter(timestamp => timestamp !== null && now < timestamp);
    if (pendingTransitions.length === 0) return undefined;

    const timeoutId = window.setTimeout(
      () => setNow(Date.now()),
      Math.max(0, Math.min(...pendingTransitions) - now),
    );

    return () => window.clearTimeout(timeoutId);
  }, [bracketState, predictionsOpenAt, deadlineAt, now]);

  const hasUnsavedChanges = useMemo(() => {
    if (!bracketState || isBracketLocked) return false;
    // Never-submitted bracket: any pick counts as unsaved
    if (!bracketState.isBracketSubmitted) return predictedCount > 0;
    // Submitted bracket: unsaved when React state differs from server snapshot
    return !picksMatch(bracketState, serverBracket);
  }, [bracketState, isBracketLocked, serverBracket, predictedCount]);

  useEffect(() => {
    if (!isEditingEnabled) {
      setDialogOpen(false);
      setRandomFillAnchor(null);
      setConfirmFillOpen(false);
    }
  }, [isEditingEnabled]);

  // -------------------------------------------------------------------------
  // Navigation guard — tab close / browser back button
  // (In-app nav guard requires createBrowserRouter; skipped here — beforeunload covers the critical case)
  useEffect(() => {
    const handler = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  const handleMatchupClick = useCallback((matchup) => {
    if (!isEditingEnabled) return;
    setSelectedMatchup(matchup);
    setDialogOpen(true);
  }, [isEditingEnabled]);

  const handlePredictWinner = (round, conference, matchupPosition, winnerTeamId, seriesScoreLoser) => {
    if (!isEditingEnabled) return;
    const roundKey = API_TO_COMPONENT_ROUND[round] ?? round;
    setBracketState(prev =>
      applyPick(prev, { round: roundKey, conference, matchupPosition, winnerTeamId, seriesScoreLoser })
    );
    setDialogOpen(false);
  };

  const handleSubmitBracket = async () => {
    if (!isComplete || submitting || !isPredictionsOpen || isBracketLocked) return;
    setSubmitting(true);
    try {
      const picks  = flattenBracketPicks(bracketState);
      const result = await BracketServices.submitBracket(
        activePlayer.player_id,
        activePlayer.league_id,
        picks,
      );
      const updated = {
        ...bracketState,
        isBracketSubmitted:  result.isBracketSubmitted,
        bracketSubmittedAt:  result.bracketSubmittedAt,
        predictedMatchups:   result.predictedMatchups,
      };
      setServerBracket(updated);
      setBracketState(updated);
      if (window.notify) window.notify.success('Bracket submitted! You can still edit until the deadline.');
    } catch (err) {
      if (window.notify) {
        window.notify.error(
          err?.status === 423
            ? (err.message || 'Bracket submission is not available.')
            : 'Failed to submit bracket. Please try again.',
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // Random fill handlers
  // -------------------------------------------------------------------------
  const handleRandomFill = useCallback((mode, strategy = 'random') => {
    if (!isEditingEnabled) return;
    setRandomFillAnchor(null);
    if (mode === 'clear') {
      if (predictedCount > 0) {
        setPendingStrategy('clear');
        setConfirmFillOpen(true);
      }
      return;
    }
    if (mode === 'all' && predictedCount > 0) {
      setPendingStrategy(strategy);
      setConfirmFillOpen(true);
      return;
    }
    setBracketState(prev => randomFillBracket(prev, mode, strategy));
  }, [isEditingEnabled, predictedCount]);

  const handleConfirmFillAll = useCallback(() => {
    if (!isEditingEnabled) return;
    setConfirmFillOpen(false);
    if (pendingStrategy === 'clear') {
      setBracketState(prev => clearAllPicks(prev));
    } else {
      setBracketState(prev => randomFillBracket(prev, 'all', pendingStrategy));
    }
  }, [isEditingEnabled, pendingStrategy]);

  // -------------------------------------------------------------------------
  // Share / export handlers
  // -------------------------------------------------------------------------
  const canExport = bracketState?.isBracketSubmitted && !exporting;

  const handleExport = useCallback(async (action) => {
    if (exporting) return;
    setShareAnchor(null);
    setExporting(true);
    try {
      const blob = await captureBracketImage({
        bracket: bracketState,
        bonusPicks,
        scoringConfig: bracketState.scoringConfig,
        isLocked: isBracketLocked,
        playerName: activePlayer.player_name,
        leagueName: activePlayer.league_name,
        themeMode,
      });

      if (action === 'share') {
        await shareBracketImage(blob, activePlayer.player_name);
      } else if (action === 'copy') {
        const copied = await copyBracketImage(blob);
        if (copied) {
          if (window.notify) window.notify.success('Bracket copied to clipboard!');
        } else {
          downloadBracketImage(blob, activePlayer.player_name);
          if (window.notify) window.notify.info('Clipboard unavailable — downloaded instead.');
        }
      } else {
        downloadBracketImage(blob, activePlayer.player_name);
      }
    } catch (err) {
      console.error('Export failed:', err);
      if (window.notify) window.notify.error('Failed to export bracket. Please try again.');
    } finally {
      setExporting(false);
    }
  }, [exporting, bracketState, bonusPicks, activePlayer, themeMode]);

  // -------------------------------------------------------------------------
  // Render guards
  // -------------------------------------------------------------------------
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!activePlayer) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Join a league to view your bracket.
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!bracketState) return null;

  // -------------------------------------------------------------------------
  // Submit button label / icon
  // -------------------------------------------------------------------------
  const isSubmitted      = bracketState.isBracketSubmitted && !hasUnsavedChanges;
  const submitIcon       = isSubmitted ? <CheckCircleIcon /> : <RocketLaunchIcon />;
  const submitLabel      = isSubmitted
    ? 'Submitted ✓'
    : isComplete
      ? 'Submit Bracket'
      : `${predictedCount}/21 complete`;

  return (
    <>
      {/* Unsaved picks banner */}
      {hasUnsavedChanges && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Your picks are not saved until you click Submit.
        </Alert>
      )}

      {/* Bracket display */}
      <BracketView
        bracket={bracketState}
        isLocked={isBracketLocked}
        predictedMatchups={predictedCount}
        totalMatchups={bracketState.totalMatchups}
        deadline={bracketState.deadline}
        predictionsOpenDate={predictionsOpenDate}
        interactionHint={preOpenInteractionHint}
        onMatchupClick={isEditingEnabled ? handleMatchupClick : undefined}
        bracketHealth={bracketHealth}
        bonusPicks={bonusPicks}
        scoringConfig={bracketState.scoringConfig}
        actionButtons={
          <>
            {/* Share — visible in both locked and unlocked modes */}
            {isMobile ? (
              <Tooltip title="Share Bracket">
                <span>{/* span wrapper so Tooltip works on disabled button */}
                  <IconButton
                    onClick={() => handleExport('share')}
                    disabled={!canExport}
                    color="primary"
                  >
                    {exporting ? <CircularProgress size={20} /> : <IosShareIcon />}
                  </IconButton>
                </span>
              </Tooltip>
            ) : (
              <Button
                variant="outlined"
                size="medium"
                onClick={(e) => setShareAnchor(e.currentTarget)}
                disabled={!canExport}
                startIcon={exporting ? <CircularProgress size={18} /> : <IosShareIcon />}
              >
                Share
              </Button>
            )}

            {isBracketLocked && (
              <Button
                variant="outlined"
                size="medium"
                onClick={() => setLeagueBracketsOpen(true)}
                startIcon={<GroupsIcon />}
              >
                League Brackets
              </Button>
            )}
            {!isBracketLocked && (
              <>
                {isPredictionsOpen && (
                  isMobile ? (
                    <Tooltip title="Random Fill">
                      <IconButton
                        onClick={(e) => setRandomFillAnchor(e.currentTarget)}
                        color="primary"
                      >
                        <CasinoIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Button
                      variant="outlined"
                      size="medium"
                      onClick={(e) => setRandomFillAnchor(e.currentTarget)}
                      startIcon={<CasinoIcon />}
                    >
                      Random Fill
                    </Button>
                  )
                )}
                <Tooltip
                  title={!isPredictionsOpen ? preOpenMessage : ''}
                  enterTouchDelay={0}
                  leaveTouchDelay={2000}
                >
                  <span>
                    <Button
                      variant="contained"
                      size="medium"
                      onClick={handleSubmitBracket}
                      disabled={!isComplete || submitting || isSubmitted || !isEditingEnabled}
                      startIcon={submitIcon}
                    >
                      {submitLabel}
                    </Button>
                  </span>
                </Tooltip>
              </>
            )}
          </>
        }
      />

      {/* Prediction dialog */}
      <PredictionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        matchup={selectedMatchup}
        onSubmit={handlePredictWinner}
      />

      {/* League brackets comparison dialog */}
      <LeagueBracketsDialog
        open={leagueBracketsOpen}
        onClose={() => setLeagueBracketsOpen(false)}
        leagueId={activePlayer.league_id}
        currentPlayerId={activePlayer.player_id}
      />

      {/* Share menu (desktop only) */}
      <Menu
        anchorEl={shareAnchor}
        open={Boolean(shareAnchor)}
        onClose={() => setShareAnchor(null)}
      >
        <MenuItem onClick={() => handleExport('download')}>
          <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Download Image</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport('copy')}>
          <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Copy to Clipboard</ListItemText>
        </MenuItem>
      </Menu>

      {/* Random fill menu */}
      <Menu
        anchorEl={randomFillAnchor}
        open={Boolean(randomFillAnchor)}
        onClose={() => setRandomFillAnchor(null)}
      >
        <MenuItem onClick={() => handleRandomFill('all')}>
          <ListItemIcon><ShuffleIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Fill All</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleRandomFill('remaining')}>
          <ListItemIcon><AutoFixHighIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Fill Remaining</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleRandomFill('all', 'favorites')}>
          <ListItemIcon><TrendingUpIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Favorites Win</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleRandomFill('all', 'upsets')}>
          <ListItemIcon><BoltIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Upsets Bracket</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleRandomFill('clear')} disabled={predictedCount === 0}>
          <ListItemIcon><DeleteSweepIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Clear All</ListItemText>
        </MenuItem>
      </Menu>

      {/* Confirmation dialog for Fill All / Clear All when picks exist */}
      <Dialog open={confirmFillOpen} onClose={() => setConfirmFillOpen(false)}>
        <DialogTitle>{pendingStrategy === 'clear' ? 'Clear all picks?' : 'Replace all picks?'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingStrategy === 'clear'
              ? `This will clear your ${predictedCount} existing prediction${predictedCount !== 1 ? 's' : ''}. You'll start with an empty bracket.`
              : `This will replace your ${predictedCount} existing prediction${predictedCount !== 1 ? 's' : ''} with new picks. You can still edit individual matchups afterward.`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmFillOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmFillAll} variant="contained" color={pendingStrategy === 'clear' ? 'error' : 'primary'}>
            {pendingStrategy === 'clear' ? 'Clear All' : 'Replace All'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BracketPage;

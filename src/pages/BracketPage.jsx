import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Button, CircularProgress, Alert, Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { useAuth } from '../contexts/AuthContext';
import BracketView from '../components/BracketView';
import PredictionDialog from '../components/PredictionDialog';
import BracketServices from '../services/BracketServices';
import { applyPick, countPicks, picksMatch, flattenBracketPicks } from '../utils/bracketUtils';

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

const BracketPage = () => {
  // serverBracket: last confirmed server state — used to detect unsaved changes
  // bracketState:  live working copy that diverges from serverBracket during editing
  const [serverBracket, setServerBracket] = useState(null);
  const [bracketState, setBracketState]   = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  // Dialog state
  const [dialogOpen, setDialogOpen]           = useState(false);
  const [selectedMatchup, setSelectedMatchup] = useState(null);

  // Submit in-flight guard
  const [submitting, setSubmitting] = useState(false);

  const { activePlayer } = useAuth();

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

  const hasUnsavedChanges = useMemo(() => {
    if (!bracketState || bracketState.isLocked) return false;
    // Never-submitted bracket: any pick counts as unsaved
    if (!bracketState.isBracketSubmitted) return predictedCount > 0;
    // Submitted bracket: unsaved when React state differs from server snapshot
    return !picksMatch(bracketState, serverBracket);
  }, [bracketState, serverBracket, predictedCount]);

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
    setSelectedMatchup(matchup);
    setDialogOpen(true);
  }, []);

  const handlePredictWinner = (round, conference, matchupPosition, winnerTeamId, seriesScoreLoser) => {
    const roundKey = API_TO_COMPONENT_ROUND[round] ?? round;
    setBracketState(prev =>
      applyPick(prev, { round: roundKey, conference, matchupPosition, winnerTeamId, seriesScoreLoser })
    );
    setDialogOpen(false);
  };

  const handleSubmitBracket = async () => {
    if (!isComplete || submitting) return;
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
        isBracketSubmitted:  result.is_bracket_submitted,
        bracketSubmittedAt:  result.bracket_submitted_at,
        predictedMatchups:   result.predicted_matchups,
      };
      setServerBracket(updated);
      setBracketState(updated);
      if (window.notify) window.notify.success('Bracket submitted! You can still edit until the deadline.');
    } catch (err) {
      if (window.notify) {
        window.notify.error(
          err?.status === 423
            ? 'Bracket is locked — the deadline has passed.'
            : 'Failed to submit bracket. Please try again.',
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

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

      {/* Submit button row — hidden when bracket is locked */}
      {!bracketState.isLocked && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            size="medium"
            onClick={handleSubmitBracket}
            disabled={!isComplete || submitting || isSubmitted}
            startIcon={submitIcon}
          >
            {submitLabel}
          </Button>
        </Box>
      )}

      {/* Bracket display */}
      <BracketView
        bracket={bracketState}
        isLocked={bracketState.isLocked}
        predictedMatchups={predictedCount}
        totalMatchups={bracketState.totalMatchups}
        deadline={bracketState.deadline}
        onMatchupClick={bracketState.isLocked ? undefined : handleMatchupClick}
      />

      {/* Prediction dialog */}
      <PredictionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        matchup={selectedMatchup}
        onSubmit={handlePredictWinner}
      />
    </>
  );
};

export default BracketPage;

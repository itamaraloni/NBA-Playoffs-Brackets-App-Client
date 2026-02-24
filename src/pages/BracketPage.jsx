import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import BracketView from '../components/BracketView';
import BracketServices from '../services/BracketServices';

const BracketPage = () => {
  // serverBracket: the last confirmed server state (used to detect unsaved changes in Phase 1-F-c)
  // bracketState:  live working copy (will diverge from serverBracket during editing in Phase 1-F-c)
  // For Phase 1-F-b both are identical — no editing yet.
  const [serverBracket, setServerBracket] = useState(null);
  const [bracketState, setBracketState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { activePlayer } = useAuth();

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
          activePlayer.league_id
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

  return (
    <BracketView
      bracket={bracketState}
      isLocked={bracketState.isLocked}
      predictedMatchups={bracketState.predictedMatchups}
      totalMatchups={bracketState.totalMatchups}
      deadline={bracketState.deadline}
    />
  );
};

export default BracketPage;

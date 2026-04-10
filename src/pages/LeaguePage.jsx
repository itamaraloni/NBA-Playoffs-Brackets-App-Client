import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import StandingsTable from '../components/StandingsTable';
import GlobalRankings from '../components/GlobalRankings';
import ScoringRules from '../components/common/ScoringRules';
import League from '../components/League';
import LeagueInsights from '../components/LeagueInsights';
import PlayerDetailDialog from '../components/PlayerDetailDialog';
import LeagueServices from '../services/LeagueServices';
import { useAuth } from '../contexts/AuthContext';

const LeaguePage = () => {
  const { activePlayer } = useAuth();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leagueData, setLeagueData] = useState(null);
  const [error, setError] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [pickDistribution, setPickDistribution] = useState(null);
  const [pickDistributionError, setPickDistributionError] = useState(null);
  const [globalRankings, setGlobalRankings] = useState(null);

  // Get player_id and league_id from active player context
  const currentPlayerId = activePlayer?.player_id;
  const leagueId = activePlayer?.league_id;

  // Fetch all league page data in parallel
  useEffect(() => {
    if (!leagueId) {
      setError('No league selected. Please join or create a league from the Dashboard.');
      setLoading(false);
      return;
    }

    const fetchPageData = async () => {
      setLoading(true);

      const [leagueResult, pickResult, globalResult] = await Promise.allSettled([
        LeagueServices.getLeagueWithPlayers(leagueId),
        LeagueServices.getPickDistribution(leagueId),
        LeagueServices.getGlobalRankings(leagueId),
      ]);

      // League data is critical — page-level error if it fails
      if (leagueResult.status === 'fulfilled') {
        setLeagueData(leagueResult.value);
      } else {
        setError(leagueResult.reason?.message || 'Failed to load league data');
      }

      // Pick distribution is supplementary — section-level error only
      if (pickResult.status === 'fulfilled') {
        setPickDistribution(pickResult.value);
      } else {
        setPickDistributionError(pickResult.reason?.message || 'Failed to load pick distribution');
      }

      // Global rankings are supplementary — banner simply won't render on failure
      if (globalResult.status === 'fulfilled') {
        setGlobalRankings(globalResult.value);
      }

      setLoading(false);
    };

    fetchPageData();
  }, [leagueId]);

  const isCommissioner = activePlayer?.is_commissioner;

  // Copy invite link to clipboard
  const copyInviteLink = () => {
    if (leagueData?.inviteToken) {
      const link = `${window.location.origin}/invite/${leagueData.inviteToken}`;
      navigator.clipboard.writeText(link).then(() => {
        setSnackbarMessage('Invite link copied to clipboard!');
        setOpenSnackbar(true);
      }).catch(() => {
        // Fallback for older browsers
        const textField = document.createElement('textarea');
        textField.value = link;
        textField.setAttribute('readonly', '');
        textField.style.position = 'absolute';
        textField.style.left = '-9999px';
        document.body.appendChild(textField);
        textField.select();
        document.execCommand('copy');
        document.body.removeChild(textField);
        setSnackbarMessage('Invite link copied to clipboard!');
        setOpenSnackbar(true);
      });
    }
  };

  // Regenerate invite link (commissioner only)
  const handleRegenerateInvite = async () => {
    try {
      setRegenerating(true);
      const response = await LeagueServices.regenerateInvite(leagueId);
      setLeagueData(prev => ({ ...prev, inviteToken: response.inviteToken }));
      setSnackbarMessage('Invite link regenerated! Old links are now invalid.');
      setOpenSnackbar(true);
    } catch (err) {
      console.error('Failed to regenerate invite:', err);
      if (window.notify) {
        window.notify.error(err.message || 'Failed to regenerate invite link');
      }
    } finally {
      setRegenerating(false);
    }
  };

  // Handle player selection
  const handlePlayerSelect = (playerId) => {
    if (leagueData?.players) {
      const player = leagueData.players.find(p => p.id === playerId);
      if (player) {
        setSelectedPlayer(player);
        setDetailDialogOpen(true);
      }
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      </Container>
    );
  }

  if (!leagueData) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="info">No league data available.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {leagueData.name}
      </Typography>

      {/* Player Standings Table */}
      <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
        Player Standings
      </Typography>
      <StandingsTable
        players={leagueData.players}
        currentPlayerId={currentPlayerId}
        onPlayerSelect={handlePlayerSelect}
      />

      {/* League Insights — champion & MVP pick distribution */}
      <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
        League Insights
      </Typography>
      <LeagueInsights
        pickDistribution={pickDistribution}
        currentPlayer={leagueData.players.find(p => p.id === currentPlayerId)}
        loading={loading}
        error={pickDistributionError}
      />

      {/* League Information */}
      <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
        League Information
      </Typography>
      
      {/* Use League component for main information */}
      <League
        league={leagueData}
        currentPlayerId={currentPlayerId}
        showPlayers={false}
        onCopyInviteLink={copyInviteLink}
        onRegenerateInvite={handleRegenerateInvite}
        isCommissioner={isCommissioner}
        regenerating={regenerating}
      />
      
      {/* Scoring Rules Section */}
      <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
        Scoring Rules
      </Typography>
      <ScoringRules showTitle={false} />

      {/* Global Rankings — top 10 across all leagues */}
      {globalRankings && (
        <>
          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
            Global Rankings
          </Typography>
          <GlobalRankings globalRankings={globalRankings} />
        </>
      )}

      {/* Player Detail Dialog */}
      <PlayerDetailDialog 
        player={selectedPlayer}
        leagueName={leagueData.name}
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
      />

      {/* Snackbar for copy notification */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LeaguePage;

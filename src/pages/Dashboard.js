import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Snackbar,
  Alert,
  Button,
  Box,
  CircularProgress
} from '@mui/material';
import PlayerStatsCard from '../components/PlayerStatsCard';
import EditPicksDialog from '../components/EditPicksDialog';
import AppExplanation from '../components/AppExplanation';
import UserServices from '../services/UserServices';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { activePlayer, userPlayers } = useAuth();
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [isLoading, setIsLoading] = useState(false);
  const [playerProfile, setPlayerProfile] = useState(null);
  const [playerProfileLoading, setPlayerProfileLoading] = useState(true);
  const [playerProfileError, setPlayerProfileError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editType, setEditType] = useState('championship'); // 'championship' or 'mvp'

  const playerId = activePlayer?.player_id;
  const isPlayerless = userPlayers.length === 0;
  const navigate = useNavigate();

  // Fetch player profile if player ID exists
  useEffect(() => {
    const fetchPlayerProfile = async () => {
      if (!playerId) {
        setPlayerProfileLoading(false);
        return;
      }
      
      try {
        setPlayerProfileLoading(true);
        const data = await UserServices.getPlayerProfile(playerId);
        setPlayerProfile(data);
        setPlayerProfileError(null);
      } catch (err) {
        console.error('Error fetching player profile:', err);
        setPlayerProfileError('Failed to load player statistics. Please try again.');
      } finally {
        setPlayerProfileLoading(false);
      }
    };
    
    fetchPlayerProfile();
  }, [playerId]);

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const handleEditPicks = (type) => {
    setEditType(type);
    setEditDialogOpen(true);
  };

  const handleSavePick = async (type, selection) => {
    try {
      setIsLoading(true);
      console.log('Saving pick:', type, selection);
      const updatePicksResponse = await UserServices.updatePicks(type, selection, playerId);
      
      if (updatePicksResponse.error) {
        throw new Error(updatePicksResponse.error);
      }

      // Show success message
      window.notify.success(`Your ${type === 'mvp' ? 'MVP' : 'Championship'} pick has been updated!`);
      
      // Refresh player profile data
      const data = await UserServices.getPlayerProfile(playerId);
      setPlayerProfile(data);
      setEditDialogOpen(false);
    } catch (err) {
      console.error('Error updating prediction:', err);
      setAlert({
        open: true,
        message: 'Failed to update prediction. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (playerProfileLoading && playerId) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading player data...</Typography>
      </Container>
    );
  }

  // Existing player content
  const renderExistingPlayerContent = () => {
    // Handle error state for player profile
    if (playerProfileError) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Alert severity="error" sx={{ mb: 2, mx: 'auto', maxWidth: 500 }}>
            {playerProfileError}
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Box>
      );
    }
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <PlayerStatsCard 
            playerData={playerProfile?.player}
            leagueData={playerProfile?.league}
            onEditPicks={handleEditPicks}
          />
        </Grid>
      </Grid>
    );
  };

  // Format player data for EditPicksDialog
  const formattedPlayerData = playerProfile?.player ? {
    name: playerProfile.player.name,
    championshipPrediction: playerProfile.player.winningTeam,
    mvpPrediction: playerProfile.player.mvp
  } : null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Show player stats if user has an active league */}
      {playerId ? renderExistingPlayerContent() : (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" gutterBottom>No active league</Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            Create or join a league to see your stats here.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/profile')}>
            Go to Profile
          </Button>

          {isPlayerless && (
            <Box sx={{ mt: 5, textAlign: 'left' }}>
              <AppExplanation elevation={1} />
            </Box>
          )}
        </Box>
      )}

      {/* Edit Picks Dialog */}
      <EditPicksDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        type={editType}
        player={formattedPlayerData}
        onSave={handleSavePick}
      />

      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity}
          sx={{ 
            width: '100%',
            maxWidth: '400px',
            boxShadow: 3,
            '& .MuiAlert-action': { alignItems: 'center' }
          }}
          action={
            <Button color="inherit" size="small" onClick={handleCloseAlert}>
              Click to continue
            </Button>
          }
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;

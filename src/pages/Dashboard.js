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
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import AppExplanation from '../components/AppExplanation';
import { CreateLeagueSection, JoinLeagueSection } from '../components/CreateJoinLeagueComponents';
import PlayerStatsCard from '../components/PlayerStatsCard';
import EditPicksDialog from '../components/EditPicksDialog';
import LeagueServices from '../services/LeagueServices';
import UserServices from '../services/UserServices';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [leagueCode, setLeagueCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [playerProfile, setPlayerProfile] = useState(null);
  const [playerProfileLoading, setPlayerProfileLoading] = useState(true);
  const [playerProfileError, setPlayerProfileError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editType, setEditType] = useState(null); // 'championship' or 'mvp'
  
  const playerId = localStorage.getItem('player_id');
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

  const handleCreateLeague = () => {
    navigate('/create-league');
  };

  const handleJoinLeague = async () => {
    if (!leagueCode.trim()) {
      setCodeError('Please enter a league code');
      return;
    }

    // Validate that the code is a 6-digit number
    const codeRegex = /^\d{6}$/;
    if (!codeRegex.test(leagueCode)) {
      setCodeError('League code must be a 6-digit number');
      return;
    }

    setIsLoading(true);
    setCodeError('');

    try {
      // Call the actual API to validate the league code
      const response = await LeagueServices.validateLeagueCode(leagueCode);
      
      // If we get here, the code is valid - store the league ID
      localStorage.setItem('joinLeagueId', response.league_id);

      // Show success message
      setAlert({
        open: true,
        message: 'League joined successfully! Proceeding to player creation.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error joining league:', error);
      setCodeError(error.message || 'Error joining league. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
    navigate('/create-player'); // Navigate after user acknowledges
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

  // New user content (no player ID)
  const renderNewUserContent = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <CreateLeagueSection onCreateClick={handleCreateLeague} />
      </Grid>
      <Grid item xs={12} md={6}>
        <JoinLeagueSection 
          leagueCode={leagueCode}
          setLeagueCode={setLeagueCode}
          codeError={codeError}
          isLoading={isLoading}
          onJoinClick={handleJoinLeague}
        />
      </Grid>
      <Grid item xs={12}>
        <AppExplanation elevation={2} />
      </Grid>
    </Grid>
  );

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
    championshipPrediction: playerProfile.player.winning_team,
    mvpPrediction: playerProfile.player.mvp
  } : null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography 
        variant="h4" 
        fontWeight="bold" 
        sx={{ mb: isMobile ? 3 : 4 }}
      >
        NBA Playoff Predictions
      </Typography>
      
      {playerId ? renderExistingPlayerContent() : renderNewUserContent()}

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
        anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
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
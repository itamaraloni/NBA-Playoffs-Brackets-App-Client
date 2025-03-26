import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Snackbar,
  Alert,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import AppExplanation from '../components/AppExplanation';
import { CreateLeagueSection, JoinLeagueSection } from '../components/CreateJoinLeagueComponents';
import { LeagueStatsSection, UpcomingGamesSection } from '../components/DashboardComponents';
import LeagueServices from '../services/LeagueServices';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [leagueCode, setLeagueCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const playerId = localStorage.getItem('player_id');
  const navigate = useNavigate();

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
  const renderExistingPlayerContent = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <LeagueStatsSection onViewLeagueClick={() => navigate('/league')} />
      </Grid>
      <Grid item xs={12} md={6}>
        <UpcomingGamesSection onViewGamesClick={() => navigate('/predictions')} />
      </Grid>
    </Grid>
  );

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
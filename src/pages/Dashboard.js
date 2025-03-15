import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import AppExplanation from '../components/AppExplanation';
import { CreateLeagueSection, JoinLeagueSection } from '../components/CreateJoinLeagueComponents';
import { LeagueStatsSection, UpcomingGamesSection } from '../components/DashboardComponents';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser } = useAuth();
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

    setIsLoading(true);
    setCodeError('');

    try {
      // TODO: Replace with actual API call
      console.log(`Checking league code: ${leagueCode}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dummy validation - in real implementation, this would be a backend call
      const isValidCode = leagueCode.length >= 6;
      
      if (isValidCode) {
        // Store league ID for use in CreatePlayerPage
        localStorage.setItem('joinLeagueId', 'dummy-league-id');
        navigate('/create-player');
      } else {
        setCodeError('League not found. Please check the code and try again.');
      }
    } catch (error) {
      console.error('Error joining league:', error);
      setCodeError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
    </Container>
  );
};

export default Dashboard;
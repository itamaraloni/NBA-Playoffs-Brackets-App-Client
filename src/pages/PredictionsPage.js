import React, { useState, useEffect } from 'react';
import { 
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MatchupPredictionCard from '../components/MatchupPredictionCard';
import { useAuth } from '../contexts/AuthContext';
import { getMatchups, submitPrediction, updateMatchupScore } from '../services/MatchupServices';

// Tab Panel component for accessibility
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`matchup-tabpanel-${index}`}
      aria-labelledby={`matchup-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Helper function for tab accessibility
function a11yProps(index) {
  return {
    id: `matchup-tab-${index}`,
    'aria-controls': `matchup-tabpanel-${index}`,
  };
}

const PredictionsPage = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [matchups, setMatchups] = useState({
    upcoming: [],
    inProgress: [],
    completed: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Load matchups on component mount
  useEffect(() => {
    const loadMatchups = async () => {
      try {
        setLoading(true);
        const data = await getMatchups();
        
        // Organize matchups by status
        const organized = {
          upcoming: data.filter(m => m.status === 'upcoming'),
          inProgress: data.filter(m => m.status === 'in-progress'),
          completed: data.filter(m => m.status === 'completed')
        };
        
        setMatchups(organized);
        setError(null);
      } catch (err) {
        setError('Failed to load matchups. Please try again later.');
        console.error('Error loading matchups:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMatchups();
    console.log("Current user from AuthContext:", user);
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleSubmitPrediction = async (prediction) => {
    try {
      await submitPrediction(prediction);
      
      // For testing, update local state to simulate backend update
      const updatedMatchups = { ...matchups };
      const matchupIndex = updatedMatchups.upcoming.findIndex(
        m => m.homeTeam.name === prediction.homeTeam && m.awayTeam.name === prediction.awayTeam
      );
      
      if (matchupIndex !== -1) {
        updatedMatchups.upcoming[matchupIndex] = {
          ...updatedMatchups.upcoming[matchupIndex],
          predictedHomeScore: prediction.homeScore,
          predictedAwayScore: prediction.awayScore
        };
        setMatchups(updatedMatchups);
      }

    } catch (err) {
      setError('Failed to submit prediction. Please try again.');
      console.error('Error submitting prediction:', err);
    }
  };

  const handleUpdateScore = async (scoreUpdate) => {
    try {
      await updateMatchupScore(scoreUpdate);
      
      // Create copies of all arrays to avoid direct state mutation
      const upcomingCopy = [...matchups.upcoming];
      const inProgressCopy = [...matchups.inProgress];
      const completedCopy = [...matchups.completed];
      
      // Find the matchup in in-progress list
      const matchupIndex = inProgressCopy.findIndex(
        m => m.homeTeam.name === scoreUpdate.homeTeam && m.awayTeam.name === scoreUpdate.awayTeam
      );
      
      if (matchupIndex !== -1) {
        // Update the score
        inProgressCopy[matchupIndex] = {
          ...inProgressCopy[matchupIndex],
          actualHomeScore: scoreUpdate.homeScore,
          actualAwayScore: scoreUpdate.awayScore
        };
        
        // Determine if status should change
        if (scoreUpdate.homeScore === 4 || scoreUpdate.awayScore === 4) {
          const matchupToMove = inProgressCopy[matchupIndex];
          
          // Remove from in-progress
          inProgressCopy.splice(matchupIndex, 1);
          
          // Update status and add to completed
          completedCopy.push({
            ...matchupToMove,
            status: 'completed'
          });
        }
        
        // Update state with new arrays
        setMatchups({
          upcoming: upcomingCopy,
          inProgress: inProgressCopy,
          completed: completedCopy
        });
      }
    } catch (err) {
      setError('Failed to update score. Please try again.');
      console.error('Error updating score:', err);
    }
  };

  const renderMatchups = (matchupList) => {
    if (matchupList.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No matchups available in this category.
          </Typography>
        </Box>
      );
    }

    return matchupList.map((matchup, index) => (
      <MatchupPredictionCard
        key={`${matchup.homeTeam.name}-${matchup.awayTeam.name}-${index}`}
        homeTeam={matchup.homeTeam}
        awayTeam={matchup.awayTeam}
        status={matchup.status}
        actualHomeScore={matchup.actualHomeScore}
        actualAwayScore={matchup.actualAwayScore}
        predictedHomeScore={matchup.predictedHomeScore}
        predictedAwayScore={matchup.predictedAwayScore}
        onSubmitPrediction={handleSubmitPrediction}
        isAdmin={user?.is_admin}
        onUpdateScore={handleUpdateScore}
      />
    ));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        NBA Playoff Predictions
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabIndex} 
              onChange={handleTabChange} 
              aria-label="matchup tabs"
              variant={isMobile ? "fullWidth" : "standard"}
              centered={!isMobile}
            >
              <Tab 
                label={`Upcoming (${matchups.upcoming.length})`} 
                {...a11yProps(0)} 
              />
              <Tab 
                label={`In Progress (${matchups.inProgress.length})`} 
                {...a11yProps(1)} 
              />
              <Tab 
                label={`Completed (${matchups.completed.length})`} 
                {...a11yProps(2)} 
              />
            </Tabs>
          </Box>
          
          <TabPanel value={tabIndex} index={0}>
            {renderMatchups(matchups.upcoming)}
          </TabPanel>
          
          <TabPanel value={tabIndex} index={1}>
            {renderMatchups(matchups.inProgress)}
          </TabPanel>
          
          <TabPanel value={tabIndex} index={2}>
            {renderMatchups(matchups.completed)}
          </TabPanel>
        </Box>
      )}
    </Container>
  );
};

export default PredictionsPage;
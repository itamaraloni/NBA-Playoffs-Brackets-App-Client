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
import MatchupDetailsDialog from '../components/MatchupDetailsDialog';
import MatchupServices from '../services/MatchupServices';
import { useAuth } from '../contexts/AuthContext';

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
  
  // League predictions dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMatchup, setSelectedMatchup] = useState(null);
  const [leaguePredictions, setLeaguePredictions] = useState([]);
  
  const { user, isAdmin } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Load matchups on component mount
  useEffect(() => {
    const loadMatchups = async () => {
      const playerId = localStorage.getItem('player_id');
      if (!playerId) {
        setLoading(false);
        return; // Exit early without making API call
      }

      try {
        setLoading(true);
        const data = await MatchupServices.getMatchups();
        
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
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleSubmitPrediction = async (prediction) => {
    try {
      const response = await MatchupServices.submitPrediction(prediction);
      
      console.log('Prediction response:', response);
      // Show success notification
      if (window.notify) {
        window.notify.success('Prediction submitted successfully!');
      }
      
      // Update local state to simulate backend update
      const updatedMatchups = { ...matchups };
      const matchupIndex = updatedMatchups.upcoming.findIndex(
        m => m.id === prediction.matchupId
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
      
      // Show error notification
      if (window.notify) {
        window.notify.error('Failed to submit prediction');
      }
    }
  };

  const handleUpdateScore = async (scoreUpdate) => {
    try {
      const response = await MatchupServices.updateMatchupScore(scoreUpdate);
      
      // Show success notification
      if (window.notify) {
        window.notify.success('Score updated successfully!');
      }
      
      // Create copies of all arrays to avoid direct state mutation
      const upcomingCopy = [...matchups.upcoming];
      const inProgressCopy = [...matchups.inProgress];
      const completedCopy = [...matchups.completed];
      
      // Find the matchup in in-progress list by matchup ID
      const matchupIndex = inProgressCopy.findIndex(
        m => m.id === scoreUpdate.matchupId
      );
      
      if (matchupIndex !== -1) {
        // Update the score
        inProgressCopy[matchupIndex] = {
          ...inProgressCopy[matchupIndex],
          actualHomeScore: scoreUpdate.homeScore,
          actualAwayScore: scoreUpdate.awayScore
        };
        
        // Determine if status should change
        if (response.status === 'completed' ||
           (scoreUpdate.homeScore === 4 || scoreUpdate.awayScore === 4)
        ) {
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
      
      // Show error notification
      if (window.notify) {
        window.notify.error('Failed to update score');
      }
    }
  };

  /*
   This function is passed to MatchupPredictionCard and called after successful activating an upcoming matchup
   to re-render the updated data
  */
  const handleMatchupActivated = async () => {
    const data = await MatchupServices.getMatchups();
    
    const organized = {
      upcoming: data.filter(m => m.status === 'upcoming'),
      inProgress: data.filter(m => m.status === 'in-progress'),
      completed: data.filter(m => m.status === 'completed')
    };
    
    setMatchups(organized);
    setTabIndex(1); // Switch to In Progress tab
  };

  // This function is passed to MatchupPredictionCard and called when
  // "View League Predictions" button is clicked
  const handleViewDetails = async (matchup) => {
    // Store the entire matchup object including the round
    setSelectedMatchup(matchup);
    setDialogOpen(true);
    
    try {
      const leagueId = localStorage.getItem('league_id');
      
      if (!leagueId) {
        console.error("No league ID available");
        if (window.notify) {
          window.notify.error('Unable to load predictions: No league found');
        }
        return;
      }
  
      // Fetch league predictions
      const result = await MatchupServices.getMatchupPredictions(
        matchup.id,
        leagueId
      );
      
      setLeaguePredictions(result.predictions);
      
      // Pass stats in the matchup object
      // Preserve the round property explicitly when updating
      setSelectedMatchup(prevMatchup => ({
        ...prevMatchup,
        round: matchup.round,
        predictionStats: result.stats
      }));
  
    } catch (error) {
      console.error("Error fetching league predictions:", error);
      setLeaguePredictions([]);
      
      if (window.notify) {
        window.notify.error('Failed to load league predictions');
      }
    }
  };

  // Close the league predictions dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedMatchup(null);
  };

  // Render matchup cards
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
        key={`${matchup.id}-${index}`}
        matchupId={matchup.id}
        homeTeam={matchup.homeTeam}
        awayTeam={matchup.awayTeam}
        status={matchup.status}
        actualHomeScore={matchup.actualHomeScore}
        actualAwayScore={matchup.actualAwayScore}
        predictedHomeScore={matchup.predictedHomeScore}
        predictedAwayScore={matchup.predictedAwayScore}
        round={matchup.round}
        onSubmitPrediction={handleSubmitPrediction}
        isAdmin={isAdmin}
        onUpdateScore={handleUpdateScore}
        onViewDetails={handleViewDetails}
        onActivateMatchup={handleMatchupActivated}
      />
    ));
  };

  // In PredictionsPage.js - modify renderCompletedMatchups
  const renderCompletedMatchups = () => {
    if (matchups.completed.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No matchups available in this category.
          </Typography>
        </Box>
      );
    }

    // Group by round
    const groupedByRound = {};
    matchups.completed.forEach(matchup => {
      const round = getRoundDisplay(matchup.round) || 'first';

      if (!groupedByRound[round]) {
        groupedByRound[round] = [];
      }

      groupedByRound[round].push(matchup);
    });

    // Render groups
    return Object.entries(groupedByRound)
      .sort(([roundA], [roundB]) => parseInt(roundA) - parseInt(roundB))
      .map(([round, matchupsList]) => (
        <Box key={`round-${round}`} sx={{ mb: 4, textAlign: 'center'}}>
          <Typography variant="h6" sx={{ mb: 2 }}>{round}</Typography>
          {matchupsList.map((matchup, index) => (
            <MatchupPredictionCard
              key={`${matchup.id}-${index}`}
              matchupId={matchup.id}
              homeTeam={matchup.homeTeam}
              awayTeam={matchup.awayTeam}
              status={matchup.status}
              actualHomeScore={matchup.actualHomeScore}
              actualAwayScore={matchup.actualAwayScore}
              predictedHomeScore={matchup.predictedHomeScore}
              predictedAwayScore={matchup.predictedAwayScore}
              round={matchup.round}
              onSubmitPrediction={handleSubmitPrediction}
              isAdmin={isAdmin}
              onUpdateScore={handleUpdateScore}
              onViewDetails={handleViewDetails}
              onActivateMatchup={handleMatchupActivated}
            />
          ))}
        </Box>
      ));
  };

    /**
   * Get round display text
   */
    const getRoundDisplay = (round) => {
      switch (round) {
        case "playin_first": return "Play-In First Round"
        case "playin_second": return "Play-In Second Round"
        case "first": return "First Round";
        case "second": return "Conference Semifinals";
        case "conference_final": return "Conference Finals";
        case "final": return "NBA Finals";
        default: return `Round ${round}`;
      }
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
            {renderCompletedMatchups()}
          </TabPanel>
        </Box>
      )}

      {/* League Predictions Dialog */}
      <MatchupDetailsDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        matchup={selectedMatchup}
        leaguePredictions={leaguePredictions}
      />
    </Container>
  );
};

export default PredictionsPage;
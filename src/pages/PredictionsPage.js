import React, { useState, useEffect } from 'react';
import { 
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import MatchupPredictionCard from '../components/MatchupPredictionCard';
import MatchupDetailsDialog from '../components/MatchupDetailsDialog';
import MatchupServices from '../services/MatchupServices';
import { useAuth } from '../contexts/AuthContext';
import { getDeadlineTimestamp } from '../utils/deadlineUtils';

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

const ROUND_ORDER = {
  playin_first: 0,
  playin_second: 1,
  first: 2,
  second: 3,
  conference_final: 4,
  final: 5,
};

const COMPLETED_ROUND_ORDER = Object.keys(ROUND_ORDER)
  .sort((a, b) => ROUND_ORDER[b] - ROUND_ORDER[a]);

const getRoundDisplay = (round) => {
  switch (round) {
    case 'playin_first': return 'Play-In First Round';
    case 'playin_second': return 'Play-In Second Round';
    case 'first': return 'First Round';
    case 'second': return 'Conference Semifinals';
    case 'conference_final': return 'Conference Finals';
    case 'final': return 'NBA Finals';
    default: return `Round ${round}`;
  }
};

const compareByPredictionDeadline = (a, b) => {
  const aTimestamp = a.predictionDeadlineAt ? getDeadlineTimestamp(a.predictionDeadlineAt) : null;
  const bTimestamp = b.predictionDeadlineAt ? getDeadlineTimestamp(b.predictionDeadlineAt) : null;

  if (aTimestamp == null && bTimestamp == null) return 0;
  if (aTimestamp == null) return 1;
  if (bTimestamp == null) return -1;
  return aTimestamp - bTimestamp;
};

const compareCompletedMatchups = (a, b) => {
  const roundDelta = (ROUND_ORDER[b.round] ?? Number.MIN_SAFE_INTEGER) - (ROUND_ORDER[a.round] ?? Number.MIN_SAFE_INTEGER);
  if (roundDelta !== 0) return roundDelta;

  const deadlineDelta = compareByPredictionDeadline(a, b);
  if (deadlineDelta !== 0) return deadlineDelta;

  return String(a.id).localeCompare(String(b.id));
};

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
  const [expandedCompletedRound, setExpandedCompletedRound] = useState(undefined);
  
  const { activePlayer } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const completedRoundGroups = COMPLETED_ROUND_ORDER
    .map((roundKey) => ({
      roundKey,
      roundLabel: getRoundDisplay(roundKey),
      matchupsList: matchups.completed.filter((matchup) => matchup.round === roundKey)
    }))
    .filter((group) => group.matchupsList.length > 0);

  // Load matchups on component mount or when active player changes
  useEffect(() => {
    const loadMatchups = async () => {
      if (!activePlayer) {
        setLoading(false);
        return; // Exit early without making API call
      }

      try {
        setLoading(true);
        const data = await MatchupServices.getMatchups(activePlayer.player_id);
        
        // Organize matchups by status
        const organized = {
          upcoming: data
            .filter(m => m.status === 'upcoming')
            .sort(compareByPredictionDeadline),
          inProgress: data.filter(m => m.status === 'in-progress'),
          completed: data.filter(m => m.status === 'completed').sort(compareCompletedMatchups)
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
  }, [activePlayer]);

  useEffect(() => {
    if (!isMobile || completedRoundGroups.length === 0) {
      return;
    }

    if (expandedCompletedRound === undefined) {
      setExpandedCompletedRound(completedRoundGroups[0].roundKey);
      return;
    }

    if (expandedCompletedRound && !completedRoundGroups.some((group) => group.roundKey === expandedCompletedRound)) {
      setExpandedCompletedRound(completedRoundGroups[0].roundKey);
    }
  }, [isMobile, expandedCompletedRound, completedRoundGroups]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleSubmitPrediction = async (prediction) => {
    try {
      const response = await MatchupServices.submitPrediction(prediction, activePlayer.player_id);
      
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
      console.error('Error submitting prediction:', err);

      if (window.notify) {
        // 423 = prediction deadline has passed — show the server's specific message
        if (err.status === 423) {
          window.notify.error(err.message);
        } else {
          window.notify.error('Failed to submit prediction');
        }
      }
    }
  };

  // This function is passed to MatchupPredictionCard and called when
  // "View League Predictions" button is clicked
  const handleViewDetails = async (matchup) => {
    // Store the entire matchup object including the round
    setSelectedMatchup(matchup);
    setDialogOpen(true);
    
    try {
      const leagueId = activePlayer?.league_id;

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
        const message = error.status === 403
          ? 'You are not a member of this league'
          : 'Failed to load league predictions';
        window.notify.error(message);
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
            No matchups available
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
        predictionDeadlineAt={matchup.predictionDeadlineAt}
        onSubmitPrediction={handleSubmitPrediction}
        onViewDetails={handleViewDetails}
      />
    ));
  };

  const renderCompletedMatchups = () => {
    if (matchups.completed.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No matchups available
          </Typography>
        </Box>
      );
    }

    if (isMobile) {
      return completedRoundGroups.map(({ roundKey, roundLabel, matchupsList }) => (
        <Accordion
          key={`round-${roundKey}`}
          disableGutters
          expanded={expandedCompletedRound === roundKey}
          onChange={(_, isExpanded) => setExpandedCompletedRound(isExpanded ? roundKey : null)}
          sx={{
            mb: 1.5,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden',
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              px: 2,
              py: 0.5,
              bgcolor: theme.palette.action.hover,
              '& .MuiAccordionSummary-content': {
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
              }
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              {roundLabel}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {matchupsList.length} matchup{matchupsList.length !== 1 ? 's' : ''}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, py: 1.5 }}>
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
                onViewDetails={handleViewDetails}
              />
            ))}
          </AccordionDetails>
        </Accordion>
      ));
    }

    return completedRoundGroups.map(({ roundKey, roundLabel, matchupsList }) => (
        <Box key={`round-${roundKey}`} sx={{ mb: 4, textAlign: 'center'}}>
          <Typography variant="h6" sx={{ mb: 2 }}>{roundLabel}</Typography>
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
              onViewDetails={handleViewDetails}
            />
          ))}
        </Box>
      ));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        noWrap
        sx={{
          mb: 3,
          textAlign: 'center',
          fontSize: { xs: '1.35rem', sm: '2.125rem' },
        }}
      >
        NBA Playoffs Live Picks
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

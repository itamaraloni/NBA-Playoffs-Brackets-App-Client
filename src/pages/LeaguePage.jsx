import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  CircularProgress
} from '@mui/material';
import StandingsTable from '../components/StandingsTable';
import ScoringRules from '../components/common/ScoringRules';
import League from '../components/League';
import PlayerDetailDialog from '../components/PlayerDetailDialog';

const LeaguePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leagueData, setLeagueData] = useState(null);
  const [error, setError] = useState(null);
  
  // Get player_id and league_id from localStorage
  const currentPlayerId = localStorage.getItem('player_id');
  const leagueId = localStorage.getItem('league_id');
  
  // Fetch league data from API
  useEffect(() => {
    const fetchLeagueData = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // Example: const response = await fetch(`http://127.0.0.1:5000/league/${leagueId}`);
        
        // Using mock data for now
        setTimeout(() => {
          const mockLeague = {
            id: 'league1',
            name: 'NBA Fanatics League',
            isActive: true,
            code: 'NBAPLAY2025',
            playerCount: 4,
            players: [
              { 
                id: 'player1', 
                name: 'BasketballFan23',
                championshipPrediction: 'Boston Celtics',
                mvpPrediction: 'Jayson Tatum',
                leagueId: 'league1',
                score: 125,
                championship_team_points: 50,
                mvp_points: 30,
                round_predictions_points: 45,
                bullsEye: 2,
                hits: 3,
                misses: 4
              },
              { 
                id: 'player2', 
                name: 'HoopMaster',
                championshipPrediction: 'Denver Nuggets',
                mvpPrediction: 'Nikola Jokić',
                leagueId: 'league1',
                score: 50,
                championship_team_points: 0,
                mvp_points: 0,
                round_predictions_points: 50,
                bullsEye: 1,
                hits: 2,
                misses: 3
              },
              { 
                id: 'player3', 
                name: 'LakersNation',
                championshipPrediction: 'Los Angeles Lakers',
                mvpPrediction: 'LeBron James',
                leagueId: 'league1',
                score: 75,
                championship_team_points: 0,
                mvp_points: 0,
                round_predictions_points: 75,
                bullsEye: 3,
                hits: 4,
                misses: 0
              },
              { 
                id: '27b8a1b5-0678-11f0-bbbe-5424f67f2c00', 
                name: 'Current Player',
                championshipPrediction: 'Milwaukee Bucks',
                mvpPrediction: 'Giannis Antetokounmpo',
                leagueId: 'league1',
                score: 30,
                championship_team_points: 0,
                mvp_points: 0,
                round_predictions_points: 30,
                bullsEye: 0,
                hits: 3,
                misses: 2
              }
            ]
          };
          
          setLeagueData(mockLeague);
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        console.error('Failed to fetch league data:', err);
        setError('Failed to load league data. Please try again later.');
        setLoading(false);
      }
    };
    
    if (leagueId) {
      fetchLeagueData();
    } else {
      setError('No league selected. Please join or create a league.');
      setLoading(false);
    }
  }, [leagueId]);
  
  // Copy league code to clipboard
  const copyLeagueCode = () => {
    if (leagueData?.code) {
      navigator.clipboard.writeText(leagueData.code);
      setOpenSnackbar(true);
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
      
      {/* League Information */}
      <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
        League Information
      </Typography>
      
      {/* Use League component for main information */}
      <League 
        league={leagueData}
        currentPlayerId={currentPlayerId}
        showPlayers={false}
        onCopyCode={copyLeagueCode}
      />
      
      {/* Scoring Rules Section */}
      <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
        Scoring Rules
      </Typography>
      <ScoringRules showTitle={false} />

      {/* Player Detail Dialog */}
      <PlayerDetailDialog 
        player={selectedPlayer}
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
          League code copied to clipboard!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LeaguePage;
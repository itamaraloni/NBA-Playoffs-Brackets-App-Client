import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme
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
  
  // Mock data for a league the player is already in
  const mockLeague = {
    id: 'league1',
    name: 'NBA Fanatics League',
    season: '2024-2025',
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
        score: 125
      },
      { 
        id: 'player2', 
        name: 'HoopMaster',
        championshipPrediction: 'Denver Nuggets',
        mvpPrediction: 'Nikola Jokić',
        leagueId: 'league1',
        score: 110
      },
      { 
        id: 'player3', 
        name: 'LakersNation',
        championshipPrediction: 'Los Angeles Lakers',
        mvpPrediction: 'LeBron James',
        leagueId: 'league1',
        score: 95
      },
      { 
        id: 'player4', 
        name: 'Current Player',
        championshipPrediction: 'Milwaukee Bucks',
        mvpPrediction: 'Giannis Antetokounmpo',
        leagueId: 'league1',
        score: 80
      }
    ]
  };
  
  // Assume the current player's ID
  const currentPlayerId = 'player4';
  
  // Copy league code to clipboard
  const copyLeagueCode = () => {
    navigator.clipboard.writeText(mockLeague.code);
    setOpenSnackbar(true);
  };

  // Handle player selection
  const handlePlayerSelect = (playerId) => {
    const player = mockLeague.players.find(p => p.id === playerId);
    if (player) {
      setSelectedPlayer(player);
      setDetailDialogOpen(true);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {mockLeague.name}
      </Typography>

      {/* Player Standings Table */}
      <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
        Player Standings
      </Typography>
      <StandingsTable 
        players={mockLeague.players} 
        currentPlayerId={currentPlayerId}
        onPlayerSelect={handlePlayerSelect} 
      />
      
      {/* League Information */}
      <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
        League Information
      </Typography>
      
      {/* Use League component for main information */}
      <League 
        league={mockLeague}
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
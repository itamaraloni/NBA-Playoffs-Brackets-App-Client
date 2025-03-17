import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Grid,
  Paper,
  Avatar,
  Alert,
  CircularProgress,
  useTheme,
  Card,
  CardActionArea,
  CardContent,
  Divider,
  Snackbar,
  Autocomplete
} from '@mui/material';
import {
  SportsMma as SportsMmaIcon,
  EmojiEvents as EmojiEventsIcon,
  Save as SaveIcon
} from '@mui/icons-material';

// NBA Teams that are likely to win the champoinship
const nbaTeams = [
  'Boston Celtics',
  'Oklahoma City Thunder',
  'Cleveland Cavaliers',
  'Los Angels Lakers',
  'Denver Nuggets',
  'Golden State Warriors',
  'New York Knicks',
  'Milwaukee Bucks'
];

// MVP Candidates
const mvpCandidates = [
  'Jayson Tatum',
  'Jaylen Brown',
  'Shai Gilgeous-Alexander',
  'Jalen Williams',
  'Nikola Jokić',
  'Stephen Curry',
  'Luka Dončić',
  'LeBron James',
  'Giannis Antetokounmpo',
  'Damian Lillard',
  'Anthony Edwards',
  'Kevin Durant',
  'Jalen Brunson',
  'Karl-Anthony Towns',
  'Donovan Mitchell',
  'Other'
];

// Avatar options
const avatarOptions = [
  { id: 1, src: '/resources/player-avatars/steph.png', alt: 'Stephan Curry' },
  { id: 2, src: '/resources/player-avatars/jokic.png', alt: 'Nikola Jokic' },
  { id: 3, src: '/resources/player-avatars/deni.png', alt: 'Deni Avdija' },
  { id: 4, src: '/resources/player-avatars/casspi.png', alt: 'Omri Casspi' },
  { id: 5, src: '/resources/player-avatars/draymond.png', alt: 'Draymond Green' }
];

const CreatePlayerPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedMVP, setSelectedMVP] = useState(null);
  const [otherMVP, setOtherMVP] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!playerName || !selectedAvatar || !selectedTeam || !selectedMVP || 
        (selectedMVP === 'Other' && !otherMVP)) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Send player data to backend API
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser?.uid,
          playerName,
          avatar: avatarOptions.find(opt => opt.id === selectedAvatar)?.src,
          championshipTeam: selectedTeam,
          mvpPick: selectedMVP === 'Other' ? otherMVP : selectedMVP,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create player');
      }

      setAlert({
        open: true,
        message: 'Player created successfully',
        severity: 'success'
      });
      
      // Navigate to dashboard after short delay
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      console.error('Error creating player:', error);
      setError('Failed to create player. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          borderRadius: 2,
          bgcolor: 'background.paper'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight="bold">
          Create Your Player
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4 }} align="center" color="text.secondary">
          Set up your player profile, choose an avatar that best suits you, and make your predictions for the winners of the 2025 playoffs.
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Player Information
          </Typography>
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="playerName"
            label="Player Name"
            name="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            sx={{ mb: 3 }}
          />
          
          <Typography 
            variant="h6" 
            component="h2" 
            gutterBottom 
            sx={{ 
              mt: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <SportsMmaIcon color="primary" /> Choose Your Fighter
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {avatarOptions.map((avatar) => (
              <Grid item xs={6} sm={4} key={avatar.id}>
                <Card 
                  elevation={selectedAvatar === avatar.id ? 8 : 1}
                  sx={{ 
                    borderRadius: 2,
                    border: selectedAvatar === avatar.id 
                      ? `2px solid ${theme.palette.primary.main}` 
                      : '2px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <CardActionArea onClick={() => setSelectedAvatar(selectedAvatar === avatar.id ? null : avatar.id)}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      p: 2,
                      bgcolor: selectedAvatar === avatar.id 
                        ? theme.palette.mode === 'dark' 
                          ? 'rgba(66, 66, 66, 0.5)' 
                          : 'rgba(224, 242, 254, 0.5)' 
                        : 'transparent'
                    }}>
                      <Avatar
                        src={avatar.src}
                        alt={avatar.alt}
                        sx={{ 
                          width: 80, 
                          height: 80,
                          border: selectedAvatar === avatar.id 
                            ? `2px solid ${theme.palette.primary.main}` 
                            : 'none'
                        }}
                      />
                    </Box>
                    <CardContent sx={{ py: 1, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {avatar.alt}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography 
            variant="h6" 
            component="h2" 
            gutterBottom
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <EmojiEventsIcon color="primary" /> NBA Championship and MVP Picks
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This can later be updated in your profile settings, until the playoffs begin and the bets are closed.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                id="championship-team"
                options={nbaTeams}
                fullWidth
                value={selectedTeam}
                onChange={(event, newValue) => {
                  setSelectedTeam(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="NBA Championship Team"
                    required
                    variant="outlined"
                    margin="normal"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                id="mvp-player"
                options={mvpCandidates}
                fullWidth
                value={selectedMVP}
                onChange={(event, newValue) => {
                  setSelectedMVP(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Finals MVP Pick"
                    required
                    variant="outlined"
                    margin="normal"
                  />
                )}
              />
            </Grid>
          </Grid>
          
          {selectedMVP === 'Other' && (
            <TextField
              label="Custom MVP Pick"
              variant="outlined"
              fullWidth
              required
              value={otherMVP}
              onChange={(e) => setOtherMVP(e.target.value)}
              margin="normal"
              sx={{ mt: 2 }}
            />
          )}
          
          <Box sx={{ mt: 4 }}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 2 }}
              >
                {error}
              </Alert>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              sx={{ 
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create Player'}
            </Button>
          </Box>
        </Box>
      </Paper>
      
      <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreatePlayerPage;
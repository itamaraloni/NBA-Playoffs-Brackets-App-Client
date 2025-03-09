import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import Paper from '@mui/material/Paper';
import { useAuth } from '../contexts/AuthContext';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import './CreatePlayerPage.css';

// NBA Teams that are likely to qualify for playoffs
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

// Avatar options - You can adjust this list manually based on your files
const avatarOptions = [
    '/resources/player-avatars/avatar-1.png',
    '/resources/player-avatars/avatar-2.png',
    '/resources/player-avatars/avatar-3.png'
];

const CreatePlayerPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedMVP, setSelectedMVP] = useState(null);
  const [otherMVP, setOtherMVP] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!playerName || !selectedAvatar || !selectedTeam || !selectedMVP || 
        (selectedMVP === 'Other' && !otherMVP)) {
      setAlert({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    setIsSubmitting(true);

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
          avatar: selectedAvatar,
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
      setAlert({
        open: true,
        message: 'Failed to create player. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <Container component="main" className="create-player-container">
      <Paper elevation={3} className="player-form-paper">
        <Typography component="h1" variant="h4" className="page-title">
          Create Your Player
        </Typography>
        <Typography variant="subtitle1" className="page-subtitle">
          Set up your player profile, choose an avatar that best suits you, and make your predictions for the winners of the 2025 playoffs.
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} className="player-form">
          <TextField
            label="Player Name"
            variant="outlined"
            fullWidth
            required
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            margin="normal"
          />
          
          <Typography variant="h6" className="section-title">
            Choose your fighter *
          </Typography>
          <Box className="avatar-selection">
            {avatarOptions.map((avatar, index) => (
              <Box
                key={index}
                className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
                onClick={() => setSelectedAvatar(avatar)}
              >
                <img src={avatar} alt={`Avatar ${index + 1}`} />
              </Box>
            ))}
          </Box>
          
          <Box sx={{ width: '100%', mb: 4 }}>
            <Typography variant="h6" className="section-title">
              NBA Championship and MVP Picks *
            </Typography>
            <Typography variant="h7" className="page-subtitle">
              This can later be updated in your profile settings, until the playoffs rampage begins and the bets are closed.
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
          </Box>
          
          {selectedMVP === 'Other' && (
            <TextField
              label="Custom MVP Pick"
              variant="outlined"
              fullWidth
              required
              value={otherMVP}
              onChange={(e) => setOtherMVP(e.target.value)}
              margin="normal"
            />
          )}
          
          <Box className="submit-button-container">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={isSubmitting}
              className="submit-button"
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
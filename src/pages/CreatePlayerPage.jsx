import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import LeagueServices from '../services/LeagueServices';
import { PLAYER_AVATARS } from '../shared/GeneralConsts';
import { useTeams } from '../hooks/useTeams';
import { useMvpCandidates } from '../hooks/useMvpCandidates';

const CreatePlayerPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { refreshLeagueData } = useAuth();
  const { teams, loading: teamsLoading } = useTeams();
  const { mvpCandidates, loading: mvpLoading } = useMvpCandidates();

  const teamOptions = (teams || [])
    .map(t => ({ name: t.name, points: t.championshipPoints }))
    .sort((a, b) => a.points - b.points);
  const mvpOptions = (mvpCandidates || [])
    .map(c => ({ name: c.name, points: c.mvpPoints }))
    .sort((a, b) => a.points - b.points);

  // Invite token: try navigation state first, fall back to sessionStorage (survives page refresh)
  const inviteToken = location.state?.inviteToken || sessionStorage.getItem('pendingInviteToken');

  // Persist invite token in sessionStorage so it survives page refresh
  useEffect(() => {
    if (location.state?.inviteToken) {
      sessionStorage.setItem('pendingInviteToken', location.state.inviteToken);
    }
  }, [location.state?.inviteToken]);

  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedMVP, setSelectedMVP] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!playerName || !selectedAvatar || !selectedTeam || !selectedMVP) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let token = inviteToken;
      let messageToDisplay = '';
      const leagueSetup = localStorage.getItem('leagueSetup');

      if (leagueSetup) {
        // Create-league flow: create the league, then join via its invite token
        const { name: leagueName } = JSON.parse(leagueSetup);

        const createLeagueResponse = await LeagueServices.createLeague({
          league_name: leagueName,
        });

        if (createLeagueResponse.message === 'error') {
          throw new Error('Failed to create league');
        }

        localStorage.removeItem('leagueSetup');
        messageToDisplay = 'League created successfully';
        token = createLeagueResponse.inviteToken;
      }

      // Guard: ensure we have a valid invite token before calling the API
      if (!token) {
        setError('Your invite session has expired. Please use your invite link again to join a league.');
        setIsSubmitting(false);
        return;
      }

      // Join via invite token (both create-league and join-league flows)
      const playerData = {
        name: playerName,
        player_avatar: String(selectedAvatar),
        championship_team: selectedTeam,
        mvp: selectedMVP,
      };
      const createPlayerResponse = await LeagueServices.joinViaInvite(token, playerData);

      messageToDisplay = `${messageToDisplay ? messageToDisplay + ' and ' : ''}Player created successfully`;

      // Clean up sessionStorage now that the join succeeded
      sessionStorage.removeItem('pendingInviteToken');

      // Set active_player_id before refreshing so AuthContext restores to the new player
      localStorage.setItem('active_player_id', createPlayerResponse.playerId);
      await refreshLeagueData();

      setAlert({
        open: true,
        message: messageToDisplay,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error creating player:', error);
      if (error.status === 409) {
        setError(error.message);
      } else {
        setError('Failed to create player. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
    navigate('/dashboard'); // Navigate only when user closes the alert
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
            {PLAYER_AVATARS.map((avatar) => (
              avatar.id < 100 &&
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
            This can later be updated in your dashboard, until the playoffs begin and the bets are closed.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
            <Autocomplete
              id="championship-team"
              options={teamOptions}
              loading={teamsLoading}
              fullWidth
              value={selectedTeam ? teamOptions.find(team => team.name === selectedTeam) || null : null}
              onChange={(event, newValue) => {
                setSelectedTeam(newValue ? newValue.name : null);
              }}
              getOptionLabel={(option) => option.name}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>{option.name}</span>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      {option.points} pts
                    </Typography>
                  </Box>
                </li>
              )}
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
              options={mvpOptions}
              loading={mvpLoading}
              fullWidth
              value={selectedMVP ? mvpOptions.find(player => player.name === selectedMVP) || null : null}
              onChange={(event, newValue) => {
                setSelectedMVP(newValue ? newValue.name : null);
              }}
              getOptionLabel={(option) => option.name}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>{option.name}</span>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      {option.points} pts
                    </Typography>
                  </Box>
                </li>
              )}
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
      
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Center position
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

export default CreatePlayerPage;
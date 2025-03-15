import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Avatar,
  Divider,
  Button,
  Chip,
  useTheme
} from '@mui/material';
import {
  Email as EmailIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  EmojiEvents as TrophyIcon,
  MilitaryTech as MvpIcon
} from '@mui/icons-material';
import { BsBullseye } from 'react-icons/bs';
import { TbCrystalBall } from 'react-icons/tb';
import { Link } from 'react-router-dom';

// A simplified version of PlayerDetailComponent that's not a dialog
const PlayerDetailComponent = ({ player }) => {
  const theme = useTheme();

  if (!player) return null;

  return (
    <Grid container spacing={3} justifyContent="center">
      <Grid item xs={12} md={10}>
        <Typography variant="h6" gutterBottom align="center">
          Player Predictions
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 3, 
                mb: 3,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(232, 244, 253, 0.8)',
                borderColor: theme.palette.primary.main
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrophyIcon sx={{ color: 'gold', mr: 1 }} />
                <Typography variant="body1" fontWeight="medium">
                  Championship Winner
                </Typography>
              </Box>
              <Chip 
                label={player.championshipPrediction} 
                color="primary" 
                variant="outlined" 
                sx={{ fontWeight: 'medium', fontSize: '1rem' }}
              />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 3, 
                mb: 3,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(156, 39, 176, 0.08)' : 'rgba(243, 229, 245, 0.8)',
                borderColor: theme.palette.secondary.main
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <MvpIcon sx={{ color: 'gold', mr: 1 }} />
                <Typography variant="body1" fontWeight="medium">
                  MVP Prediction
                </Typography>
              </Box>
              <Chip 
                label={player.mvpPrediction} 
                color="secondary" 
                variant="outlined" 
                sx={{ fontWeight: 'medium', fontSize: '1rem' }}
              />
            </Paper>
          </Grid>
        
          <Grid item xs={12} md={6}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 3,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.08)' : 'rgba(237, 247, 237, 0.8)',
                borderColor: theme.palette.success.main
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TbCrystalBall style={{ color: theme.palette.success.main, marginRight: 8 }} />
                <Typography variant="body1" fontWeight="medium">
                  Bulls-Eye Predictions
                </Typography>
              </Box>
              <Chip
                label={`${player.bullsEye} Bulls-Eye`}
                color="success"
                variant="outlined"
                sx={{ fontWeight: 'medium', fontSize: '1rem' }}
              />
            </Paper>
          </Grid>
        
          <Grid item xs={12} md={6}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 3,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(237, 108, 2, 0.08)' : 'rgba(255, 244, 229, 0.8)',
                borderColor: theme.palette.warning.main
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <BsBullseye style={{ color: theme.palette.warning.main, marginRight: 8 }} />
                <Typography variant="body1" fontWeight="medium">
                  Outcome Hits
                </Typography>
              </Box>
              <Chip
                label={`${player.hits} HITS`}
                color="warning"
                variant="outlined"
                sx={{ fontWeight: 'medium', fontSize: '1rem' }}
              />
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

function ProfilePage() {
  const theme = useTheme();
  const { currentUser } = useAuth();
  
  // Using dummy data directly - will be replaced with real data later
  const playerData = {
    hasJoinedLeague: true,
    playerName: "NBA Fan",
    leagueName: "Friends League",
    predictions: {
      championshipPrediction: "Boston Celtics",
      mvpPrediction: "Jayson Tatum",
      points: 50,
      bullsEye: 2,
      hits: 4 
    }
  };

  // Format the player data to match the PlayerDetailComponent props
  const formattedPlayerData = playerData && playerData.hasJoinedLeague ? {
    name: playerData.playerName,
    championshipPrediction: playerData.predictions.championshipPrediction,
    mvpPrediction: playerData.predictions.mvpPrediction,
    bullsEye: playerData.predictions.bullsEye || 0,
    hits: playerData.predictions.hits || 0
  } : null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
        My Profile
      </Typography>
      
      {/* Personal Information Section */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          bgcolor: theme.palette.background.paper
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="primary" fontWeight="medium" sx={{ flexGrow: 1 }}>
            Personal Information
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EmailIcon sx={{ color: theme.palette.text.secondary, mr: 1 }} />
              <Box>
                <Typography variant="body2" color="textSecondary">Email</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {currentUser?.email || "Not available"}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ color: theme.palette.text.secondary, mr: 1 }} />
              <Box>
                <Typography variant="body2" color="textSecondary">Display Name</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {currentUser?.displayName || "Not set"}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarIcon sx={{ color: theme.palette.text.secondary, mr: 1 }} />
              <Box>
                <Typography variant="body2" color="textSecondary">Account Created</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {currentUser?.metadata?.creationTime 
                    ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
                    : "Unknown"}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Player Information Section */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3,
          borderRadius: 2,
          bgcolor: theme.palette.background.paper  
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="primary" fontWeight="medium" sx={{ flexGrow: 1 }}>
            NBA Predictions Profile
          </Typography>
          {playerData?.hasJoinedLeague && (
            <Avatar 
              sx={{ 
                bgcolor: theme.palette.primary.main,
                width: 48,
                height: 48
              }}
            >
              {playerData.playerName.charAt(0)}
            </Avatar>
          )}
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        {!playerData || !playerData.hasJoinedLeague ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Avatar 
              sx={{ 
                width: 64, 
                height: 64, 
                mx: 'auto', 
                mb: 2,
                bgcolor: theme.palette.warning.light
              }}
            >
              !
            </Avatar>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
              You haven't joined any leagues yet.
            </Typography>
            <Button 
              component={Link} 
              to="/league" 
              variant="contained" 
              color="primary"
              sx={{ mt: 1 }}
            >
              Join a League
            </Button>
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">Player Name</Typography>
                <Typography variant="body1" fontWeight="medium">{playerData.playerName}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">League</Typography>
                <Typography variant="body1" fontWeight="medium">{playerData.leagueName}</Typography>
              </Grid>
            </Grid>
            
            {/* Predictions Section */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                My Predictions
              </Typography>
              
              {!playerData.predictions ? (
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 3, 
                    bgcolor: theme.palette.mode === 'dark' 
                      ? 'rgba(25, 118, 210, 0.12)' 
                      : 'rgba(25, 118, 210, 0.08)'
                  }}
                >
                  <Typography color="primary" sx={{ mb: 1 }}>
                    You haven't made any predictions yet.
                  </Typography>
                  <Button
                    component={Link}
                    to="/predictions"
                    color="primary"
                  >
                    Make predictions now
                  </Button>
                </Paper>
              ) : (
                <PlayerDetailComponent player={formattedPlayerData} />
              )}
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default ProfilePage;
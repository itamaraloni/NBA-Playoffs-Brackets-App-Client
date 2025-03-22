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
  useTheme
} from '@mui/material';
import {
  Email as EmailIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import PlayerStats from '../components/common/PlayerStats';

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
      hits: 4,
      misses: 1,
      score: 50,
      championship_team_points: 25,
      mvp_points: 25
    }
  };

  // Format the player data to match the PlayerStats props
  const formattedPlayerData = playerData && playerData.hasJoinedLeague ? {
    name: playerData.playerName,
    championshipPrediction: playerData.predictions.championshipPrediction,
    mvpPrediction: playerData.predictions.mvpPrediction,
    bullsEye: playerData.predictions.bullsEye || 0,
    hits: playerData.predictions.hits || 0,
    misses: playerData.predictions.misses || 0,
    score: playerData.predictions.points,
    championship_team_points: playerData.predictions.championship_team_points,
    mvp_points: playerData.predictions.mvp_points
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
                <PlayerStats player={formattedPlayerData} showScoreBreakdown={true} />
              )}
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default ProfilePage;
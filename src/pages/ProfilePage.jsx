import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Email as EmailIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import PlayerStats from '../components/common/PlayerStats';
import EditPicksDialog from '../components/EditPicksDialog';
import UserServices from '../services/UserServices';
import { PLAYER_AVATARS } from '../shared/GeneralConsts';

function ProfilePage() {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editType, setEditType] = useState(null); // 'championship' or 'mvp'
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchProfileData() {
      try {
        setLoading(true);
        const data = await UserServices.getUserProfile();
        console.log('Profile data:', data);
        setProfileData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfileData();
  }, []);
  
  const handleEditChampionship = (player) => {
    setEditType('championship');
    setEditDialogOpen(true);
  };
  
  const handleEditMvp = (player) => {
    setEditType('mvp');
    setEditDialogOpen(true);
  };
  
  const handleSavePick = async (type, selection) => {
    try {
      setLoading(true);
      // Call API to update prediction
      console.log('Saving pick:', type, selection);
      const updatePicksResponse = await UserServices.updatePicks(type, selection, localStorage.getItem('player_id'));
      console.log('Update picks response:', updatePicksResponse);
      if (updatePicksResponse.error) {
        throw new Error(updatePicksResponse.error);
      }

      // Show success message
      window.notify.success(`Your ${type === 'mvp' ? 'MVP' : 'Championship'} pick has been updated!`);
      
      // Refresh profile data with updated one
      const data = await UserServices.getUserProfile();
      setProfileData(data);
      setError(null);
    } catch (err) {
      console.error('Error updating prediction:', err);
      setError('Failed to update prediction. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Format the player data to match the PlayerStats props
  const formattedPlayerData = profileData?.player ? {
    name: profileData.player.name,
    championshipPrediction: profileData.player.winning_team,
    mvpPrediction: profileData.player.mvp,
    bullsEye: profileData.player.bullsEye || 0,
    hits: profileData.player.hits || 0,
    misses: profileData.player.misses || 0,
    score: profileData.player.total_points,
    championship_team_points: profileData.player.championship_team_points,
    mvp_points: profileData.player.mvp_points
  } : null;

  // Loading state
  if (loading && !profileData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading profile data...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
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
                  {profileData?.user?.email || currentUser?.email || "Not available"}
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
                  {profileData?.user?.created_at 
                    ? new Date(profileData.user.created_at).toLocaleDateString()
                    : currentUser?.metadata?.creationTime 
                      ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
                      : "Unknown"}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* NBA Predictions Profile - Show message if user hasn't joined a league */}
      {!profileData?.player ? (
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
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          <Alert severity="info" sx={{ mb: 3 }}>
            This section will be filled with your Player entity information once you join or create a league and your own player entity.
          </Alert>
        </Paper>
      ) : (
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
            <Avatar 
              sx={{ 
                bgcolor: theme.palette.primary.main,
                width: 48,
                height: 48
              }}
              src={PLAYER_AVATARS.find(avatar => avatar.id === profileData.player.player_avatar)?.src}
              alt={PLAYER_AVATARS.find(avatar => avatar.id === profileData.player.player_avatar)?.alt || profileData.player.name}
            >
              {profileData.player.name.charAt(0)}
            </Avatar>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">Player Name</Typography>
              <Typography variant="body1" fontWeight="medium">{profileData.player.name}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">League</Typography>
              <Typography variant="body1" fontWeight="medium">{profileData.league?.name || "Not in a league"}</Typography>
            </Grid>
          </Grid>
          
          {/* Predictions Section */}
          <Box sx={{ mt: 2 }}>
            <PlayerStats 
              player={formattedPlayerData} 
              showScoreBreakdown={true}
              allowEditing={true}
              onEditMvp={handleEditMvp}
              onEditChampionship={handleEditChampionship}
            />
          </Box>
        </Paper>
      )}
      
      {/* Edit Dialog */}
      <EditPicksDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        type={editType}
        player={formattedPlayerData}
        onSave={handleSavePick}
      />
    </Container>
  );
}

export default ProfilePage;
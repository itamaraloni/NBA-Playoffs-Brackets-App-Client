import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Email as EmailIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { CreateLeagueSection, JoinLeagueSection } from '../components/CreateJoinLeagueComponents';
import UserServices from '../services/UserServices';
import { extractTokenFromInput } from '../utils/inviteUtils';

function ProfilePage() {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteInput, setInviteInput] = useState('');
  const [inputError, setInputError] = useState('');
  
  useEffect(() => {
    async function fetchProfileData() {
      try {
        setLoading(true);
        const data = await UserServices.getUserProfile();
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

  const handleCreateLeague = () => {
    navigate('/create-league');
  };

  const handleJoinLeague = () => {
    const token = extractTokenFromInput(inviteInput);
    if (!token) {
      setInputError('Please paste an invite link or token');
      return;
    }
    setInputError('');
    navigate(`/invite/${token}`);
  };

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

      {/* League Management Section */}
      <Typography variant="h5" fontWeight="medium" sx={{ mt: 4, mb: 2 }}>
        League Management
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <CreateLeagueSection onCreateClick={handleCreateLeague} />
        </Grid>
        <Grid item xs={12} md={6}>
          <JoinLeagueSection
            inviteInput={inviteInput}
            setInviteInput={setInviteInput}
            inputError={inputError}
            onJoinClick={handleJoinLeague}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

export default ProfilePage;
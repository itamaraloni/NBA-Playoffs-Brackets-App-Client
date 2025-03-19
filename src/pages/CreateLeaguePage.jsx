import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ScoringRules from '../components/common/ScoringRules';
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
  Divider
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// League avatar options
const avatarOptions = [
  { id: 1, src: '/resources/league-avatars/Kobe-Bryant.png', alt: 'Kobe Bryant' },
  { id: 2, src: '/resources/league-avatars/Lebron-James.png', alt: 'Lebron James' },
  // Add more avatars here
];

const CreateLeaguePage = () => {
  const [leagueName, setLeagueName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!leagueName.trim()) {
      setError('League name is required');
      return;
    }
    
    if (!selectedAvatar) {
      setError('Please select an avatar for your league');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Store league data in localStorage to use later when creating player
      localStorage.setItem('leagueSetup', JSON.stringify({
        name: leagueName,
        avatarId: selectedAvatar
      }));
      
      // Navigate to player creation page
      navigate('/create-player');
    } catch (err) {
      console.error('Error preparing league creation:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          Create Your League
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            League Information
          </Typography>
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="leagueName"
            label="League Name"
            name="leagueName"
            value={leagueName}
            onChange={(e) => setLeagueName(e.target.value)}
            placeholder="Enter your league name"
            inputProps={{ maxLength: 30 }}
            sx={{ mb: 3 }}
          />
          
          <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 2 }}>
            Select League Avatar
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {avatarOptions.map((avatar) => (
              <Grid item xs={6} sm={4} md={3} key={avatar.id}>
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
          
          <Typography variant="h6" component="h2" gutterBottom>
            Scoring Rules
          </Typography>
          
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              mb: 4, 
              borderRadius: 2,
              bgcolor: theme.palette.mode === 'dark' 
                ? 'rgba(66, 66, 66, 0.2)' 
                : 'rgba(224, 242, 254, 0.2)'
            }}
          >
            <ScoringRules showTitle={false} />
          </Paper>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
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
            disabled={isLoading}
            endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
            sx={{ 
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {isLoading ? 'Processing...' : 'Next: Create Player'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateLeaguePage;
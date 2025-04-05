import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScoringRules from '../components/common/ScoringRules';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  useTheme,
  Divider,
  useMediaQuery
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const CreateLeaguePage = () => {
  const [leagueName, setLeagueName] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!leagueName.trim()) {
      setError('League name is required');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Store league data in localStorage to use later when creating player
      localStorage.setItem('leagueSetup', JSON.stringify({
        name: leagueName
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
    <Container 
      maxWidth="md" 
      sx={{ 
        py: { xs: 2, sm: 4 },
        px: { xs: 2, sm: 3 }
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 4 },
          borderRadius: 2,
          bgcolor: 'background.paper'
        }}
      >
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1" 
          gutterBottom 
          align="center" 
          fontWeight="bold"
        >
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
            size={isMobile ? "small" : "medium"}
          />
          
          <Divider sx={{ my: { xs: 2, sm: 3 } }} />
          
          <Typography variant="h6" component="h2" gutterBottom>
            Scoring Rules
          </Typography>
          
          <Paper 
            variant="outlined" 
            sx={{ 
              p: { xs: 1.5, sm: 2 }, 
              mb: { xs: 3, sm: 4 }, 
              borderRadius: 2,
              bgcolor: theme.palette.mode === 'dark' 
                ? 'rgba(66, 66, 66, 0.2)' 
                : 'rgba(224, 242, 254, 0.2)',
              overflowX: 'auto' // Allows horizontal scrolling on very small devices if needed
            }}
          >
            <ScoringRules showTitle={false} isMobile={isMobile} />
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
            size={isMobile ? "medium" : "large"}
            disabled={isLoading}
            endIcon={isLoading ? <CircularProgress size={isMobile ? 16 : 20} color="inherit" /> : <ArrowForwardIcon />}
            sx={{ 
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: '0.9rem', sm: '1rem' },
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
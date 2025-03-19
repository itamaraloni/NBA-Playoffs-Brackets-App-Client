import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StandaloneHeader from '../components/StandaloneHeader';
import ScoringRules from '../components/common/ScoringRules';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Grid
} from '@mui/material';
import {
  Google,
  SportsBasketball
} from '@mui/icons-material';

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is already logged in and redirect accordingly
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      // Redirect will be handled by the useEffect when currentUser updates
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary'
      }}
      >

      {/* Hedear Section */}  
      <StandaloneHeader title="NBA Playoffs Predictor" showLogout={false} showHome={false} />

      {/* Hero Section */}
      <Box 
        component="section"
        sx={{
          flexGrow: 1,
          background: theme.palette.mode === 'dark' 
            ? `linear-gradient(to bottom, ${theme.palette.primary.dark}, ${theme.palette.primary.main})` 
            : `linear-gradient(to bottom, #e3f2fd, #bbdefb)`,
          py: 8,
          color: 'white'
        }}
      >
        <Container maxWidth="lg">
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4, 
                maxWidth: 'md', 
                mx: 'auto',
                '& .MuiAlert-message': {
                  color: theme.palette.error.dark
                }
              }}
            >
              {error}
            </Alert>
          )}

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: isMobile ? 'center' : 'left', mb: isMobile ? 4 : 0 }}>
                <Typography variant="h2" component="h2" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                  Predict. Compete. Win.
                </Typography>
                <Typography variant="h5" component="p" sx={{ mb: 4, opacity: 0.9 }}>
                  Join thousands of basketball fans in predicting the NBA Playoff outcomes. 
                  Test your basketball knowledge and climb the leaderboards!
                </Typography>
                
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Google />}
                  onClick={handleSignIn}
                  disabled={loading}
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }}
                >
                  {loading ? 'Loading...' : 'Get Started with Google'}
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={4} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  color: 'text.primary'
                }}
              >
                <Typography variant="h5" component="h3" gutterBottom fontWeight="bold" align="center">
                  How Scoring Works
                </Typography>
                <ScoringRules />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box 
        component="footer"
        sx={{
          py: 3,
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <SportsBasketball sx={{ mr: 1, color: 'secondary.main' }} />
              <Typography variant="subtitle1" fontWeight="bold">
                NBA Playoff Predictor
              </Typography>
            </Box>
            <Typography variant="body2" color={theme.palette.mode === 'dark' ? 'text.secondary' : 'grey.400'}>
              © {new Date().getFullYear()} All Rights Reserved to Darch & Itapita8
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
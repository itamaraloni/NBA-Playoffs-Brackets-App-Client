import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Paper,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  SportsBasketball as BallIcon,
  Groups as GroupsIcon,
  Login as LoginIcon,
} from '@mui/icons-material';

import StandaloneHeader from '../components/common/StandaloneHeader';
import LeagueServices from '../services/LeagueServices';
import { useAuth } from '../contexts/AuthContext';

const InviteLandingPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, signInWithGoogle, userPlayers, loading: authLoading, logout } = useAuth();

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [signingIn, setSigningIn] = useState(false);

  // Fetch invite preview on mount (and when token changes)
  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await LeagueServices.previewInvite(token);
        setPreview(data);
      } catch (err) {
        setError(err.message || 'Invalid or expired invite link');
      } finally {
        setLoading(false);
      }
    };
    fetchPreview();
  }, [token]);

  const isAlreadyMember = preview && userPlayers.some(p => p.league_id === preview.leagueId);

  const handleSignIn = async () => {
    try {
      setSigningIn(true);
      await signInWithGoogle();
      // After sign-in, the component re-renders with isAuthenticated=true.
      // The useEffect below handles navigation to create-player.
    } catch (err) {
      setError('Sign in failed. Please try again.');
    } finally {
      setSigningIn(false);
    }
  };

  const handleJoin = () => {
    navigate('/create-player', { state: { inviteToken: token } });
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
  };

  // Show a loading spinner while auth state or preview is loading
  if (authLoading || loading) {
    return (
      <>
        <StandaloneHeader title="League Invite" showLogout={false} showHome={false} />
        <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }} color="text.secondary">
            Loading invite...
          </Typography>
        </Container>
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
        <StandaloneHeader
          title="League Invite"
          showLogout={isAuthenticated}
          showHome={isAuthenticated}
          onLogout={handleLogout}
        />
        <Container maxWidth="sm" sx={{ mt: 8 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          {isAuthenticated && (
            <Button variant="contained" onClick={handleGoToDashboard}>
              Go to Dashboard
            </Button>
          )}
        </Container>
      </>
    );
  }

  return (
    <>
      <StandaloneHeader
        title="League Invite"
        showLogout={isAuthenticated}
        showHome={isAuthenticated}
        onLogout={handleLogout}
      />
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <BallIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />

          <Typography variant="h5" gutterBottom>
            You've been invited to join
          </Typography>
          <Typography variant="h4" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
            {preview.leagueName}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <GroupsIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography color="text.secondary">
              {preview.playerCount} {preview.playerCount === 1 ? 'player' : 'players'}
            </Typography>
          </Box>

          {/* Not authenticated — prompt sign in */}
          {!isAuthenticated && (
            <Button
              variant="contained"
              size="large"
              startIcon={signingIn ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
              onClick={handleSignIn}
              disabled={signingIn}
              fullWidth
            >
              {signingIn ? 'Signing in...' : 'Sign in with Google to Join'}
            </Button>
          )}

          {/* Authenticated but already a member */}
          {isAuthenticated && isAlreadyMember && (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                You're already a member of this league.
              </Alert>
              <Button variant="contained" onClick={handleGoToDashboard} fullWidth>
                Go to Dashboard
              </Button>
            </>
          )}

          {/* Authenticated and not a member — ready to join */}
          {isAuthenticated && !isAlreadyMember && (
            <Button
              variant="contained"
              size="large"
              onClick={handleJoin}
              fullWidth
            >
              Join League
            </Button>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default InviteLandingPage;

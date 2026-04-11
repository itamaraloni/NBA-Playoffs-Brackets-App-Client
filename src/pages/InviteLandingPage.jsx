import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Groups as GroupsIcon,
  Login as LoginIcon,
} from '@mui/icons-material';

import ThemeToggle from '../theme/ThemeToggle';
import LandingInfoSection from '../components/LandingInfoSection';
import LeagueServices from '../services/LeagueServices';
import { useAuth } from '../contexts/AuthContext';

const NAV_LOGO_SRC = '/head-logo-nav.png';

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
      if (window.notify) {
        window.notify.success('Signed in successfully!');
      }
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

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      {/*
        Background image — fixed so it remains visible as the user scrolls
        into the info section below the hero.
      */}
      <Box
        component="img"
        src="/og-image-clean.png"
        alt=""
        aria-hidden="true"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: { xs: '78% center', md: '62% center' },
          zIndex: 0,
        }}
      />

      {/* ── Hero — full viewport height ── */}
      <Box
        component="section"
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1,
        }}
      >
        {/* Overlay — uniform dark across mobile; right-side fade on desktop */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: {
              xs: 'rgba(0,0,0,0.52)',
              md: 'linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.55) 35%, rgba(0,0,0,0.20) 65%, rgba(0,0,0,0.05) 100%)',
            },
            zIndex: 1,
          }}
        />

        {/* Transparent header */}
        <AppBar
          position="relative"
          sx={{ background: 'transparent', boxShadow: 'none', zIndex: 2 }}
        >
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
              <Box
                component="img"
                src={NAV_LOGO_SRC}
                alt="Playoff Prophet logo"
                sx={{ width: 36, height: 36, borderRadius: '50%' }}
              />
              <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
                Playoff Prophet
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ThemeToggle />
              {isAuthenticated && (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleGoToDashboard}
                    sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}
                  >
                    Home
                  </Button>
                  <Button
                    size="small"
                    onClick={logout}
                    sx={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    Logout
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </AppBar>

        {/*
          Content area — centered on mobile, left-aligned on desktop
          so the goat (center-left of image) is fully visible alongside the card.
        */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            flexGrow: 1,
            display: 'flex',
            alignItems: { xs: 'flex-end', md: 'center' },
            justifyContent: { xs: 'center', md: 'flex-start' },
            pb: { xs: 5, md: 0 },
            pt: { xs: 2, md: 4 },
            pl: { md: 8 },
          }}
        >
          <Box sx={{ width: { xs: '90%', sm: 340 } }}>

            {/* Loading state */}
            {(authLoading || loading) && (
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress sx={{ color: 'white' }} />
                <Typography sx={{ mt: 2, color: 'rgba(255,255,255,0.8)' }}>
                  Loading invite...
                </Typography>
              </Box>
            )}

            {/* Error state */}
            {!authLoading && !loading && error && (
              <Box>
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
                {isAuthenticated && (
                  <Button variant="contained" onClick={handleGoToDashboard}>
                    Go to Dashboard
                  </Button>
                )}
              </Box>
            )}

            {/* Glass invite card */}
            {!authLoading && !loading && !error && preview && (
              <Box
                sx={{
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  bgcolor: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.20)',
                  borderRadius: 3,
                  p: 3,
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5 }}>
                  You've been invited to join
                </Typography>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: 'bold', color: 'secondary.main', mb: 1 }}
                >
                  {preview.leagueName}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
                  <GroupsIcon sx={{ mr: 1, color: 'rgba(255,255,255,0.55)', fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)' }}>
                    {preview.playerCount} {preview.playerCount === 1 ? 'player' : 'players'}
                  </Typography>
                </Box>

                {/* Not authenticated — prompt sign in */}
                {!isAuthenticated && (
                  <Button
                    variant="contained"
                    color="secondary"
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
                    color="secondary"
                    size="large"
                    onClick={handleJoin}
                    fullWidth
                  >
                    Join League
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* ── Informational section — scrolls below the hero ── */}
      {/*
        Only show the bottom CTA when unauthenticated — authenticated users
        already have the Join / Dashboard buttons in the invite card above.
      */}
      <LandingInfoSection
        onSignIn={!isAuthenticated ? handleSignIn : undefined}
        loading={signingIn}
      />

      {/* ── Footer — same as LandingPage ── */}
      <Box
        component="footer"
        sx={{ py: 2.5, bgcolor: '#111111', color: 'white', position: 'relative', zIndex: 1 }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5, gap: 1 }}>
              <Box
                component="img"
                src={NAV_LOGO_SRC}
                alt=""
                aria-hidden="true"
                sx={{ width: 28, height: 28, borderRadius: '50%' }}
              />
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'white' }}>
                Playoff Prophet
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              © {new Date().getFullYear()} All Rights Reserved to Darch & Itapita8
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default InviteLandingPage;

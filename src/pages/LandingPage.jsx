import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../theme/ThemeToggle';
import {
  Box,
  AppBar,
  Toolbar,
  Button,
  Container,
  Typography,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Google,
  SportsBasketball,
  EmojiEvents,
  Groups,
} from '@mui/icons-material';

const FEATURES = [
  {
    Icon: EmojiEvents,
    title: 'Choose your champion',
    body: 'Select NBA championship winner and Finals MVP',
  },
  {
    Icon: SportsBasketball,
    title: 'Every Playoff Series',
    body: 'Pick winner + exact series score before tip-off',
  },
  {
    Icon: Groups,
    title: 'Private Leagues',
    body: 'Compete head-to-head with friends',
  },
];

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { signInWithGoogle, isAuthenticated, error: authError } = useAuth();
  const navigate = useNavigate();

  // Pill swipe / dot-nav state — same pattern as AppExplanation
  const pillScrollRef = useRef(null);
  const pillRefs = useRef([]);
  const [activePill, setActivePill] = useState(0);

  const handlePillScroll = useCallback((event) => {
    const container = event.currentTarget;
    const next = Math.round(container.scrollLeft / container.clientWidth);
    setActivePill(Math.min(Math.max(next, 0), FEATURES.length - 1));
  }, []);

  const scrollToPill = useCallback((index) => {
    pillRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });
    setActivePill(index);
  }, []);

  // Navigate to dashboard once auth state confirms the user is signed in.
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // If the server rejects the auth attempt (e.g. token invalid), AuthContext sets
  // its error state. We watch it here to unblock the loading button so the user
  // can retry — otherwise handleSignIn never sees the failure and loading sticks.
  useEffect(() => {
    if (authError) {
      setLoading(false);
    }
  }, [authError]);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      // Navigation is handled by the useEffect above once isAuthenticated flips true.
    } catch (err) {
      setError(err.message);
      setLoading(false);
      console.error("Error signing in with Google. Please try again.", err);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* ── Hero — full viewport height ── */}
      <Box
        component="section"
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/*
          Background image.
          - Desktop: goat sits right-of-center, text overlays the left half.
          - Mobile: shift right so the goat is visible; CTA is pinned to the bottom.
        */}
        <Box
          component="img"
          src="/og-image-clean.png"
          alt=""
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: { xs: '78% center', md: '62% center' },
            zIndex: 0,
          }}
        />

        {/*
          Gradient overlay.
          - Desktop: heavy on the left (text), fades out so the goat breathes.
          - Mobile: gentle vignette — darkens bottom for the CTA, light top so the image shines.
        */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: {
              xs: 'linear-gradient(to bottom, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.72) 75%, rgba(0,0,0,0.82) 100%)',
              md: 'linear-gradient(to right, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.60) 38%, rgba(0,0,0,0.20) 65%, rgba(0,0,0,0.05) 100%)',
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
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 1 }}>
              <Box
                component="img"
                src="/head-logo.png"
                alt="Playoff Prophet logo"
                sx={{ width: 36, height: 36, borderRadius: '50%' }}
              />
              <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
                Playoff Prophet
              </Typography>
            </Box>
            <ThemeToggle />
          </Toolbar>
        </AppBar>

        {/*
          ── CTA content ──
          Desktop: vertically centered, left-aligned in left ~48% of width.
          Mobile: pinned to the bottom so the goat + landscape dominate the top.
        */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            flexGrow: 1,
            display: 'flex',
            alignItems: { xs: 'flex-end', md: 'center' },
            pb: { xs: 2, md: 0 },
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                maxWidth: { xs: '100%', md: '48%' },
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
              {error && (
                <Alert severity="error" sx={{ mb: 2, maxWidth: 440 }}>
                  {error}
                </Alert>
              )}

              {/* "Playoff" — lighter, spaced, uppercase — mirrors the og-image typographic style */}
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                component="p"
                sx={{
                  color: 'rgba(255,255,255,0.85)',
                  fontWeight: 400,
                  letterSpacing: 4,
                  textTransform: 'uppercase',
                  mb: 0,
                  lineHeight: 1,
                }}
              >
                Playoff
              </Typography>
              <Typography
                variant={isMobile ? 'h2' : 'h1'}
                component="h1"
                fontWeight="bold"
                sx={{
                  color: 'white',
                  lineHeight: 1,
                  mb: { xs: 1.5, md: 2 },
                  textShadow: '0 2px 16px rgba(0,0,0,0.6)',
                }}
              >
                Prophet
              </Typography>

              <Typography
                variant="h6"
                component="p"
                sx={{
                  color: 'rgba(255,255,255,0.82)',
                  mb: { xs: 1.5, md: 1 },
                  fontWeight: 400,
                  textShadow: '0 1px 6px rgba(0,0,0,0.5)',
                }}
              >
                Predict every series outcome. Prove you're the GOAT.
              </Typography>

              {/* Description is hidden on mobile to keep the image unobstructed */}
              <Typography
                variant="body1"
                component="p"
                sx={{
                  display: { xs: 'none', md: 'block' },
                  color: 'rgba(255,255,255,0.68)',
                  mb: 4,
                  maxWidth: 420,
                  lineHeight: 1.65,
                  textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                }}
              >
                Lock in NBA bracket before Play-In games. Fill predictions before tip-off
                for every play-in and playoff series. Compete in a private league and
                settle the GOAT debate.
              </Typography>

              <Button
                variant="contained"
                color="secondary"
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Google />}
                onClick={handleSignIn}
                disabled={loading}
                sx={{
                  mt: { xs: 1.5, md: 0 },
                  px: 5,
                  py: 1.75,
                  fontSize: '1.05rem',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.45)',
                }}
              >
                {loading ? 'Loading...' : 'Sign in with Google'}
              </Button>
            </Box>
          </Container>
        </Box>

        {/* ── Feature pills — pinned to bottom of hero ── */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            pb: { xs: 3, md: 4 },
            pt: 2,
            background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)',
          }}
        >
          <Container maxWidth="lg" disableGutters={isMobile}>
            {/*
              Desktop: natural flex row — all pills visible side by side.
              Mobile: one pill at a time, horizontal CSS snap scroll, dot nav below.
              Same pattern as AppExplanation mobile carousel.
            */}
            <Box
              ref={pillScrollRef}
              onScroll={isMobile ? handlePillScroll : undefined}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: { xs: 0, md: 3 },
                px: { xs: 2, md: 0 },
                overflowX: { xs: 'auto', md: 'visible' },
                scrollSnapType: { xs: 'x mandatory', md: 'none' },
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {FEATURES.map(({ Icon, title, body }, index) => (
                <Box
                  key={title}
                  ref={(node) => { pillRefs.current[index] = node; }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    gap: 1.5,
                    bgcolor: 'rgba(0,0,0,0.45)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 99,
                    px: 2.5,
                    py: 1.25,
                    mx: { xs: 1, md: 0 },
                    // On mobile each pill fills the viewport width (minus padding) — one at a time
                    minWidth: { xs: 'calc(100% - 32px)', md: 'auto' },
                    flexShrink: 0,
                    scrollSnapAlign: 'center',
                  }}
                >
                  <Icon sx={{ color: 'secondary.main', fontSize: 20, flexShrink: 0 }} />
                  <Box>
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      sx={{ color: 'white', display: 'block', lineHeight: 1.3 }}
                    >
                      {title}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'rgba(255,255,255,0.65)', display: 'block', lineHeight: 1.3 }}
                    >
                      {body}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Dot nav — mobile only */}
            {isMobile && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1.5 }}>
                {FEATURES.map((_, index) => (
                  <Box
                    key={index}
                    role="button"
                    tabIndex={0}
                    aria-label={`Go to feature ${index + 1}`}
                    onClick={() => scrollToPill(index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        scrollToPill(index);
                      }
                    }}
                    sx={{
                      width: index === activePill ? 22 : 10,
                      height: 10,
                      borderRadius: 999,
                      bgcolor: index === activePill ? 'secondary.main' : 'rgba(255,255,255,0.35)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  />
                ))}
              </Box>
            )}
          </Container>
        </Box>
      </Box>

      {/* ── Footer ── */}
      <Box
        component="footer"
        sx={{ py: 2.5, bgcolor: '#111111', color: 'white' }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5, gap: 1 }}>
              <Box
                component="img"
                src="/head-logo.png"
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

export default LandingPage;

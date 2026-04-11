import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  EmojiEvents,
  Groups,
  Google,
  Whatshot,
  Star,
  Lock,
  CalendarToday,
  LockClock,
} from '@mui/icons-material';
import { TbCrystalBall } from 'react-icons/tb';
import { PREDICTIONS_OPEN_DATE, PLAYIN_START_DATE } from '../shared/SeasonConfig';

// Format a Date as "Apr 13" in the user's local locale.
const fmt = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// ── How It Works ─────────────────────────────────────────────────────────────
// Step 01 = Bonus Picks first (locked before playoffs begin — sets context)
// Step 02 = Bracket / series predictions
// Step 03 = Compete in league

const STEPS = [
  {
    number: '01',
    Icon: EmojiEvents,
    title: 'Lock In Bonus Picks',
    body: 'Before the playoffs begin, choose your Championship winner and Finals MVP. Get them right for a big bonus.',
  },
  {
    number: '02',
    Icon: Whatshot,
    title: 'Predict Every Series',
    body: 'Fill and Lock your full bracket before the Play-In games begin. Live pick every series winner and exact score, from the Play-In through the Finals.',
  },
  {
    number: '03',
    Icon: Groups,
    title: 'Compete in Your League',
    body: 'Join multiple private leagues with different crews — each league gets its own set of predictions. Track live standings per league and settle the GOAT debate once and for all.',
  },
];

// ── Scoring rounds ────────────────────────────────────────────────────────────

const ROUNDS = [
  { label: 'Play-In',      sublabel: 'Pick the qualifier' },
  { label: 'Round 1',      sublabel: '8 series' },
  { label: 'Semis',        sublabel: '4 series' },
  { label: 'Conf. Finals', sublabel: '2 series' },
  { label: 'Finals',       sublabel: '1 series' },
];

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shared informational section used by both LandingPage and InviteLandingPage.
 *
 * Props:
 *   onSignIn  – callback for the bottom CTA button. Omit to hide the CTA entirely
 *               (e.g. when the user is already authenticated on the invite page).
 *   loading   – shows a spinner in place of the Google icon while signing in.
 */
const LandingInfoSection = ({ onSignIn, loading = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        zIndex: 1,
        // Semi-transparent dark layer so the fixed bg image shows through subtly.
        bgcolor: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        py: { xs: 7, md: 10 },
      }}
    >
      <Container maxWidth="lg">

        {/* ── How It Works ── */}
        <Box sx={{ mb: { xs: 8, md: 10 } }}>
          <Typography
            variant="overline"
            sx={{
              display: 'block',
              textAlign: 'center',
              color: 'secondary.main',
              letterSpacing: 4,
              mb: 1,
            }}
          >
            How It Works
          </Typography>
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            fontWeight="bold"
            sx={{ textAlign: 'center', color: 'white', mb: { xs: 3, md: 4 } }}
          >
            Three steps. One champion.
          </Typography>

          {/* ── Key Dates strip ── */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              justifyContent: 'center',
              gap: { xs: 1, sm: 0 },
              mb: { xs: 5, md: 7 },
            }}
          >
            {/* Opens chip */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: { xs: 2, sm: '8px 0 0 8px' },
                px: 2.5,
                py: 1.25,
              }}
            >
              <CalendarToday sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 16 }} />
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', display: 'block', lineHeight: 1.2 }}>
                  Bracket opens
                </Typography>
                <Typography variant="caption" fontWeight="bold" sx={{ color: 'white', display: 'block', lineHeight: 1.2 }}>
                  {fmt(PREDICTIONS_OPEN_DATE)}
                </Typography>
              </Box>
            </Box>

            {/* Arrow divider — desktop only */}
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                bgcolor: 'rgba(255,255,255,0.06)',
                borderTop: '1px solid rgba(255,255,255,0.14)',
                borderBottom: '1px solid rgba(255,255,255,0.14)',
                py: 1.25,
                px: 1,
                color: 'rgba(255,255,255,0.3)',
                fontSize: 12,
              }}
            >
              →
            </Box>

            {/* Locks chip */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: 'rgba(211,47,47,0.14)',
                border: '1px solid',
                borderColor: 'secondary.main',
                borderRadius: { xs: 2, sm: '0 8px 8px 0' },
                px: 2.5,
                py: 1.25,
              }}
            >
              <LockClock sx={{ color: 'secondary.main', fontSize: 16 }} />
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', display: 'block', lineHeight: 1.2 }}>
                  Locks at Play-In tip-off
                </Typography>
                <Typography variant="caption" fontWeight="bold" sx={{ color: 'secondary.main', display: 'block', lineHeight: 1.2 }}>
                  {fmt(PLAYIN_START_DATE)}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: { xs: 3, md: 4 },
            }}
          >
            {STEPS.map(({ number, Icon, title, body }) => (
              <Box
                key={number}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  bgcolor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 3,
                  p: { xs: 3, md: 4 },
                  // Subtle left accent on desktop
                  borderLeft: { md: '3px solid' },
                  borderLeftColor: { md: 'secondary.main' },
                }}
              >
                {/* Step number + icon */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 900,
                      color: 'secondary.main',
                      lineHeight: 1,
                      fontVariantNumeric: 'tabular-nums',
                      minWidth: 32,
                    }}
                  >
                    {number}
                  </Typography>
                  <Icon sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 24 }} />
                </Box>

                <Typography variant="h6" fontWeight="bold" sx={{ color: 'white', lineHeight: 1.3 }}>
                  {title}
                </Typography>

                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.62)', lineHeight: 1.7 }}>
                  {body}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── Scoring ── */}
        <Box sx={{ mb: onSignIn ? { xs: 8, md: 10 } : 0 }}>
          <Typography
            variant="overline"
            sx={{
              display: 'block',
              textAlign: 'center',
              color: 'secondary.main',
              letterSpacing: 4,
              textTransform: 'none',   // override MUI overline auto-uppercase
              mb: 1,
            }}
          >
            Scoring
          </Typography>
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            fontWeight="bold"
            sx={{ textAlign: 'center', color: 'white', mb: 1.5 }}
          >
            Points escalate every round
          </Typography>
          {/* Bracket vs live picks clarification */}
          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.55)',
              mb: { xs: 4, md: 5 },
              maxWidth: 520,
              mx: 'auto',
              lineHeight: 1.7,
            }}
          >
            As Bracket picks locks before the Play-In games they worth more than live series picks.
          </Typography>

          {/* Round escalation — horizontal scroll on mobile */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: { xs: 'flex-start', md: 'center' },
              gap: { xs: 1.5, md: 2 },
              overflowX: { xs: 'auto', md: 'visible' },
              pb: { xs: 1, md: 0 },
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
              mb: { xs: 4, md: 5 },
            }}
          >
            {ROUNDS.map(({ label, sublabel }, index) => {
              // Visually grow each round chip: opacity + border intensity
              const intensity = 0.35 + (index / (ROUNDS.length - 1)) * 0.65;
              const isLast = index === ROUNDS.length - 1;
              return (
                <Box
                  key={label}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                    bgcolor: isLast
                      ? 'rgba(211,47,47,0.18)'
                      : `rgba(255,255,255,${0.04 + index * 0.015})`,
                    border: '1px solid',
                    borderColor: isLast
                      ? 'secondary.main'
                      : `rgba(255,255,255,${intensity * 0.35})`,
                    borderRadius: 2,
                    px: { xs: 2, md: 2.5 },
                    py: { xs: 1.25, md: 1.5 },
                    minWidth: { xs: 80, md: 100 },
                    flexShrink: 0,
                    transition: 'all 0.2s',
                  }}
                >
                  {isLast && (
                    <Star sx={{ color: 'secondary.main', fontSize: 14, mb: 0.25 }} />
                  )}
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    sx={{
                      color: isLast ? 'secondary.main' : `rgba(255,255,255,${intensity})`,
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }}
                  >
                    {label}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: `rgba(255,255,255,${intensity * 0.6})`,
                      textAlign: 'center',
                      fontSize: '0.65rem',
                      lineHeight: 1.2,
                    }}
                  >
                    {sublabel}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Bonus callouts — 3 cards */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              flexWrap: { sm: 'wrap' },
              gap: 2,
              justifyContent: 'center',
            }}
          >
            {/* Bullseye Bonus — react-icons TbCrystalBall */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                bgcolor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 2,
                px: 2.5,
                py: 2,
                maxWidth: { sm: 300 },
                width: '100%',
              }}
            >
              {/*
                TbCrystalBall is from react-icons and doesn't accept the MUI sx prop.
                Wrapping in a Box with color set lets us use theme color via currentColor.
              */}
              <Box sx={{ color: 'secondary.main', display: 'flex', mt: 0.25, flexShrink: 0 }}>
                <TbCrystalBall size={22} color="currentColor" />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight="bold" sx={{ color: 'white', lineHeight: 1.3 }}>
                  Bullseye Bonus
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                  Nail the exact series score for extra points
                </Typography>
              </Box>
            </Box>

            {/* Bonus Picks */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                bgcolor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 2,
                px: 2.5,
                py: 2,
                maxWidth: { sm: 300 },
                width: '100%',
              }}
            >
              <EmojiEvents sx={{ color: 'secondary.main', fontSize: 22, mt: 0.25, flexShrink: 0 }} />
              <Box>
                <Typography variant="body2" fontWeight="bold" sx={{ color: 'white', lineHeight: 1.3 }}>
                  Bonus Picks
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                  Championship winner + Finals MVP = bonus rounds
                </Typography>
              </Box>
            </Box>

            {/* Bracket picks pay more */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                bgcolor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 2,
                px: 2.5,
                py: 2,
                maxWidth: { sm: 300 },
                width: '100%',
              }}
            >
              <Lock sx={{ color: 'secondary.main', fontSize: 22, mt: 0.25, flexShrink: 0 }} />
              <Box>
                <Typography variant="body2" fontWeight="bold" sx={{ color: 'white', lineHeight: 1.3 }}>
                  Early Lock Multiplier
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                  Bracket picks beat live picks — commit before playoffs for bigger rewards
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ── Bottom CTA ── (only rendered when onSignIn is provided) */}
        {onSignIn && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              pt: { xs: 4, md: 5 },
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.65)', textAlign: 'center' }}>
              Ready to prove you're the GOAT?
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Google />}
              onClick={onSignIn}
              disabled={loading}
              sx={{
                px: 5,
                py: 1.75,
                fontSize: '1.05rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 20px rgba(0,0,0,0.45)',
              }}
            >
              {loading ? 'Loading...' : 'Sign in with Google to Join'}
            </Button>
          </Box>
        )}

      </Container>
    </Box>
  );
};

export default LandingInfoSection;

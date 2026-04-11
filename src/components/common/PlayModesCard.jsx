import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Paper, Divider, useTheme, useMediaQuery } from '@mui/material';

const MODES = [
  { name: 'Bracket',      desc: 'predict the full bracket upfront', path: '/bracket' },
  { name: 'Live Picks',   desc: 'bet on matchups as the playoffs progress', path: '/predictions' },
  { name: 'Championship', desc: 'pick the champion',                path: null },
  { name: 'Finals MVP',   desc: 'pick the Finals MVP',              path: null },
];

const HINT = 'All points add up to your Total Score';

/**
 * Card explaining how scoring works across all four modes.
 * Shown only to users with an active player — not in playerless empty state.
 */
const PlayModesCard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Chip-style pill for each mode header — clickable if the mode has a dedicated page
  const chipSx = {
    display: 'inline-flex',
    alignItems: 'center',
    px: 1,
    py: 0.25,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 999,
    fontSize: '0.6875rem',
    fontWeight: 700,
    color: 'text.primary',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  };

  const linkChipSx = {
    ...chipSx,
    transition: 'border-color 0.15s',
    '&:hover': { borderColor: theme.palette.primary.main },
  };

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, bgcolor: 'background.paper', overflow: 'hidden' }}>
      {isMobile ? (
        // Mobile: label centered, 2×2 card grid, hint below
        <Box sx={{ px: 2, py: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.25 }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary">
            How to Score Pts?
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, width: '100%' }}>
            {MODES.map(({ name, desc, path }) => (
              <Box
                key={name}
                component={path ? Link : 'div'}
                to={path || undefined}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.25,
                  px: 1.5,
                  py: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  textDecoration: 'none',
                  ...(path && {
                    transition: 'border-color 0.15s',
                    '&:hover': { bgcolor: theme.palette.action.hover, borderColor: theme.palette.primary.main },
                  }),
                }}
              >
                <Typography variant="caption" fontWeight={700} color="text.primary">{name}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', lineHeight: 1.4 }}>
                  {desc}
                </Typography>
              </Box>
            ))}
          </Box>

          <Typography variant="caption" fontWeight={700} color="text.primary" sx={{ textAlign: 'center' }}>
            → {HINT}
          </Typography>
        </Box>
      ) : (
        // Desktop: label | 4 mode columns, hint as a footer row below
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.25, flexShrink: 0 }}>
              <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                How to Score Pts?
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem />

            {MODES.map((mode, i) => (
              <React.Fragment key={mode.name}>
                <Box sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                  px: 1.5,
                  py: 1.25,
                }}>
                  {mode.path ? (
                    <Box component={Link} to={mode.path} sx={linkChipSx}>{mode.name}</Box>
                  ) : (
                    <Box sx={chipSx}>{mode.name}</Box>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                    {mode.desc}
                  </Typography>
                </Box>
                {i < MODES.length - 1 && <Divider orientation="vertical" flexItem />}
              </React.Fragment>
            ))}
          </Box>

          <Divider />
          <Box sx={{
            px: 2,
            py: 0.75,
            textAlign: 'center',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
          }}>
            <Typography variant="body2" fontWeight={700} color="text.primary">
              → {HINT}
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default PlayModesCard;

import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

/**
 * BracketExportBanner — branding header rendered only inside the off-screen
 * export container. Never shown in the live UI.
 *
 * Layout: 🏀 PLAYOFF PROPHET     PlayerName · LeagueName     2025-26 NBA Playoffs
 *         ← left               ← centered →                          right →
 */
const BracketExportBanner = ({ playerName, leagueName }) => {
  const theme = useTheme();

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      px: 3,
      py: 1.5,
      background: theme.palette.background.paper,
      borderBottom: `2px solid ${theme.palette.primary.main}`,
    }}>
      {/* Left: logo + app name */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
        <img
          src={`${window.location.origin}/logo192.png`}
          alt="Playoff Prophet"
          width={36}
          height={36}
          style={{ borderRadius: 6 }}
        />
        <Typography sx={{
          fontSize: '0.875rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: theme.palette.primary.main,
          whiteSpace: 'nowrap',
        }}>
          Playoff Prophet
        </Typography>
      </Box>

      {/* Center: player + league */}
      <Typography sx={{
        fontSize: '0.8125rem',
        fontWeight: 600,
        color: theme.palette.text.primary,
        whiteSpace: 'nowrap',
        textAlign: 'center',
      }}>
        {playerName}
        {leagueName && (
          <Typography
            component="span"
            sx={{ fontSize: '0.8125rem', fontWeight: 400, color: theme.palette.text.secondary, ml: 0.5 }}
          >
            · {leagueName}
          </Typography>
        )}
      </Typography>

      {/* Right: season */}
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <Typography sx={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: theme.palette.text.secondary,
          whiteSpace: 'nowrap',
        }}>
          2025-26 NBA Playoffs
        </Typography>
      </Box>
    </Box>
  );
};

export default BracketExportBanner;

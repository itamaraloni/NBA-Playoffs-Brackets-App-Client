import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import BracketMatchup from './BracketMatchup';

// Column widths (px) matching the prototype layout so rounds align visually
const COL_WIDTH = {
  'Play-In':    163,
  'Survivor':   158,
  'Round 1':    168,
  'Semis':      163,
  'Conf Finals':160,
};

/**
 * BracketRound — a vertical column representing one round of the tournament.
 *
 * Props:
 *   label       — display name (e.g. 'Play-In', 'Round 1')
 *   pts         — point value for a correct pick in this round
 *   matchups    — array of enriched matchup objects for this round
 *   isPlayinCol — true for Play-In and Survivor columns (amber tint)
 *   isLocked    — passed down to BracketMatchup
 *   mobile      — renders a stacked grid layout instead of fixed-width column
 */
const BracketRound = ({ label, pts, matchups, isPlayinCol, isLocked, mobile, onMatchupClick }) => {
  const theme = useTheme();

  const pillSx = isPlayinCol
    ? {
        background: 'rgba(245,158,11,0.1)',
        border: '1px solid rgba(245,158,11,0.22)',
        color: '#f59e0b',
      }
    : {
        background: theme.palette.action.hover,
        border: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.secondary,
      };

  const ptsSx = isPlayinCol
    ? { color: 'rgba(245,158,11,0.6)' }
    : { color: theme.palette.text.disabled };

  const roundHeader = (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexShrink: 0 }}>
      <Box sx={{
        display: 'inline-flex', alignItems: 'center',
        borderRadius: '20px', px: 1.25, py: '3px',
        ...pillSx,
      }}>
        <Typography sx={{
          fontSize: '0.5625rem', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          {label}
        </Typography>
      </Box>
      <Typography sx={{
        fontSize: '0.5625rem', fontWeight: 700,
        px: '7px', py: '2px', borderRadius: '10px',
        background: 'rgba(255,255,255,0.04)',
        ...ptsSx,
      }}>
        {pts} pt{pts !== 1 ? 's' : ''}
      </Typography>
    </Box>
  );

  // Mobile: full-width, stacked, 2-column grid for multi-matchup rounds
  if (mobile) {
    return (
      <Box sx={{ mb: 2 }}>
        {roundHeader}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: matchups.length === 1 ? '1fr' : '1fr 1fr',
          gap: 1,
        }}>
          {matchups.map(m => (
            <BracketMatchup
              key={`${m.round}-${m.conference}-${m.matchup_position}`}
              matchup={m}
              isLocked={isLocked}
              onMatchupClick={onMatchupClick}
            />
          ))}
        </Box>
      </Box>
    );
  }

  // Desktop: fixed-width column with cards spread vertically
  const colWidth = COL_WIDTH[label] ?? 163;

  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column',
      px: '5px', flexShrink: 0, width: colWidth,
    }}>
      {roundHeader}
      {/* Cards spread evenly over the full column height */}
      <Box sx={{
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-around',
        flex: 1, gap: '6px',
      }}>
        {matchups.map(m => (
          <BracketMatchup
            key={`${m.round}-${m.conference}-${m.matchup_position}`}
            matchup={m}
            isLocked={isLocked}
            onMatchupClick={onMatchupClick}
          />
        ))}
      </Box>
    </Box>
  );
};

export default BracketRound;

import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import BracketRound from './BracketRound';

/**
 * Round definitions in West order (Play-In → Conf Finals, fans left-to-right away from center).
 * East reverses this array so Conf Finals is closest to the Finals center section.
 */
const ROUND_DEFS = [
  { key: 'playin',   label: 'Play-In',     pts: 1,  isPlayinCol: true  },
  { key: 'survivor', label: 'Survivor',    pts: 1,  isPlayinCol: true  },
  { key: 'r1',       label: 'Round 1',     pts: 5,  isPlayinCol: false },
  { key: 'semis',    label: 'Semis',       pts: 10, isPlayinCol: false },
  { key: 'cf',       label: 'Conf Finals', pts: 20, isPlayinCol: false },
];

// NBA bracket layout: adjacent pairs feed into the same semis matchup.
// Top half: pos 1 (1v8) + pos 4 (4v5) → semis pos 1
// Bottom half: pos 2 (2v7) + pos 3 (3v6) → semis pos 2
const R1_DISPLAY_ORDER = [1, 4, 2, 3];

function reorderForDisplay(matchups, roundKey) {
  if (roundKey !== 'r1' || matchups.length !== 4) return matchups;
  return R1_DISPLAY_ORDER.map(pos =>
    matchups.find(m => m.matchup_position === pos)
  ).filter(Boolean);
}

/**
 * ConferenceBracket — renders the 5-column bracket section for one conference.
 *
 * Props:
 *   conf     — 'east' | 'west'
 *   rounds   — { playin, survivor, r1, semis, cf } — arrays of enriched matchups
 *   isLocked — passed down to cards
 *   mobile   — mobile layout: chronological order, full-width stacked
 */
const ConferenceBracket = ({ conf, rounds, isLocked, mobile, onMatchupClick }) => {
  const theme = useTheme();
  const isEast   = conf === 'east';
  const title    = isEast ? 'Eastern Conference' : 'Western Conference';
  // East mirrors West: ECF is innermost (closest to Finals center), Play-In outermost
  const roundDefs = isEast ? [...ROUND_DEFS].reverse() : ROUND_DEFS;

  if (mobile) {
    // Mobile: always chronological (playin → cf), full-width stacked
    return (
      <Box sx={{ px: 1 }}>
        {ROUND_DEFS.map(({ key, label, pts, isPlayinCol }) => (
          <BracketRound
            key={key}
            label={label}
            pts={pts}
            matchups={reorderForDisplay(rounds[key] ?? [], key)}
            isPlayinCol={isPlayinCol}
            isLocked={isLocked}
            onMatchupClick={onMatchupClick}
            mobile
          />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1 }}>
      {/* Conference title bar */}
      <Typography sx={{
        fontSize: '0.625rem', fontWeight: 800,
        textTransform: 'uppercase', letterSpacing: '0.14em',
        color: theme.palette.primary.main,
        textAlign: 'center',
        pb: 1, mb: 1.25,
        borderBottom: `2px solid ${theme.palette.primary.main}`,
      }}>
        {title}
      </Typography>

      {/* Round columns row — fixed height so cards from adjacent rounds align */}
      <Box sx={{ display: 'flex', height: 510 }}>
        {roundDefs.map(({ key, label, pts, isPlayinCol }) => (
          <BracketRound
            key={key}
            label={label}
            pts={pts}
            matchups={reorderForDisplay(rounds[key] ?? [], key)}
            isPlayinCol={isPlayinCol}
            isLocked={isLocked}
            onMatchupClick={onMatchupClick}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ConferenceBracket;

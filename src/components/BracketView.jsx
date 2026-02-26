import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, useTheme, useMediaQuery } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ConferenceBracket from './ConferenceBracket';
import BracketMatchup from './BracketMatchup';

const FINALS_PTS = 30;

/**
 * Progress bar + deadline strip shown above the bracket on all screen sizes.
 */
function BracketHeader({ predictedMatchups, totalMatchups, isLocked, deadline }) {
  const theme = useTheme();

  const deadlineStr = deadline
    ? new Date(deadline).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : null;

  const pct = totalMatchups > 0
    ? Math.round((predictedMatchups / totalMatchups) * 100)
    : 0;

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', flexWrap: 'wrap',
      gap: 2, p: 1.5, mb: 1.5,
      background: theme.palette.background.paper,
      borderRadius: 2,
      border: `1px solid ${theme.palette.divider}`,
    }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
        {predictedMatchups} / {totalMatchups} predicted
      </Typography>

      {/* Progress bar */}
      <Box sx={{ flex: 1, minWidth: 80 }}>
        <Box sx={{
          height: 4, borderRadius: 2,
          background: theme.palette.action.hover,
          overflow: 'hidden',
        }}>
          <Box sx={{
            height: '100%', borderRadius: 2,
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.65)})`,
            transition: 'width 0.4s ease',
          }} />
        </Box>
      </Box>

      {deadlineStr && (
        <Typography variant="body2" sx={{
          fontSize: '0.8rem', whiteSpace: 'nowrap',
          color: isLocked ? 'error.main' : 'text.secondary',
        }}>
          {isLocked ? '🔒 Bracket locked' : `🔓 Locks ${deadlineStr}`}
        </Typography>
      )}
    </Box>
  );
}

/**
 * The centered Finals column — trophy, title, points badge, and the Finals matchup card.
 */
function FinalsSection({ finalMatchup, isLocked, onMatchupClick }) {
  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minWidth: 192, px: 1,
    }}>
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography sx={{
          fontSize: 34, lineHeight: 1,
          filter: 'drop-shadow(0 0 14px rgba(245,158,11,0.65))',
        }}>
          🏆
        </Typography>
        <Typography sx={{
          display: 'block',
          fontSize: '0.5625rem', fontWeight: 900,
          textTransform: 'uppercase', letterSpacing: '0.22em',
          color: '#f59e0b', mt: 0.5,
        }}>
          NBA Finals
        </Typography>
        <Typography sx={{
          display: 'block',
          fontSize: '0.5625rem', fontWeight: 700,
          letterSpacing: '0.1em', color: 'rgba(245,158,11,0.7)',
        }}>
          {FINALS_PTS} pts
        </Typography>
      </Box>
      <Box sx={{ width: '100%' }}>
        <BracketMatchup matchup={finalMatchup} isLocked={isLocked} isFinals onMatchupClick={onMatchupClick} />
      </Box>
    </Box>
  );
}

/**
 * BracketView — top-level layout component.
 * Desktop: West (5 cols) | Finals (center) | East (5 cols) in a horizontally scrollable row.
 * Mobile:  Tabs (West / Finals / East) each rendering their rounds vertically.
 */
const BracketView = ({ bracket, isLocked, predictedMatchups, totalMatchups, deadline, onMatchupClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileTab, setMobileTab] = useState(0);

  const header = (
    <BracketHeader
      predictedMatchups={predictedMatchups}
      totalMatchups={totalMatchups}
      isLocked={isLocked}
      deadline={deadline}
    />
  );

  if (isMobile) {
    return (
      <Box>
        {header}
        <Tabs
          value={mobileTab}
          onChange={(_, v) => setMobileTab(v)}
          variant="fullWidth"
          sx={{ mb: 2, borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          <Tab label="West" />
          <Tab label="Finals" />
          <Tab label="East" />
        </Tabs>

        {mobileTab === 0 && (
          <ConferenceBracket conf="west" rounds={bracket.west} isLocked={isLocked} onMatchupClick={onMatchupClick} mobile />
        )}
        {mobileTab === 1 && (
          <Box sx={{ px: 2, maxWidth: 380, mx: 'auto' }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography sx={{
                fontSize: 38,
                filter: 'drop-shadow(0 0 12px rgba(245,158,11,0.6))',
              }}>🏆</Typography>
              <Typography sx={{
                display: 'block',
                fontSize: '0.625rem', fontWeight: 900,
                textTransform: 'uppercase', letterSpacing: '0.2em',
                color: '#f59e0b',
              }}>
                NBA Finals
              </Typography>
              <Typography sx={{
                display: 'block',
                fontSize: '0.5625rem', fontWeight: 700,
                letterSpacing: '0.1em', color: 'rgba(245,158,11,0.7)',
              }}>
                {FINALS_PTS} pts
              </Typography>
            </Box>
            <BracketMatchup matchup={bracket.final} isLocked={isLocked} isFinals onMatchupClick={onMatchupClick} />
          </Box>
        )}
        {mobileTab === 2 && (
          <ConferenceBracket conf="east" rounds={bracket.east} isLocked={isLocked} onMatchupClick={onMatchupClick} mobile />
        )}
      </Box>
    );
  }

  // Desktop — horizontal flex row with overflow scroll
  return (
    <Box>
      {header}
      {/* Negative margin to let the bracket use full width beyond Container padding */}
      <Box sx={{ overflowX: 'auto', pb: 2, mx: -3 }}>
        <Box sx={{
          display: 'flex',
          minWidth: 1540,
          alignItems: 'flex-start',
          px: 1.5,
        }}>
          <ConferenceBracket conf="west" rounds={bracket.west} isLocked={isLocked} onMatchupClick={onMatchupClick} />
          <FinalsSection finalMatchup={bracket.final} isLocked={isLocked} onMatchupClick={onMatchupClick} />
          <ConferenceBracket conf="east" rounds={bracket.east} isLocked={isLocked} onMatchupClick={onMatchupClick} />
        </Box>
      </Box>
    </Box>
  );
};

export default BracketView;

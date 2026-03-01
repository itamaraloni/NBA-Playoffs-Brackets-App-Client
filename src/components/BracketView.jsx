import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Typography, useTheme, useMediaQuery } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ConferenceBracket from './ConferenceBracket';
import BracketMatchup from './BracketMatchup';

const FINALS_PTS = 30;

/**
 * Formats a millisecond duration into a human-readable countdown string.
 * Examples: "3d 14h 22m", "5h 12m", "42m", "< 1m"
 */
function formatCountdown(ms) {
  if (ms <= 0) return null;
  const totalMinutes = Math.floor(ms / 60_000);
  if (totalMinutes < 1) return '< 1m';
  const days  = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const mins  = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

/**
 * Progress bar + deadline countdown strip shown above the bracket on all screen sizes.
 * Countdown updates every 60 seconds. Text turns red when < 24 hours remain.
 */
function BracketHeader({ predictedMatchups, totalMatchups, isLocked, deadline }) {
  const theme = useTheme();
  const [now, setNow] = useState(Date.now());

  // Tick every 60 s while the bracket is still open
  useEffect(() => {
    if (isLocked || !deadline) return;
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [isLocked, deadline]);

  const remaining   = deadline ? new Date(deadline).getTime() - now : 0;
  const isUrgent    = remaining > 0 && remaining < 24 * 60 * 60 * 1000; // < 24 h
  const countdownStr = formatCountdown(remaining);

  const pct = totalMatchups > 0
    ? Math.round((predictedMatchups / totalMatchups) * 100)
    : 0;

  // Determine deadline label text and color
  let deadlineLabel = null;
  let deadlineColor = 'text.secondary';
  if (isLocked) {
    deadlineLabel = '🔒 Bracket locked — deadline passed';
    deadlineColor = 'error.main';
  } else if (countdownStr) {
    deadlineLabel = `🔓 Locks in ${countdownStr}`;
    deadlineColor = isUrgent ? 'error.main' : 'text.secondary';
  }

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

      {deadlineLabel && (
        <Typography variant="body2" sx={{
          fontSize: '0.8rem', whiteSpace: 'nowrap', fontWeight: isUrgent || isLocked ? 600 : 400,
          color: deadlineColor,
        }}>
          {deadlineLabel}
        </Typography>
      )}
    </Box>
  );
}

/**
 * The centered Finals column — trophy, title, points badge, and the Finals matchup card.
 */
function FinalsSection({ finalMatchup, isLocked, onMatchupClick, diffMap }) {
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
        <BracketMatchup matchup={finalMatchup} isLocked={isLocked} isFinals onMatchupClick={onMatchupClick} diffState={diffMap?.[`final-final-${finalMatchup?.matchup_position ?? 1}`] ?? null} />
      </Box>
    </Box>
  );
}

/**
 * BracketView — top-level layout component.
 * Desktop: West (5 cols) | Finals (center) | East (5 cols) in a horizontally scrollable row.
 * Mobile:  Tabs (West / Finals / East) each rendering their rounds vertically.
 */
const BracketView = ({ bracket, isLocked, predictedMatchups, totalMatchups, deadline, onMatchupClick, diffMap }) => {
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
          <ConferenceBracket conf="west" rounds={bracket.west} isLocked={isLocked} onMatchupClick={onMatchupClick} diffMap={diffMap} mobile />
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
            <BracketMatchup matchup={bracket.final} isLocked={isLocked} isFinals onMatchupClick={onMatchupClick} diffState={diffMap?.[`final-final-${bracket.final?.matchup_position ?? 1}`] ?? null} />
          </Box>
        )}
        {mobileTab === 2 && (
          <ConferenceBracket conf="east" rounds={bracket.east} isLocked={isLocked} onMatchupClick={onMatchupClick} diffMap={diffMap} mobile />
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
          <ConferenceBracket conf="west" rounds={bracket.west} isLocked={isLocked} onMatchupClick={onMatchupClick} diffMap={diffMap} />
          <FinalsSection finalMatchup={bracket.final} isLocked={isLocked} onMatchupClick={onMatchupClick} diffMap={diffMap} />
          <ConferenceBracket conf="east" rounds={bracket.east} isLocked={isLocked} onMatchupClick={onMatchupClick} diffMap={diffMap} />
        </Box>
      </Box>
    </Box>
  );
};

export default BracketView;

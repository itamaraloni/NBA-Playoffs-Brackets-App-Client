import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { alpha } from '@mui/material/styles';
import DesktopBracketGrid from './DesktopBracketGrid';
import MobileBracketScroll from './MobileBracketScroll';

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
 * BracketHeader — adapts between write mode (progress bar + countdown) and
 * read mode (health stats + accuracy bar + viewing badge).
 */
function BracketHeader({ predictedMatchups, totalMatchups, isLocked, deadline, bracketHealth, viewingPlayerName, actionButtons }) {
  const theme = useTheme();
  const [now, setNow] = useState(Date.now());

  // Tick every 60 s while the bracket is still open
  useEffect(() => {
    if (isLocked || !deadline) return;
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [isLocked, deadline]);

  const remaining   = deadline ? new Date(deadline).getTime() - now : 0;
  const isUrgent    = remaining > 0 && remaining < 24 * 60 * 60 * 1000;
  const countdownStr = formatCountdown(remaining);

  // Read mode: show health stats + accuracy bar
  if (isLocked && bracketHealth) {
    const { correct, wrong, pending, pts, totalPotential, decided } = bracketHealth;
    const accuracyPct = decided > 0 ? Math.round((correct / decided) * 100) : 0;

    return (
      <Box sx={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap',
        gap: 1.5, p: 1.5, mb: 1.5,
        background: theme.palette.background.paper,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
      }}>
        {/* Points label */}
        <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap', color: theme.palette.text.secondary }}>
          {pts} / {totalPotential} pts
        </Typography>

        {/* Accuracy bar */}
        <Box sx={{ flex: 1, minWidth: 60 }}>
          <Box sx={{
            height: 4, borderRadius: 2,
            background: theme.palette.action.hover,
            overflow: 'hidden',
          }}>
            <Box sx={{
              height: '100%', borderRadius: 2,
              width: `${accuracyPct}%`,
              background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light || theme.palette.success.main})`,
              transition: 'width 0.4s ease',
            }} />
          </Box>
        </Box>

        {/* Health stats */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
          <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 600, color: theme.palette.success.main }}>
            {correct} {'\u2713'}
          </Typography>
          <Typography component="span" sx={{ fontSize: '0.75rem', color: theme.palette.text.disabled }}>{'\u00B7'}</Typography>
          <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 600, color: theme.palette.error.main }}>
            {wrong} {'\u2717'}
          </Typography>
          <Typography component="span" sx={{ fontSize: '0.75rem', color: theme.palette.text.disabled }}>{'\u00B7'}</Typography>
          <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 600, color: theme.palette.warning.main }}>
            {pending} in play
          </Typography>
        </Box>

        {/* Deadline locked */}
        <Typography variant="body2" sx={{
          fontSize: '0.8rem', whiteSpace: 'nowrap', fontWeight: 600,
          color: 'error.main',
        }}>
          {'\uD83D\uDD12'} Locked — {deadline ? new Date(deadline).toLocaleDateString() : 'deadline passed'}
        </Typography>

        {/* Viewing badge */}
        {viewingPlayerName && (
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontSize: '0.75rem', fontWeight: 600,
            color: theme.palette.text.secondary,
            px: 1.5, py: 0.5, borderRadius: '6px',
            background: theme.palette.action.hover,
            border: `1px solid ${theme.palette.divider}`,
          }}>
            <Box sx={{
              width: 6, height: 6, borderRadius: '50%',
              background: theme.palette.primary.main,
            }} />
            Viewing {viewingPlayerName}'s bracket
          </Box>
        )}

        {/* Inline action buttons */}
        {actionButtons && (
          <Box sx={{ display: 'flex', gap: 1.5, ml: 'auto' }}>
            {actionButtons}
          </Box>
        )}
      </Box>
    );
  }

  // Write mode: progress bar + countdown
  const pct = totalMatchups > 0
    ? Math.round((predictedMatchups / totalMatchups) * 100)
    : 0;

  let deadlineLabel = null;
  let deadlineColor = 'text.secondary';
  if (isLocked) {
    deadlineLabel = '\uD83D\uDD12 Bracket locked — deadline passed';
    deadlineColor = 'error.main';
  } else if (countdownStr) {
    deadlineLabel = `\uD83D\uDD13 Locks in ${countdownStr}`;
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

      {/* Inline action buttons */}
      {actionButtons && (
        <Box sx={{ display: 'flex', gap: 1.5, ml: 'auto' }}>
          {actionButtons}
        </Box>
      )}
    </Box>
  );
}

/**
 * BracketView — top-level layout component.
 * Desktop (>=md): CSS Grid side-by-side bracket with connectors.
 * Mobile (<md):   Horizontal snap-scroll with collapsible conference sections.
 */
const BracketView = ({
  bracket, isLocked, predictedMatchups, totalMatchups, deadline, onMatchupClick,
  bracketHealth, viewingPlayerName, bonusPicks, scoringConfig, actionButtons,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });

  const header = (
    <BracketHeader
      predictedMatchups={predictedMatchups}
      totalMatchups={totalMatchups}
      isLocked={isLocked}
      deadline={deadline}
      bracketHealth={bracketHealth}
      viewingPlayerName={viewingPlayerName}
      actionButtons={actionButtons}
    />
  );

  if (isMobile) {
    return (
      <Box>
        <Box sx={{
          px: 2,
          position: 'sticky',
          top: 56,
          zIndex: 10,
          bgcolor: 'background.default',
          pb: 0.5,
        }}>
          {header}
        </Box>
        <MobileBracketScroll
          bracket={bracket}
          isLocked={isLocked}
          onMatchupClick={onMatchupClick}
          bonusPicks={bonusPicks}
          scoringConfig={scoringConfig}
        />
      </Box>
    );
  }

  // Desktop — CSS Grid bracket
  return (
    <Box>
      {header}
      <DesktopBracketGrid
        bracket={bracket}
        isLocked={isLocked}
        onMatchupClick={onMatchupClick}
        bonusPicks={bonusPicks}
        scoringConfig={scoringConfig}
      />
    </Box>
  );
};

export default BracketView;

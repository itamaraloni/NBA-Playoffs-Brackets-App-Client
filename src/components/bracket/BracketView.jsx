import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Lock as LockIcon } from '@mui/icons-material';
import { BsBullseye } from 'react-icons/bs';
import { TbCrystalBall } from 'react-icons/tb';
import { AiOutlineCloseCircle } from 'react-icons/ai';
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
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const mins = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

/**
 * BracketHeader - adapts between write mode (progress bar + countdown) and
 * read mode (health stats + accuracy bar + viewing badge).
 */
function BracketHeader({
  predictedMatchups,
  totalMatchups,
  isLocked,
  deadline,
  bracketHealth,
  viewingPlayerName,
  actionButtons,
  flat,
  isActualBracket
}) {
  const theme = useTheme();
  const [now, setNow] = useState(Date.now());
  const lockedDateLabel = deadline ? new Date(deadline).toLocaleDateString() : null;

  // Tick every 60 s while the bracket is still open
  useEffect(() => {
    if (isLocked || !deadline) return undefined;
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [isLocked, deadline]);

  const remaining = deadline ? new Date(deadline).getTime() - now : 0;
  const isUrgent = remaining > 0 && remaining < 24 * 60 * 60 * 1000;
  const countdownStr = formatCountdown(remaining);

  // Actual bracket mode: minimal header - viewing badge + locked indicator, no health stats
  if (isActualBracket) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1.5,
        p: 1.5,
        mb: flat ? 0 : 1.5,
        background: theme.palette.background.paper,
        borderRadius: flat ? 0 : 2,
        border: flat ? 'none' : `1px solid ${theme.palette.divider}`,
        ...(flat && { borderBottom: `1px solid ${theme.palette.divider}` }),
      }}>
        {viewingPlayerName && (
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: theme.palette.text.secondary,
            px: 1.5,
            py: 0.5,
            borderRadius: '6px',
            background: alpha(theme.palette.warning.main, 0.1),
            border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
          }}>
            <Box sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: theme.palette.warning.main,
            }} />
            Viewing {viewingPlayerName}'s bracket
          </Box>
        )}
        <Typography variant="body2" sx={{
          fontSize: '0.8rem',
          whiteSpace: 'nowrap',
          fontWeight: 600,
          color: 'text.secondary',
        }}>
          {'\uD83C\uDFC0'} Actual NBA Playoff Results
        </Typography>
      </Box>
    );
  }

  // Read mode: show health stats + accuracy bar
  if (isLocked && bracketHealth) {
    const {
      bullseyes = 0,
      hits = 0,
      misses = 0,
      pending = 0,
      pts,
      totalPotential
    } = bracketHealth;
    const trackedMatchups = bullseyes + hits + misses + pending;
    const bullseyePct = trackedMatchups > 0 ? (bullseyes / trackedMatchups) * 100 : 0;
    const hitPct = trackedMatchups > 0 ? (hits / trackedMatchups) * 100 : 0;
    const missPct = trackedMatchups > 0 ? (misses / trackedMatchups) * 100 : 0;
    const pendingPct = trackedMatchups > 0 ? (pending / trackedMatchups) * 100 : 0;

    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1.5,
        p: 1.5,
        mb: flat ? 0 : 1.5,
        background: theme.palette.background.paper,
        borderRadius: flat ? 0 : 2,
        border: flat ? 'none' : `1px solid ${theme.palette.divider}`,
        ...(flat && { borderBottom: `1px solid ${theme.palette.divider}` }),
      }}>
        <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap', color: theme.palette.text.secondary }}>
          {pts} / {totalPotential} pts
        </Typography>

        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.25,
            py: 0.5,
            borderRadius: '999px',
            color: theme.palette.error.main,
            background: alpha(theme.palette.error.main, 0.08),
            border: `1px solid ${alpha(theme.palette.error.main, 0.24)}`,
          }}
        >
          <LockIcon sx={{ fontSize: '0.9rem' }} />
          <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {lockedDateLabel ? `Bracket locked on ${lockedDateLabel}` : 'Bracket locked'}
          </Typography>
        </Box>

        <Box sx={{ flex: 1, minWidth: 90 }}>
          <Box sx={{
            height: 6,
            borderRadius: 3,
            background: theme.palette.action.hover,
            overflow: 'hidden',
            display: 'flex',
          }}>
            {bullseyePct > 0 && (
              <Box sx={{
                height: '100%',
                width: `${bullseyePct}%`,
                background: theme.palette.success.main,
                transition: 'width 0.4s ease',
              }} />
            )}
            {hitPct > 0 && (
              <Box sx={{
                height: '100%',
                width: `${hitPct}%`,
                background: theme.palette.warning.main,
                transition: 'width 0.4s ease',
              }} />
            )}
            {missPct > 0 && (
              <Box sx={{
                height: '100%',
                width: `${missPct}%`,
                background: theme.palette.error.main,
                transition: 'width 0.4s ease',
              }} />
            )}
            {pendingPct > 0 && (
              <Box sx={{
                height: '100%',
                width: `${pendingPct}%`,
                background: alpha(theme.palette.text.primary, 0.2),
                transition: 'width 0.4s ease',
              }} />
            )}
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            whiteSpace: 'nowrap',
            flexWrap: 'wrap',
            flexBasis: { xs: '100%', md: 'auto' },
            justifyContent: { xs: 'center', md: 'flex-start' },
            width: { xs: '100%', md: 'auto' },
          }}
        >
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: theme.palette.success.main }}>
            <TbCrystalBall size={14} />
            <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
              {bullseyes}
            </Typography>
          </Box>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: theme.palette.warning.main }}>
            <BsBullseye size={13} />
            <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
              {hits}
            </Typography>
          </Box>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: theme.palette.error.main }}>
            <AiOutlineCloseCircle size={14} />
            <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
              {misses}
            </Typography>
          </Box>
          <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 600, color: theme.palette.text.secondary }}>
            {pending} in play
          </Typography>
        </Box>

        {viewingPlayerName && (
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: theme.palette.text.secondary,
            px: 1.5,
            py: 0.5,
            borderRadius: '6px',
            background: theme.palette.action.hover,
            border: `1px solid ${theme.palette.divider}`,
          }}>
            <Box sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: theme.palette.primary.main,
            }} />
            Viewing {viewingPlayerName}'s bracket
          </Box>
        )}

        {actionButtons && (
          <Box sx={{ display: 'flex', gap: 1.5, ml: { md: 'auto' }, flexBasis: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'center', md: 'flex-end' } }}>
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
    deadlineLabel = lockedDateLabel ? `\uD83D\uDD12 Bracket locked on ${lockedDateLabel}` : '\uD83D\uDD12 Bracket locked';
    deadlineColor = 'error.main';
  } else if (countdownStr) {
    deadlineLabel = `\uD83D\uDD13 Locks in ${countdownStr}`;
    deadlineColor = isUrgent ? 'error.main' : 'text.secondary';
  }

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 2,
      p: 1.5,
      mb: flat ? 0 : 1.5,
      background: theme.palette.background.paper,
      borderRadius: flat ? 0 : 2,
      border: flat ? 'none' : `1px solid ${theme.palette.divider}`,
      ...(flat && { borderBottom: `1px solid ${theme.palette.divider}` }),
    }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
        {predictedMatchups} / {totalMatchups} predicted
      </Typography>

      <Box sx={{ flex: 1, minWidth: 80 }}>
        <Box sx={{
          height: 4,
          borderRadius: 2,
          background: theme.palette.action.hover,
          overflow: 'hidden',
        }}>
          <Box sx={{
            height: '100%',
            borderRadius: 2,
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.65)})`,
            transition: 'width 0.4s ease',
          }} />
        </Box>
      </Box>

      {deadlineLabel && (
        <Typography variant="body2" sx={{
          fontSize: '0.8rem',
          whiteSpace: 'nowrap',
          fontWeight: isUrgent || isLocked ? 600 : 400,
          color: deadlineColor,
        }}>
          {deadlineLabel}
        </Typography>
      )}

      {actionButtons && (
        <Box sx={{ display: 'flex', gap: 1.5, ml: { md: 'auto' }, flexBasis: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'center', md: 'flex-end' } }}>
          {actionButtons}
        </Box>
      )}
    </Box>
  );
}

/**
 * BracketView - top-level layout component.
 * Desktop (>=md): CSS Grid side-by-side bracket with connectors.
 * Mobile (<md): Horizontal snap-scroll with collapsible conference sections.
 */
const APPBAR_HEIGHT_MOBILE = 56; // MUI default mobile toolbar height

const BracketView = ({
  bracket,
  isLocked,
  predictedMatchups,
  totalMatchups,
  deadline,
  onMatchupClick,
  bracketHealth,
  viewingPlayerName,
  bonusPicks,
  scoringConfig,
  actionButtons,
  stickyHeaderTop = APPBAR_HEIGHT_MOBILE,
  isActualBracket,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });

  const inDialog = stickyHeaderTop === 0;

  const header = (
    <BracketHeader
      predictedMatchups={predictedMatchups}
      totalMatchups={totalMatchups}
      isLocked={isLocked}
      deadline={deadline}
      bracketHealth={bracketHealth}
      viewingPlayerName={viewingPlayerName}
      actionButtons={actionButtons}
      flat={inDialog}
      isActualBracket={isActualBracket}
    />
  );

  if (isMobile) {
    return (
      <Box>
        <Box sx={{
          px: inDialog ? 0 : 2,
          position: 'sticky',
          top: stickyHeaderTop,
          zIndex: 10,
          bgcolor: inDialog ? 'background.paper' : 'background.default',
          pb: inDialog ? 0 : 0.5,
        }}>
          {header}
        </Box>
        <MobileBracketScroll
          bracket={bracket}
          isLocked={isLocked}
          onMatchupClick={onMatchupClick}
          bonusPicks={bonusPicks}
          scoringConfig={scoringConfig}
          inDialog={inDialog}
        />
      </Box>
    );
  }

  // Desktop - CSS Grid bracket
  return (
    <Box>
      {header}
      <Box sx={{ overflowX: 'auto' }}>
        <DesktopBracketGrid
          bracket={bracket}
          isLocked={isLocked}
          onMatchupClick={onMatchupClick}
          bonusPicks={bonusPicks}
          scoringConfig={scoringConfig}
        />
      </Box>
    </Box>
  );
};

export default BracketView;

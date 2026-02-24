import React, { useState } from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

/** Derives the logo path from the team name stored in the API response.
 *  "Oklahoma City Thunder" → "/resources/team-logos/oklahoma-city-thunder.png" */
function getLogoPath(teamName) {
  return `/resources/team-logos/${teamName.toLowerCase().replace(/ /g, '-')}.png`;
}

/** Team logo circle — falls back to 3-letter abbreviation if the image 404s. */
function TeamLogo({ name }) {
  const theme = useTheme();
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <Box
        component="img"
        src={getLogoPath(name)}
        alt={name}
        onError={() => setImgError(true)}
        sx={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, objectFit: 'contain' }}
      />
    );
  }

  // Fallback: 3-letter abbreviation badge
  return (
    <Box sx={{
      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.4375rem', fontWeight: 800, letterSpacing: '-0.3px',
      background: theme.palette.action.selected,
      color: theme.palette.text.primary,
    }}>
      {name?.slice(0, 3).toUpperCase()}
    </Box>
  );
}

/**
 * Renders a single team row inside a matchup card.
 * Handles all visual states: TBD, predicted, correct, wrong, actual-winner overlay.
 */
function TeamRow({ team, seed, isPredWinner, isActualWinner, hasPick, isPlayed }) {
  const theme = useTheme();

  // TBD slot — team not yet determined
  if (!team) {
    return (
      <Box sx={{
        display: 'flex', alignItems: 'center',
        px: '9px', minHeight: 36, py: '7px',
      }}>
        <Typography sx={{
          fontSize: '0.6875rem', fontStyle: 'italic',
          color: theme.palette.text.disabled,
        }}>
          TBD
        </Typography>
      </Box>
    );
  }

  // Determine row background, left border, and state icon
  let rowBg = 'transparent';
  let borderLeft = '2px solid transparent'; // keep layout stable
  let icon = null;

  if (hasPick) {
    if (!isPlayed) {
      // Pending prediction — highlight predicted winner in primary blue
      if (isPredWinner) {
        rowBg = alpha(theme.palette.primary.main, 0.15);
        icon = (
          <Typography component="span" sx={{
            fontSize: '0.6875rem', color: theme.palette.primary.light,
            width: 14, textAlign: 'center', lineHeight: 1, flexShrink: 0,
          }}>✓</Typography>
        );
      }
    } else {
      // Game played — show result vs prediction
      if (isPredWinner && isActualWinner) {
        // Correct prediction
        rowBg = alpha(theme.palette.success.main, 0.16);
        borderLeft = `2px solid ${alpha(theme.palette.success.main, 0.4)}`;
        icon = (
          <Typography component="span" sx={{
            fontSize: '0.6875rem', color: theme.palette.success.light,
            width: 14, textAlign: 'center', lineHeight: 1, flexShrink: 0,
          }}>✓</Typography>
        );
      } else if (isPredWinner && !isActualWinner) {
        // Wrong prediction — picked the loser
        rowBg = alpha(theme.palette.error.main, 0.16);
        borderLeft = `2px solid ${alpha(theme.palette.error.main, 0.4)}`;
        icon = (
          <Typography component="span" sx={{
            fontSize: '0.6875rem', color: theme.palette.error.light,
            width: 14, textAlign: 'center', lineHeight: 1, flexShrink: 0,
          }}>✗</Typography>
        );
      } else if (!isPredWinner && isActualWinner) {
        // Actual winner (user picked wrong team — show who actually won)
        rowBg = alpha(theme.palette.success.main, 0.16);
        borderLeft = `2px solid ${alpha(theme.palette.success.main, 0.4)}`;
        icon = (
          <Typography component="span" sx={{
            fontSize: '0.6875rem', color: theme.palette.success.light,
            width: 14, textAlign: 'center', lineHeight: 1, flexShrink: 0,
          }}>✓</Typography>
        );
      }
    }
  } else if (isPlayed && isActualWinner) {
    // No pick made, game played — still show actual winner in green
    rowBg = alpha(theme.palette.success.main, 0.16);
    borderLeft = `2px solid ${alpha(theme.palette.success.main, 0.4)}`;
    icon = (
      <Typography component="span" sx={{
        fontSize: '0.6875rem', color: theme.palette.success.light,
        width: 14, textAlign: 'center', lineHeight: 1, flexShrink: 0,
      }}>✓</Typography>
    );
  }

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: '7px',
      px: '9px', minHeight: 36, py: '7px',
      background: rowBg,
      borderLeft,
      transition: 'background 0.15s',
    }}>
      {seed != null && (
        <Typography sx={{
          fontSize: '0.625rem', fontWeight: 700,
          color: theme.palette.text.secondary,
          minWidth: 18, flexShrink: 0,
        }}>
          #{seed}
        </Typography>
      )}
      <TeamLogo name={team.name} />
      <Typography sx={{
        fontSize: '0.6875rem', fontWeight: 600,
        flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {team.name}
      </Typography>
      {icon}
    </Box>
  );
}

/**
 * BracketMatchup — the individual matchup card.
 *
 * Props:
 *   matchup  — enriched matchup object from BracketServices.transformBracketData
 *   isLocked — whether the bracket deadline has passed
 *   isFinals — apply gold accent styling for the NBA Finals card
 *
 * Phase 1-F-b: display-only (no onClick). Phase 1-F-c will add onMatchupClick prop.
 */
const BracketMatchup = ({ matchup: m, isLocked, isFinals }) => {
  const theme = useTheme();

  if (!m) return null;

  const cardSx = {
    borderRadius: '10px',
    overflow: 'hidden',
    opacity: m.isTbd ? 0.38 : 1,
    cursor: 'default',
    border: isFinals
      ? '1px solid rgba(245,158,11,0.22)'
      : `1px solid ${theme.palette.divider}`,
    boxShadow: isFinals
      ? '0 4px 20px rgba(245,158,11,0.1), 0 2px 10px rgba(0,0,0,0.15)'
      : theme.shadows[1],
    transition: 'transform 0.15s, box-shadow 0.15s',
  };

  // predWinnerIsTeam1: true when pick points to team_1
  // isPredWinner for team2 = hasPick AND predWinnerIsTeam1 is false
  const t1IsPredWinner   = m.predWinnerIsTeam1;
  const t2IsPredWinner   = m.hasPick && !m.predWinnerIsTeam1;
  const t1IsActualWinner = m.actualWinnerIsTeam1;
  const t2IsActualWinner = m.isPlayed && !m.actualWinnerIsTeam1;

  // Score bar — shown when user has a pick OR when the game has been played
  const showScoreBar = m.hasPick || m.isPlayed;
  // For play-in rounds there is no series score (winner-takes-all)
  const predScore = (m.hasPick && !m.isPlayin && m.predicted_series_score)
    ? m.predicted_series_score
    : null;
  const actScore  = m.isPlayed ? m.actual_series_score : null;

  return (
    <Paper elevation={0} sx={cardSx}>
      <TeamRow
        team={m.team_1}
        seed={m.team_1?.seed}
        isPredWinner={t1IsPredWinner}
        isActualWinner={t1IsActualWinner}
        hasPick={m.hasPick}
        isPlayed={m.isPlayed}
      />
      <Box sx={{ borderTop: `1px solid ${theme.palette.divider}` }}>
        <TeamRow
          team={m.team_2}
          seed={m.team_2?.seed}
          isPredWinner={t2IsPredWinner}
          isActualWinner={t2IsActualWinner}
          hasPick={m.hasPick}
          isPlayed={m.isPlayed}
        />
      </Box>

      {showScoreBar && (
        <Box sx={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          px: '9px', py: '3px',
          background: theme.palette.mode === 'dark'
            ? 'rgba(0,0,0,0.18)'
            : 'rgba(0,0,0,0.04)',
          borderTop: `1px solid ${theme.palette.divider}`,
        }}>
          <Typography sx={{ fontSize: '0.5625rem', color: theme.palette.text.secondary }}>
            Pred: {predScore || '—'}
          </Typography>
          {actScore && (
            <Typography sx={{
              fontSize: '0.5625rem', fontWeight: 700,
              color: m.isCorrect === true
                ? theme.palette.success.main
                : m.isCorrect === false
                  ? theme.palette.error.main
                  : theme.palette.text.secondary,
            }}>
              Act: {actScore} {m.isCorrect === true ? '✓' : m.isCorrect === false ? '✗' : ''}
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default BracketMatchup;

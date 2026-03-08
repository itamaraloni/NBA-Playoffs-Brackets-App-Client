import React, { useState } from 'react';
import { Box, Chip, Paper, Tooltip, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { getLogoPath, getShortTeamName } from '../shared/teamUtils';

function getMatchupResultState(m) {
  if (!m?.hasPick) return 'na';
  if (m?.isMatchupExist === false) return 'eliminated';
  if (!m?.isPlayed) return 'pending';

  const isBullseye =
    m.isCorrect === true &&
    !m.isPlayin &&
    Boolean(m.predicted_series_score) &&
    Boolean(m.actual_series_score) &&
    m.predicted_series_score === m.actual_series_score;

  if (isBullseye) return 'bullseye';
  if (m.isCorrect === true) return 'hit';
  if (m.isCorrect === false) return 'miss';
  return 'na';
}

function getResultChipConfig(state, theme) {
  switch (state) {
    case 'bullseye':
      return {
        label: 'Bulls-eye',
        sx: {
          color: theme.palette.success.main,
          background: alpha(theme.palette.success.main, 0.14),
          borderColor: alpha(theme.palette.success.main, 0.35),
        },
      };
    case 'hit':
      return {
        label: 'Hit',
        sx: {
          color: theme.palette.success.main,
          background: alpha(theme.palette.success.main, 0.14),
          borderColor: alpha(theme.palette.success.main, 0.35),
        },
      };
    case 'miss':
      return {
        label: 'Miss',
        sx: {
          color: theme.palette.error.main,
          background: alpha(theme.palette.error.main, 0.14),
          borderColor: alpha(theme.palette.error.main, 0.35),
        },
      };
    case 'pending':
      return {
        label: 'Pending',
        sx: {
          color: theme.palette.warning.main,
          background: alpha(theme.palette.warning.main, 0.14),
          borderColor: alpha(theme.palette.warning.main, 0.35),
        },
      };
    case 'eliminated':
      return {
        label: 'Eliminated',
        sx: {
          color: theme.palette.error.main,
          background: alpha(theme.palette.error.main, 0.12),
          borderColor: alpha(theme.palette.error.main, 0.3),
        },
      };
    default:
      return {
        label: 'N/A',
        sx: {
          color: theme.palette.text.secondary,
          background: alpha(theme.palette.text.primary, 0.08),
          borderColor: theme.palette.divider,
        },
      };
  }
}

function getResultTooltip(state) {
  switch (state) {
    case 'bullseye':
      return 'You got the winner and exact series score right.';
    case 'hit':
      return 'You got the winner right.';
    case 'miss':
      return 'This matchup happened, but your predicted winner was wrong.';
    case 'pending':
      return 'This matchup is still alive, but the real result is not decided yet.';
    case 'eliminated':
      return 'Your predicted matchup did not happen, so this bracket pick is eliminated.';
    default:
      return 'No pick was made for this matchup.';
  }
}

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

  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.4375rem',
        fontWeight: 800,
        letterSpacing: '-0.3px',
        background: theme.palette.action.selected,
        color: theme.palette.text.primary,
      }}
    >
      {name?.slice(0, 3).toUpperCase()}
    </Box>
  );
}

function TeamRow({ team, seed, isPredWinner, isActualWinner, hasPick, isPlayed }) {
  const theme = useTheme();

  if (!team) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', px: '9px', minHeight: 36, py: '7px' }}>
        <Typography sx={{ fontSize: '0.6875rem', fontStyle: 'italic', color: theme.palette.text.disabled }}>
          TBD
        </Typography>
      </Box>
    );
  }

  let rowBg = 'transparent';
  let borderLeft = '2px solid transparent';
  let icon = null;

  if (hasPick) {
    if (!isPlayed) {
      if (isPredWinner) {
        rowBg = alpha(theme.palette.primary.main, 0.15);
        icon = (
          <Typography
            component="span"
            sx={{
              fontSize: '0.6875rem',
              color: theme.palette.primary.light,
              width: 14,
              textAlign: 'center',
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            {'\u2713'}
          </Typography>
        );
      }
    } else {
      if (isPredWinner && isActualWinner) {
        rowBg = alpha(theme.palette.success.main, 0.16);
        borderLeft = `2px solid ${alpha(theme.palette.success.main, 0.4)}`;
        icon = (
          <Typography
            component="span"
            sx={{
              fontSize: '0.6875rem',
              color: theme.palette.success.light,
              width: 14,
              textAlign: 'center',
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            {'\u2713'}
          </Typography>
        );
      } else if (isPredWinner && !isActualWinner) {
        rowBg = alpha(theme.palette.error.main, 0.16);
        borderLeft = `2px solid ${alpha(theme.palette.error.main, 0.4)}`;
        icon = (
          <Typography
            component="span"
            sx={{
              fontSize: '0.6875rem',
              color: theme.palette.error.light,
              width: 14,
              textAlign: 'center',
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            {'\u2717'}
          </Typography>
        );
      } else if (!isPredWinner && isActualWinner) {
        rowBg = alpha(theme.palette.success.main, 0.16);
        borderLeft = `2px solid ${alpha(theme.palette.success.main, 0.4)}`;
        icon = (
          <Typography
            component="span"
            sx={{
              fontSize: '0.6875rem',
              color: theme.palette.success.light,
              width: 14,
              textAlign: 'center',
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            {'\u2713'}
          </Typography>
        );
      }
    }
  } else if (isPlayed && isActualWinner) {
    rowBg = alpha(theme.palette.success.main, 0.16);
    borderLeft = `2px solid ${alpha(theme.palette.success.main, 0.4)}`;
    icon = (
      <Typography
        component="span"
        sx={{
          fontSize: '0.6875rem',
          color: theme.palette.success.light,
          width: 14,
          textAlign: 'center',
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        {'\u2713'}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        px: '9px',
        minHeight: 36,
        py: '7px',
        background: rowBg,
        borderLeft,
        transition: 'background 0.15s',
      }}
    >
      {seed != null && (
        <Typography
          sx={{
            fontSize: '0.625rem',
            fontWeight: 700,
            color: theme.palette.text.secondary,
            minWidth: 18,
            flexShrink: 0,
          }}
        >
          #{seed}
        </Typography>
      )}
      <TeamLogo name={team.name} />
      <Typography
        sx={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {team.name}
      </Typography>
      {icon}
    </Box>
  );
}

const BracketMatchup = ({ matchup: m, isLocked, isFinals, onMatchupClick }) => {
  const theme = useTheme();

  if (!m) return null;

  const resultState = getMatchupResultState(m);
  const resultChip = getResultChipConfig(resultState, theme);
  const resultTooltip = getResultTooltip(resultState);

  const isClickable = Boolean(onMatchupClick && m.can_edit && !isLocked);

  const cardSx = {
    borderRadius: '10px',
    overflow: 'hidden',
    opacity: m.isTbd ? 0.38 : isLocked ? 0.6 : 1,
    cursor: isClickable ? 'pointer' : 'default',
    border: isFinals ? '1px solid rgba(245,158,11,0.22)' : `1px solid ${theme.palette.divider}`,
    boxShadow: isFinals
      ? '0 4px 20px rgba(245,158,11,0.1), 0 2px 10px rgba(0,0,0,0.15)'
      : theme.shadows[1],
    transition: 'transform 0.15s, box-shadow 0.15s',
    '&:hover': isClickable
      ? {
          transform: 'translateY(-1px)',
          boxShadow: theme.shadows[4],
        }
      : {},
  };

  const t1IsPredWinner = m.predWinnerIsTeam1;
  const t2IsPredWinner = m.predWinnerIsTeam2;
  const t1IsActualWinner = m.actualWinnerIsTeam1;
  const t2IsActualWinner = m.actualWinnerIsTeam2;

  const showScoreBar = m.hasPick || m.isPlayed;
  const predictedWinnerTeamName = m.hasPick
    ? (m.predWinnerIsTeam1 ? m.team_1?.name : m.team_2?.name)
    : null;
  const actualWinnerTeamName = m.isPlayed
    ? (m.actualWinnerIsTeam1 ? m.team_1?.name : m.team_2?.name)
    : null;

  const predValue = m.isPlayin
    ? (m.hasPick ? getShortTeamName(predictedWinnerTeamName) : 'N/A')
    : (m.predicted_series_score || '-');
  const isEliminated = resultState === 'eliminated';
  const actValue = isEliminated ? null
    : m.isPlayin
      ? (m.isPlayed ? getShortTeamName(actualWinnerTeamName) : null)
      : (m.isPlayed ? m.actual_series_score : null);
  const resultChipLabel = actValue ? `${resultChip.label} • ${actValue}` : resultChip.label;

  return (
    <Paper elevation={0} sx={cardSx} onClick={isClickable ? () => onMatchupClick(m) : undefined}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: '9px', pt: '6px', pb: '2px' }}>
        <Tooltip
          title={resultTooltip}
          arrow
          placement="top"
          describeChild
          enterTouchDelay={0}
          leaveTouchDelay={3500}
        >
          <Box
            component="span"
            sx={{ display: 'inline-flex' }}
            onClick={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
          >
            <Chip
              size="small"
              variant="outlined"
              label={resultChipLabel}
              sx={{
                height: 18,
                fontSize: '0.5625rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                '& .MuiChip-label': { px: '6px' },
                ...resultChip.sx,
              }}
            />
          </Box>
        </Tooltip>
      </Box>
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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            px: '9px',
            py: '3px',
            background: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.04)',
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography sx={{ fontSize: '0.5625rem', color: theme.palette.text.secondary }}>
            Pred: {predValue}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default BracketMatchup;

import React, { useState } from 'react';
import { Box, Chip, Paper, Tooltip, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { getLogoPath, getShortTeamName } from '../../shared/teamUtils';
import { getMatchupResultState } from '../../utils/bracketUtils';

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
    case 'voided':
      return {
        label: 'Voided',
        sx: {
          color: theme.palette.error.main,
          background: alpha(theme.palette.error.main, 0.12),
          borderColor: alpha(theme.palette.error.main, 0.3),
        },
      };
    default:
      return {
        label: 'TBD',
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
      return 'Correct winner and exact series score.';
    case 'hit':
      return 'Correct winner, wrong series score.';
    case 'miss':
      return 'Wrong winner prediction.';
    case 'pending':
      return 'Series not yet decided.';
    case 'voided':
      return 'This matchup never occurred.';
    default:
      return 'No prediction made yet.';
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

function TeamRow({ team, seed, isPredWinner, isActualWinner, hasPick, isPlayed, isMiss, isVoided, compact }) {
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

  if (hasPick) {
    if (!isPlayed) {
      // Write mode: blue highlight on predicted winner
      if (isPredWinner) {
        rowBg = alpha(theme.palette.primary.main, 0.15);
        borderLeft = `2px solid ${alpha(theme.palette.primary.main, 0.4)}`;
      }
    } else {
      // Read mode: color-coding only — green=correct, red=incorrect
      if (isPredWinner && isActualWinner) {
        rowBg = alpha(theme.palette.success.main, 0.16);
        borderLeft = `2px solid ${alpha(theme.palette.success.main, 0.4)}`;
      } else if (isPredWinner && !isActualWinner) {
        rowBg = alpha(theme.palette.error.main, 0.16);
        borderLeft = `2px solid ${alpha(theme.palette.error.main, 0.4)}`;
      } else if (!isPredWinner && isActualWinner) {
        if (!isMiss) {
          // Hit/bullseye — highlight actual winner green
          rowBg = alpha(theme.palette.success.main, 0.16);
          borderLeft = `2px solid ${alpha(theme.palette.success.main, 0.4)}`;
        }
      }
    }
  } else if (isPlayed && isActualWinner) {
    rowBg = alpha(theme.palette.success.main, 0.16);
    borderLeft = `2px solid ${alpha(theme.palette.success.main, 0.4)}`;
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
          ...(isVoided && isPredWinner && {
            textDecoration: 'line-through',
            color: theme.palette.text.disabled,
          }),
        }}
      >
        {compact ? getShortTeamName(team.name) : team.name}
      </Typography>
    </Box>
  );
}

const BracketMatchup = ({ matchup: m, isLocked, isFinals, onMatchupClick, compact }) => {
  const theme = useTheme();

  if (!m) return null;

  // In write mode (!isLocked), suppress real-world results — show pending/TBD only
  const resultState = !isLocked
    ? (m.hasPick ? 'pending' : 'na')
    : getMatchupResultState(m);
  const resultChip = getResultChipConfig(resultState, theme);
  const resultTooltip = getResultTooltip(resultState);
  const isMiss = resultState === 'miss';
  const isVoided = resultState === 'voided';

  const isClickable = Boolean(onMatchupClick && m.can_edit && !isLocked);

  const cardSx = {
    borderRadius: '10px',
    overflow: 'hidden',
    opacity: m.isTbd ? 0.55 : isVoided ? 0.5 : 1,
    cursor: isClickable ? 'pointer' : 'default',
    border: m.isTbd
      ? `1px dashed ${theme.palette.divider}`
      : isFinals
        ? `1px solid ${alpha(theme.palette.warning.main, 0.35)}`
        : `1px solid ${theme.palette.divider}`,
    boxShadow: isFinals
      ? `0 4px 20px ${alpha(theme.palette.warning.main, 0.15)}, 0 2px 10px ${alpha(theme.palette.common.black, 0.15)}`
      : theme.shadows[1],
    transition: 'transform 0.15s, box-shadow 0.15s',
    '&:hover': (isClickable && !m.isTbd && !isVoided)
      ? {
          transform: 'translateY(-1px)',
          boxShadow: theme.shadows[4],
        }
      : {},
    '&:focus-visible': isClickable
      ? {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        }
      : {},
  };

  const t1IsPredWinner = m.predWinnerIsTeam1;
  const t2IsPredWinner = m.predWinnerIsTeam2;
  const t1IsActualWinner = m.actualWinnerIsTeam1;
  const t2IsActualWinner = m.actualWinnerIsTeam2;

  // Build chip label with team name + score appended
  const actualWinnerName = m.isPlayed
    ? getShortTeamName(m.actualWinnerIsTeam1 ? m.team_1?.name : m.team_2?.name)
    : null;

  let chipSuffix = '';
  if (resultState === 'bullseye' || resultState === 'hit' || resultState === 'miss') {
    // Append actual winner + actual score for best-of-7, just winner for play-in
    chipSuffix = m.isPlayin
      ? (actualWinnerName ? ` \u00B7 ${actualWinnerName}` : '')
      : (actualWinnerName && m.actual_series_score
          ? ` \u00B7 ${actualWinnerName} ${m.actual_series_score}`
          : '');
  } else if (resultState === 'pending' && m.seriesProgress && isLocked) {
    chipSuffix = ` \u00B7 ${m.seriesProgress}`;
  }

  const resultChipLabel = `${resultChip.label}${chipSuffix}`;

  // Score bar: "Prediction: Team 4-1" — hidden for play-in (team row highlight is sufficient)
  const showScoreBar = m.hasPick && !m.isPlayin;
  const predictedWinnerName = m.hasPick
    ? getShortTeamName(m.predWinnerIsTeam1 ? m.team_1?.name : m.team_2?.name)
    : null;

  let scoreBarText = null;
  if (showScoreBar && predictedWinnerName) {
    scoreBarText = `Prediction: ${predictedWinnerName} ${m.predicted_series_score || ''}`;
  }

  const handleKeyDown = isClickable
    ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onMatchupClick(m); } }
    : undefined;

  return (
    <Paper
      elevation={0}
      sx={cardSx}
      onClick={isClickable ? () => onMatchupClick(m) : undefined}
      onKeyDown={handleKeyDown}
      tabIndex={isClickable ? 0 : undefined}
      role={isClickable ? 'button' : undefined}
      aria-label={isClickable ? `Predict ${m.team_1?.name || 'TBD'} vs ${m.team_2?.name || 'TBD'}` : undefined}
    >
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
                fontSize: '0.625rem',
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
        isPlayed={isLocked && m.isPlayed}
        isMiss={isMiss}
        isVoided={isVoided}
        compact={compact}
      />
      <Box sx={{ borderTop: `1px solid ${theme.palette.divider}` }}>
        <TeamRow
          team={m.team_2}
          seed={m.team_2?.seed}
          isPredWinner={t2IsPredWinner}
          isActualWinner={t2IsActualWinner}
          hasPick={m.hasPick}
          isPlayed={isLocked && m.isPlayed}
          isMiss={isMiss}
          isVoided={isVoided}
          compact={compact}
        />
      </Box>

      {showScoreBar && scoreBarText && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            px: '9px',
            py: '3px',
            background: alpha(theme.palette.text.primary, 0.06),
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            component="span"
            sx={{ fontSize: '0.625rem', fontWeight: 400, opacity: 0.7, color: theme.palette.text.secondary }}
          >
            Prediction:
          </Typography>
          <Typography
            component="span"
            sx={{ fontSize: '0.625rem', fontWeight: 700, color: theme.palette.text.secondary }}
          >
            {predictedWinnerName}{m.predicted_series_score ? ` ${m.predicted_series_score}` : ''}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default BracketMatchup;

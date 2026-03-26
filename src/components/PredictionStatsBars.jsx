import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { TbCrystalBall } from 'react-icons/tb';
import { BsBullseye } from 'react-icons/bs';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { Lock as LockIcon } from '@mui/icons-material';
import { useScoringConfig } from '../hooks/useScoringConfig';

/**
 * Combines play-in rounds and builds per-round stats rows from the raw
 * hits/bullsEye/misses objects returned by the API.
 *
 * This logic is extracted from the old PredictionStatsTable so the same
 * round aggregation is preserved.
 */
const buildRoundRows = (stats, scoringConfig, predictionType = 'matchup') => {
  if (!stats?.hits) return [];

  const { hits = {}, bullsEye = {}, misses = {} } = stats;

  const rounds = [
    {
      key: 'playin',
      displayName: 'Play-In',
      shortName: 'PI',
      hits: (hits.playin_first || 0) + (hits.playin_second || 0),
      bullsEyes: (bullsEye.playin_first || 0) + (bullsEye.playin_second || 0),
      misses: (misses.playin_first || 0) + (misses.playin_second || 0)
    },
    {
      key: 'first',
      displayName: 'First Round',
      shortName: 'R1',
      hits: hits.first || 0,
      bullsEyes: bullsEye.first || 0,
      misses: misses.first || 0
    },
    {
      key: 'second',
      displayName: 'Conf. Semis',
      shortName: 'CSF',
      hits: hits.second || 0,
      bullsEyes: bullsEye.second || 0,
      misses: misses.second || 0
    },
    {
      key: 'conference_final',
      displayName: 'Conf. Finals',
      shortName: 'CF',
      hits: hits.conference_final || 0,
      bullsEyes: bullsEye.conference_final || 0,
      misses: misses.conference_final || 0
    },
    {
      key: 'final',
      displayName: 'NBA Finals',
      shortName: 'F',
      hits: hits.final || 0,
      bullsEyes: bullsEye.final || 0,
      misses: misses.final || 0
    }
  ];

  // Calculate points per round using scoring config
  return rounds.map(round => {
    let totalPoints = 0;
    if (scoringConfig) {
      const configKey = round.key === 'playin' ? 'playin_first' : round.key;
      const config = scoringConfig[predictionType]?.[configKey];
      if (config) {
        const hitPts = config.hit || 0;
        // Play-in has no bullseye scoring (null in config)
        const bullsEyePts = config.bullseye ?? config.hit;
        totalPoints = (round.hits * hitPts) + (round.bullsEyes * bullsEyePts);
      }
    }
    const total = round.hits + round.bullsEyes + round.misses;
    const accuracy = total > 0 ? Math.round(((round.hits + round.bullsEyes) / total) * 100) : null;
    return { ...round, totalPoints, total, accuracy };
  });
};

/**
 * A single horizontal stacked bar row representing one round's stats.
 * Green = bullseye, Amber = hit, Red = miss.
 */
const RoundBar = ({ row, isBestRound, isMobile, theme }) => {
  const total = row.total;
  const hasData = total > 0;

  // Segment widths as percentages
  const bullsEyePct = hasData ? (row.bullsEyes / total) * 100 : 0;
  const hitPct = hasData ? (row.hits / total) * 100 : 0;
  const missPct = hasData ? (row.misses / total) * 100 : 0;

  const barHeight = isMobile ? 14 : 18;

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? 1 : 1.5,
      py: isMobile ? 0.75 : 1,
      px: 1.5,
      borderRadius: 1,
      ...(isBestRound && hasData && {
        bgcolor: theme.palette.mode === 'dark'
          ? 'rgba(46, 125, 50, 0.15)'
          : 'rgba(46, 125, 50, 0.08)',
        borderLeft: `3px solid ${theme.palette.success.main}`,
        pl: 1.25
      })
    }}>
      {/* Round label */}
      <Typography
        variant="body2"
        fontWeight={isBestRound && hasData ? 700 : 500}
        sx={{
          width: isMobile ? 36 : 100,
          flexShrink: 0,
          fontSize: isMobile ? '0.75rem' : '0.8125rem'
        }}
        noWrap
      >
        {isMobile ? row.shortName : row.displayName}
      </Typography>

      {/* Stacked bar */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        height: barHeight,
        borderRadius: barHeight / 2,
        overflow: 'hidden',
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
      }}>
        {hasData ? (
          <>
            {bullsEyePct > 0 && (
              <Box sx={{
                width: `${bullsEyePct}%`,
                bgcolor: theme.palette.success.main,
                transition: 'width 0.4s ease'
              }} />
            )}
            {hitPct > 0 && (
              <Box sx={{
                width: `${hitPct}%`,
                bgcolor: theme.palette.warning.main,
                transition: 'width 0.4s ease'
              }} />
            )}
            {missPct > 0 && (
              <Box sx={{
                width: `${missPct}%`,
                bgcolor: theme.palette.error.main,
                opacity: 0.7,
                transition: 'width 0.4s ease'
              }} />
            )}
          </>
        ) : null}
      </Box>

      {/* Stats numbers */}
      <Box sx={{
        display: 'flex',
        gap: isMobile ? 0.5 : 1,
        alignItems: 'center',
        flexShrink: 0
      }}>
        {!isMobile && (
          <Typography variant="caption" color="text.secondary" sx={{ width: 32, textAlign: 'right' }}>
            {hasData ? `${row.accuracy}%` : '—'}
          </Typography>
        )}
        <Typography
          variant="body2"
          fontWeight={700}
          sx={{
            width: isMobile ? 28 : 36,
            textAlign: 'right',
            color: row.totalPoints > 0 ? theme.palette.success.main : 'text.secondary'
          }}
        >
          {row.totalPoints}
        </Typography>
      </Box>
    </Box>
  );
};

/**
 * Prediction statistics with horizontal stacked bars and a matchup/bracket toggle.
 * Replaces the old PredictionStatsTable with a more visual, compact layout.
 */
const PredictionStatsBars = ({ matchupStats, bracketStats = null }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { scoringConfig } = useScoringConfig();
  const [activeTab, setActiveTab] = useState('matchup');

  const matchupRows = useMemo(
    () => buildRoundRows(matchupStats, scoringConfig, 'matchup'),
    [matchupStats, scoringConfig]
  );

  const bracketRows = useMemo(
    () => buildRoundRows(bracketStats, scoringConfig, 'bracket'),
    [bracketStats, scoringConfig]
  );

  const activeRows = activeTab === 'matchup' ? matchupRows : bracketRows;
  const hasBracketData = bracketStats?.hits != null;

  // Find best round (highest points) for highlighting
  const bestRoundKey = useMemo(() => {
    if (!activeRows.length) return null;
    return activeRows.reduce((best, row) =>
      row.totalPoints > best.points ? { key: row.key, points: row.totalPoints } : best,
      { key: null, points: -1 }
    ).key;
  }, [activeRows]);

  // Totals
  const totals = useMemo(() => {
    return activeRows.reduce(
      (acc, r) => ({
        bullsEyes: acc.bullsEyes + r.bullsEyes,
        hits: acc.hits + r.hits,
        misses: acc.misses + r.misses,
        points: acc.points + r.totalPoints
      }),
      { bullsEyes: 0, hits: 0, misses: 0, points: 0 }
    );
  }, [activeRows]);

  return (
    <Box>
      {/* Header: title + toggle */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 1.5,
        flexWrap: 'wrap',
        gap: 1
      }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Prediction Stats
        </Typography>
        <ToggleButtonGroup
          value={activeTab}
          exclusive
          onChange={(_, val) => val && setActiveTab(val)}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              textTransform: 'none',
              px: isMobile ? 1.5 : 2,
              py: 0.25,
              fontSize: '0.8125rem',
              fontWeight: 600
            }
          }}
        >
          <ToggleButton value="matchup">Matchups</ToggleButton>
          <ToggleButton value="bracket">Bracket</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Legend + column headers */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 1.5,
        mb: 0.5
      }}>
        <Box sx={{ display: 'flex', gap: isMobile ? 1 : 1.5, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
            <TbCrystalBall size={13} style={{ color: theme.palette.success.main }} />
            <Typography variant="caption" color="text.secondary">
              {isMobile ? 'BE' : 'Bulls-Eye'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
            <BsBullseye size={12} style={{ color: theme.palette.warning.main }} />
            <Typography variant="caption" color="text.secondary">
              {isMobile ? 'Hit' : 'Hits'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
            <AiOutlineCloseCircle size={13} style={{ color: theme.palette.error.main }} />
            <Typography variant="caption" color="text.secondary">
              {isMobile ? 'Miss' : 'Misses'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: isMobile ? 0.5 : 1, alignItems: 'center' }}>
          {!isMobile && (
            <Typography variant="caption" color="text.secondary" sx={{ width: 32, textAlign: 'right' }}>
              Acc%
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ width: isMobile ? 28 : 36, textAlign: 'right' }}>
            Pts
          </Typography>
        </Box>
      </Box>

      {/* Bracket "coming soon" placeholder */}
      {activeTab === 'bracket' && !hasBracketData ? (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 5,
          gap: 1,
          opacity: 0.5
        }}>
          <LockIcon sx={{ fontSize: 32 }} />
          <Typography variant="body2" color="text.secondary">
            Bracket stats coming soon
          </Typography>
        </Box>
      ) : (
        <>
          {/* Round bars */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.25,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
            borderRadius: 1.5,
            py: 0.5
          }}>
            {activeRows.map(row => (
              <RoundBar
                key={row.key}
                row={row}
                isBestRound={row.key === bestRoundKey}
                isMobile={isMobile}
                theme={theme}
              />
            ))}
          </Box>

          {/* Totals row */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 1,
            px: 1.5,
            py: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            borderRadius: 1
          }}>
            <Box sx={{ display: 'flex', gap: isMobile ? 1.5 : 2.5, alignItems: 'center' }}>
              <Typography variant="body2" fontWeight={700} color="primary">
                Total
              </Typography>
              <Box sx={{ display: 'flex', gap: isMobile ? 1 : 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TbCrystalBall size={13} style={{ color: theme.palette.success.main }} />
                  <Typography variant="body2" fontWeight={700}>{totals.bullsEyes}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <BsBullseye size={12} style={{ color: theme.palette.warning.main }} />
                  <Typography variant="body2" fontWeight={700}>{totals.hits}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AiOutlineCloseCircle size={13} style={{ color: theme.palette.error.main }} />
                  <Typography variant="body2" fontWeight={700}>{totals.misses}</Typography>
                </Box>
              </Box>
            </Box>
            <Typography variant="body1" fontWeight={700} color="success.main">
              {totals.points} pts
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default PredictionStatsBars;

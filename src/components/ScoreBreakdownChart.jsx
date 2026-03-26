import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  EmojiEvents as TrophyIcon,
  MilitaryTech as MvpIcon,
  SportsBasketball as MatchupIcon,
  AccountTree as BracketIcon
} from '@mui/icons-material';

/**
 * Score pillar definitions — each represents one source of points.
 * Colors are intentionally hard-coded (not theme-dependent) for consistent chart identity.
 */
const SCORE_PILLARS = [
  { key: 'matchup', label: 'Matchups', color: '#0088FE', icon: MatchupIcon },
  { key: 'bracket', label: 'Bracket', color: '#00C49F', icon: BracketIcon },
  { key: 'championship', label: 'Champion', color: '#FFD700', icon: TrophyIcon },
  { key: 'mvp', label: 'MVP', color: '#E05297', icon: MvpIcon }
];

/** Custom tooltip shown on hover/tap of donut segments */
const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  return (
    <Box sx={{
      bgcolor: 'background.paper',
      p: 1,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
      boxShadow: 1
    }}>
      <Typography variant="body2" fontWeight="medium">{name}</Typography>
      <Typography variant="body2" color="text.secondary">{value} pts</Typography>
    </Box>
  );
};

/**
 * Donut chart showing the 4 scoring pillars with total score in the center.
 * Zero-value segments are filtered out — most of the season only 2 colors show
 * (matchup + bracket), with championship/MVP unlocking after the Finals.
 */
const ScoreBreakdownChart = ({
  totalScore = 0,
  matchupPoints = 0,
  bracketPoints = 0,
  championshipPoints = 0,
  mvpPoints = 0
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Build chart data, filtering out zero-value segments so the donut stays clean
  const { chartData, chartColors } = useMemo(() => {
    const raw = [
      { key: 'matchup', name: 'Matchup Predictions', value: matchupPoints },
      { key: 'bracket', name: 'Bracket Predictions', value: bracketPoints },
      { key: 'championship', name: 'Championship Pick', value: championshipPoints },
      { key: 'mvp', name: 'MVP Pick', value: mvpPoints }
    ];
    const filtered = raw.filter(d => d.value > 0);
    const colors = filtered.map(d =>
      SCORE_PILLARS.find(p => p.key === d.key)?.color || '#888'
    );
    return { chartData: filtered, chartColors: colors };
  }, [matchupPoints, bracketPoints, championshipPoints, mvpPoints]);

  const hasData = totalScore > 0;

  // Responsive donut sizing
  const innerRadius = isMobile ? 32 : 48;
  const outerRadius = isMobile ? 56 : 72;
  const chartHeight = isMobile ? 150 : 190;

  return (
    <Box>
      {/* Donut chart with centered total */}
      <Box sx={{ position: 'relative', width: '100%', height: chartHeight }}>
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                paddingAngle={chartData.length > 1 ? 4 : 0}
                dataKey="value"
                label={false}
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={entry.key} fill={chartColors[index]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          /* Empty ring placeholder when no scores yet */
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[{ name: 'No data', value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                dataKey="value"
                label={false}
                strokeWidth={0}
              >
                <Cell fill={theme.palette.action.disabledBackground} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}

        {/* Center label — total score */}
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            fontWeight="bold"
            lineHeight={1}
            color={hasData ? 'text.primary' : 'text.disabled'}
          >
            {totalScore}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>
            {hasData ? 'pts' : 'no scores yet'}
          </Typography>
        </Box>
      </Box>

      {/* Stat pills — one per pillar */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 1,
        mt: 1.5
      }}>
        {SCORE_PILLARS.map((pillar) => {
          const value = { matchup: matchupPoints, bracket: bracketPoints, championship: championshipPoints, mvp: mvpPoints }[pillar.key];
          const isLocked = (pillar.key === 'championship' || pillar.key === 'mvp') && value === 0;
          const Icon = pillar.icon;

          return (
            <Box
              key={pillar.key}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.25,
                py: 0.75,
                borderRadius: 1,
                bgcolor: theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.04)'
                  : 'rgba(0,0,0,0.03)',
                border: '1px solid',
                borderColor: value > 0 ? pillar.color : 'transparent',
                opacity: isLocked ? 0.55 : 1,
                transition: 'opacity 0.2s'
              }}
            >
              <Box sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: pillar.color,
                flexShrink: 0
              }} />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  sx={{ display: 'block', lineHeight: 1.2 }}
                >
                  {pillar.label}
                </Typography>
                <Typography variant="body2" fontWeight="bold" lineHeight={1.2}>
                  {isLocked ? (
                    <Typography component="span" variant="caption" color="text.disabled" fontWeight="normal">
                      After Finals
                    </Typography>
                  ) : (
                    `${value} pts`
                  )}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default ScoreBreakdownChart;

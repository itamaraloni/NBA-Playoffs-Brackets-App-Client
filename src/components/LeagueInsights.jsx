import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  Avatar,
  useTheme,
} from '@mui/material';
import { getLogoPath } from '../shared/teamUtils';
import { getPlayerAvatar } from '../shared/playerUtils';

/**
 * Renders a single pick distribution card (champion or MVP).
 *
 * Each row shows:
 *  - avatar (team logo or player headshot) + name + optional "You" chip
 *  - pick count and percentage on the right
 *  - LinearProgress bar sized by percentage
 *
 * The current user's pick row gets a left-border accent and bold name
 * so it stands out without dominating the UI.
 */
const DistributionCard = ({ title, entries, currentPickName, progressColor }) => {
  const theme = useTheme();
  const accentColor = theme.palette[progressColor]?.main || theme.palette.primary.main;

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>

      {entries.length > 0 ? (
        <Stack spacing={2}>
          {entries.map((entry) => {
            const isCurrentPick = currentPickName && entry.name === currentPickName;
            return (
              <Box
                key={entry.id}
                sx={{
                  pl: 2,
                  borderLeft: isCurrentPick
                    ? `4px solid ${accentColor}`
                    : '4px solid transparent',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                    <Avatar
                      src={entry.avatarSrc}
                      alt={entry.name}
                      variant="rounded"
                      sx={{ width: 40, height: 40, flexShrink: 0 }}
                    >
                      {entry.name.charAt(0)}
                    </Avatar>
                    <Typography
                      variant="body1"
                      fontWeight={isCurrentPick ? 700 : 500}
                      noWrap
                    >
                      {entry.name}
                    </Typography>
                    {isCurrentPick && (
                      <Chip
                        label="You"
                        size="small"
                        color={progressColor}
                        sx={{ height: 20, fontSize: '0.6875rem', flexShrink: 0 }}
                      />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                    {entry.pickCount} ({entry.percentage.toFixed(1)}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={entry.percentage}
                  color={isCurrentPick ? progressColor : 'inherit'}
                  sx={{ height: 10, borderRadius: 1 }}
                />
              </Box>
            );
          })}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No picks yet
        </Typography>
      )}
    </Paper>
  );
};

/**
 * League Insights section — champion and MVP pick distribution charts
 * for the current league, rendered below the standings table.
 *
 * Props:
 *   pickDistribution — transformed response from LeagueServices.getPickDistribution()
 *   currentPlayer    — the active player object (from leagueData.players)
 *   loading          — show skeleton/spinner while fetching
 *   error            — show error alert on failure
 */
const LeagueInsights = ({ pickDistribution, currentPlayer, loading, error }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>;
  }

  if (!pickDistribution) return null;

  // Build normalised entries — avatarSrc derived from name using shared utilities
  const championEntries = pickDistribution.championDistribution.map(d => ({
    id: d.teamId,
    name: d.teamName,
    avatarSrc: getLogoPath(d.teamName),
    pickCount: d.pickCount,
    percentage: d.percentage,
  }));

  const mvpEntries = pickDistribution.mvpDistribution.map(d => ({
    id: d.nbaPlayerId,
    name: d.playerName,
    avatarSrc: getPlayerAvatar(d.playerName),
    pickCount: d.pickCount,
    percentage: d.percentage,
  }));

  // Current user's picks (names used for matching)
  const currentChampPick = currentPlayer?.championshipPrediction || null;
  const currentMvpPick = currentPlayer?.mvpPrediction || null;

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {pickDistribution.playerCount} member{pickDistribution.playerCount !== 1 ? 's' : ''} (excluding bots)
      </Typography>

      <Stack spacing={3}>
        <DistributionCard
          title="Championship Picks"
          entries={championEntries}
          currentPickName={currentChampPick}
          progressColor="primary"
        />
        <DistributionCard
          title="MVP Picks"
          entries={mvpEntries}
          currentPickName={currentMvpPick}
          progressColor="secondary"
        />
      </Stack>
    </Box>
  );
};

export default LeagueInsights;

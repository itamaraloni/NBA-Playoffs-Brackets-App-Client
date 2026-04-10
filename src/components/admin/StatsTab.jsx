import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';

/**
 * Stats tab — Champion and MVP pick distributions.
 *
 * Each distribution is shown as a ranked list with:
 * - Team/player name and pick count
 * - LinearProgress bar showing percentage relative to total
 *
 * LinearProgress uses MUI's "determinate" variant for precise percentage rendering.
 */
const StatsTab = ({ stats, loading, error }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!stats) return null;

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {stats.totalPlayers} players (excluding bots)
      </Typography>

      <Stack spacing={4}>
        {/* Champion distribution */}
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Championship Team Picks
          </Typography>
          {stats.championDistribution.length > 0 ? (
            <Stack spacing={1.5}>
              {stats.championDistribution.map((entry) => (
                <Box key={entry.teamId}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {entry.teamName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {entry.pickCount} ({entry.percentage.toFixed(1)}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={entry.percentage}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No championship team picks yet
            </Typography>
          )}
        </Paper>

        {/* MVP distribution */}
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            MVP Picks
          </Typography>
          {stats.mvpDistribution.length > 0 ? (
            <Stack spacing={1.5}>
              {stats.mvpDistribution.map((entry) => (
                <Box key={entry.nbaPlayerId}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {entry.playerName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {entry.pickCount} ({entry.percentage.toFixed(1)}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={entry.percentage}
                    color="secondary"
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No MVP picks yet
            </Typography>
          )}
        </Paper>
      </Stack>
    </Box>
  );
};

export default StatsTab;

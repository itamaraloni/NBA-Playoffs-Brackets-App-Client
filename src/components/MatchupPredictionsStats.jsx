import React from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress
} from '@mui/material';

/**
 * Component to display prediction statistics for a matchup
 */
const MatchupPredictionsStats = ({ stats, loading, homeTeam, awayTeam }) => {
  return (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Prediction Statistics
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : stats ? (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Predictions
              </Typography>
              <Typography variant="h4">
                {stats.totalPredictions}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Team Win Distribution
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2">{homeTeam?.name}</Typography>
                  <Typography variant="h5">{Math.round(stats.homeTeamWinPercentage)}%</Typography>
                  <Typography variant="body2" color="text.secondary">{stats.homeTeamWinCount} picks</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2">{awayTeam?.name}</Typography>
                  <Typography variant="h5">{Math.round(stats.awayTeamWinPercentage)}%</Typography>
                  <Typography variant="body2" color="text.secondary">{stats.awayTeamWinCount} picks</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Most Common Prediction
              </Typography>
              {stats.mostCommonScore ? (
                <>
                  <Typography variant="h5" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                    {homeTeam?.name} {stats.mostCommonScore.homeScore} - {stats.mostCommonScore.awayScore} {awayTeam?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.mostCommonScore.count} users ({Math.round(stats.mostCommonScore.percentage)}%)
                  </Typography>
                </>
              ) : (
                <Typography variant="body1">No common prediction</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          No prediction statistics available.
        </Typography>
      )}
    </>
  );
};

export default MatchupPredictionsStats;
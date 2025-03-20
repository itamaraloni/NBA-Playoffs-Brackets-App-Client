import React, { useMemo } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  useTheme
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

/**
 * Chart component for prediction distribution
 */
const PredictionDistributionChart = ({ data, homeTeam, awayTeam }) => {
  const theme = useTheme();
  
  // Generate a colorful palette for the pie slices
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#747FFF'];
  
  // Format the tooltip content
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box sx={{ 
          bgcolor: 'background.paper', 
          p: 1, 
          border: '1px solid', 
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: 1
        }}>
          <Typography variant="body2" color="text.primary">
            {homeTeam} {data.homeScore} - {data.awayScore} {awayTeam}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.count} users ({Math.round(data.percentage)}%)
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: '100%', height: 180 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={theme.breakpoints.down('sm') ? 25 : 40}
            outerRadius={theme.breakpoints.down('sm') ? 45 : 60}
            paddingAngle={4}
            dataKey="count"
            label={false}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

/**
 * Component to display prediction statistics for a matchup
 */
const MatchupPredictionStats = ({ stats, loading, homeTeam, awayTeam, leaguePredictions = [] }) => {
  // Calculate prediction distribution from raw predictions
  const predictionDistribution = useMemo(() => {
    if (!leaguePredictions || leaguePredictions.length === 0) return [];
    
    // Group predictions by their scores
    const grouped = {};
    leaguePredictions.forEach(prediction => {
      const key = `${prediction.homeScore}-${prediction.awayScore}`;
      if (!grouped[key]) {
        grouped[key] = {
          id: key,
          homeScore: prediction.homeScore,
          awayScore: prediction.awayScore,
          count: 0
        };
      }
      grouped[key].count++;
    });
    
    // Convert to array and calculate percentages
    const distribution = Object.values(grouped);
    const totalCount = leaguePredictions.length;
    
    distribution.forEach(item => {
      item.percentage = (item.count / totalCount) * 100;
    });
    
    // Sort by count (descending)
    return distribution.sort((a, b) => b.count - a.count);
  }, [leaguePredictions]);
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
                Prediction Distribution
              </Typography>
              {predictionDistribution.length > 0 ? (
                <PredictionDistributionChart 
                  data={predictionDistribution}
                  homeTeam={homeTeam?.name}
                  awayTeam={awayTeam?.name}
                />
              ) : (
                <Typography variant="body1">No prediction data available</Typography>
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

export default MatchupPredictionStats;
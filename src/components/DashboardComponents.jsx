import React from 'react';
import PropTypes from 'prop-types';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  useTheme
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Score as ScoreIcon,
  CheckCircle as CorrectIcon,
  Timeline as StreakIcon,
  SportsMma as VersusIcon
} from '@mui/icons-material';

/**
 * Component for showing player's league statistics
 */
export const LeagueStatsSection = ({ onViewLeagueClick, elevation = 2 }) => {
  const theme = useTheme();
  
  const stats = [
    { 
      label: "Current Rank", 
      value: "3rd", 
      color: theme.palette.primary.main, 
      bgColor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.1)' : 'rgba(232, 244, 253, 0.8)', 
      icon: <TrophyIcon /> 
    },
    { 
      label: "Your Score", 
      value: "76", 
      color: theme.palette.success.main, 
      bgColor: theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(237, 247, 237, 0.8)', 
      icon: <ScoreIcon /> 
    },
    { 
      label: "Correct Picks", 
      value: "14", 
      color: theme.palette.secondary.main, 
      bgColor: theme.palette.mode === 'dark' ? 'rgba(156, 39, 176, 0.1)' : 'rgba(243, 229, 245, 0.8)', 
      icon: <CorrectIcon /> 
    },
    { 
      label: "Win Streak", 
      value: "3", 
      color: theme.palette.warning.main, 
      bgColor: theme.palette.mode === 'dark' ? 'rgba(237, 108, 2, 0.1)' : 'rgba(255, 244, 229, 0.8)', 
      icon: <StreakIcon /> 
    }
  ];
  
  return (
    <Paper
      elevation={elevation}
      sx={{
        p: 3,
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.background.paper
      }}
    >
      <Typography variant="h5" fontWeight="medium" sx={{ mb: 3 }}>
        Your League Stats
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={6} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                textAlign: 'center',
                bgcolor: stat.bgColor,
                border: `1px solid ${stat.color}`
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                {React.cloneElement(stat.icon, { sx: { color: stat.color } })}
              </Box>
              <Typography variant="body2" color="textSecondary">
                {stat.label}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: stat.color }}>
                {stat.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={onViewLeagueClick}
        sx={{ mt: 'auto' }}
      >
        View League Details
      </Button>
    </Paper>
  );
};

LeagueStatsSection.propTypes = {
  onViewLeagueClick: PropTypes.func.isRequired,
  elevation: PropTypes.number
};

/**
 * Component for showing upcoming games and prediction options
 */
export const UpcomingGamesSection = ({ onViewGamesClick, elevation = 2 }) => {
  const theme = useTheme();
  
  const games = [
    {
      home: "Lakers",
      away: "Celtics",
      time: "Today, 7:30 PM"
    },
    {
      home: "Warriors",
      away: "Nets",
      time: "Tomorrow, 8:00 PM"
    }
  ];
  
  return (
    <Paper
      elevation={elevation}
      sx={{
        p: 3,
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.background.paper
      }}
    >
      <Typography variant="h5" fontWeight="medium" sx={{ mb: 3 }}>
        Upcoming Games
      </Typography>
      
      <Box sx={{ mb: 3, flexGrow: 1 }}>
        {games.map((game, index) => (
          <Paper
            key={index}
            variant="outlined"
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body1" fontWeight="medium">
                {game.home}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <VersusIcon fontSize="small" sx={{ mx: 1, color: theme.palette.text.secondary }} />
              </Box>
              <Typography variant="body1" fontWeight="medium">
                {game.away}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">
                {game.time}
              </Typography>
              <Button
                variant="contained"
                color="success"
                size="small"
                fullWidth
                sx={{ mt: 1 }}
              >
                Make Prediction
              </Button>
            </Box>
          </Paper>
        ))}
      </Box>
      
      <Button
        variant="contained"
        color="success"
        fullWidth
        onClick={onViewGamesClick}
      >
        View All Games
      </Button>
    </Paper>
  );
};

UpcomingGamesSection.propTypes = {
  onViewGamesClick: PropTypes.func.isRequired,
  elevation: PropTypes.number
};
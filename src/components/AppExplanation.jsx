import React from 'react';
import PropTypes from 'prop-types';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Avatar,
  Divider,
  useTheme
} from '@mui/material';

/**
 * Reusable component that explains how the NBA predictions app works
 */
const AppExplanation = ({ elevation = 2 }) => {
  const theme = useTheme();
  
  const steps = [
    {
      number: 1,
      title: "Create or Join a League",
      description: "Start your own league or join your friends using their league code"
    },
    {
      number: 2,
      title: "Turn on your Crystal Ball",
      description: "Bet on the team to lift the trophy and the MVP that will be crowned in the end of the playoffs"
    },
    {
      number: 3,
      title: "Make Your Predictions",
      description: "Predict outcomes for every matchup series of the NBA playoffs"
    },
    {
      number: 4,
      title: "Compete & Win",
      description: "Score points and climb the leaderboard"
    },
    {
      number: 5,
      title: "Sweep all the glory",
      description: "Finish the playoffs at the top of your league, and earn a whole year long of your friends respect"
    }
  ];

  return (
    <Paper 
      elevation={elevation} 
      sx={{ 
        p: 3, 
        borderRadius: 2,
        bgcolor: theme.palette.background.paper
      }}
    >
      <Typography variant="h5" fontWeight="medium" sx={{ mb: 3 }}>
        How It Works
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={2}>
        {steps.map((step) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={step.number}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Avatar 
                sx={{ 
                  width: 48, 
                  height: 48, 
                  bgcolor: theme.palette.primary.main,
                  mx: 'auto',
                  mb: 2
                }}
              >
                {step.number}
              </Avatar>
              <Typography variant="subtitle1" fontWeight="medium">
                {step.title}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {step.description}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

AppExplanation.propTypes = {
  elevation: PropTypes.number
};

export default AppExplanation;
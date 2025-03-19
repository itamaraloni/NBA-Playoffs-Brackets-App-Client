import React from 'react';
import { Box, Typography } from '@mui/material';
import Team from '../Team';

/**
 * A component to display two teams facing each other in a matchup
 * 
 * @param {Object} props
 * @param {Object} props.homeTeam - Home team object
 * @param {Object} props.awayTeam - Away team object
 * @param {Object} props.sx - Additional styles
 */
const MatchupTeamsDisplay = ({
  homeTeam,
  awayTeam,
  sx = {}
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      flexDirection: { xs: 'column', sm: 'row' },
      ...sx
    }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        mb: { xs: 2, sm: 0 } 
      }}>
        <Team 
          name={homeTeam.name}
          logo={homeTeam.logo}
          seed={homeTeam.seed}
          conference={homeTeam.conference}
        />
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 'bold', mx: 2 }}>
        VS
      </Typography>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
      }}>
        <Team 
          name={awayTeam.name}
          logo={awayTeam.logo}
          seed={awayTeam.seed}
          conference={awayTeam.conference}
        />
      </Box>
    </Box>
  );
};

export default MatchupTeamsDisplay;
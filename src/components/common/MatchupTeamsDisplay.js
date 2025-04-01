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
      justifyContent: 'center', 
      alignItems: 'center',
      flexDirection: { xs: 'column', sm: 'row' },
      width: '100%',
      ...sx
    }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        mb: { xs: 2, sm: 0 },
        flex: 1,
        maxWidth: { xs: '100%', sm: '40%' }
      }}>
        <Team 
          name={homeTeam.name}
          logo={homeTeam.logo}
          seed={homeTeam.seed}
          conference={homeTeam.conference}
        />
      </Box>

      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: { xs: '100%', sm: '20%' },
        my: { xs: 2, sm: 0 }
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold',
            textAlign: 'center',
            px: 2
          }}
        >
          VS
        </Typography>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        flex: 1,
        maxWidth: { xs: '100%', sm: '40%' }
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
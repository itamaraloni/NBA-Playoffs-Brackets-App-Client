import React from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';

/**
 * A component to display match scores with labels
 * 
 * @param {Object} props
 * @param {string} props.label - Label for the score display
 * @param {string} props.homeTeam - Home team name
 * @param {string} props.awayTeam - Away team name
 * @param {number} props.homeScore - Home team score
 * @param {number} props.awayScore - Away team score
 * @param {Object} props.sx - Additional styles for container
 */
const MatchupScoreDisplay = ({
  label,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  sx = {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ 
      width: '100%',
      maxWidth: '500px',
      ...sx 
    }}>
      <Typography variant="subtitle1" sx={{ 
        fontWeight: 'bold',
        textAlign: 'center',
        mb: 1,
        color: theme.palette.grey[700],
        borderBottom: `1px solid ${theme.palette.grey[400]}`,
        pb: 0.5,
        width: 'fit-content',
        mx: 'auto'
      }}>
        {label}
      </Typography>
      
      {isMobile ? (
        // Mobile layout (stacked)
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1
        }}>
          <Typography sx={{ fontWeight: 'medium' }}>
                          {homeTeam} <Typography component="span" sx={{ fontWeight: 'bold', fontSize: '1.1rem', ml: 1 }}>{homeScore}</Typography>
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            vs
          </Typography>
          <Typography sx={{ fontWeight: 'medium' }}>
                          {awayTeam} <Typography component="span" sx={{ fontWeight: 'bold', fontSize: '1.1rem', ml: 1 }}>{awayScore}</Typography>
          </Typography>
        </Box>
      ) : (
        // Desktop layout (horizontal)
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Box sx={{ 
            flex: 1, 
            textAlign: 'right',
            pr: 1
          }}>
            <Typography sx={{ fontWeight: 'medium' }}>
              {homeTeam} <Typography component="span" sx={{ fontWeight: 'bold', fontSize: '1.1rem', ml: 1 }}>{homeScore}</Typography>
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ 
            px: 2,
            opacity: 0.8
          }}>
            vs
          </Typography>
          <Box sx={{ 
            flex: 1, 
            textAlign: 'left',
            pl: 1
          }}>
            <Typography sx={{ fontWeight: 'medium' }}>
              <Typography component="span" sx={{ fontWeight: 'bold', fontSize: '1.1rem', mr: 1 }}>{awayScore}</Typography> {awayTeam}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MatchupScoreDisplay;
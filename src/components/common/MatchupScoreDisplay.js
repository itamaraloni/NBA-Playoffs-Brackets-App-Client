import React from 'react';
import { Box, Typography } from '@mui/material';

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
  return (
    <Box sx={{ textAlign: 'center', ...sx }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
        {label}:
      </Typography>
      <Typography>
        {homeTeam} {homeScore} - {awayScore} {awayTeam}
      </Typography>
    </Box>
  );
};

export default MatchupScoreDisplay;
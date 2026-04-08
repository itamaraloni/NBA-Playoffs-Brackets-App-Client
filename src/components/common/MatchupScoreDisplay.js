import React from 'react';
import { Box, Typography, useMediaQuery, useTheme, Chip } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

/**
 * A component to display match scores with labels
 */
const MatchupScoreDisplay = ({
  label,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  round,
  resultColor = 'primary',
  sx = {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Get team names safely, whether objects or strings
  const homeTeamName = typeof homeTeam === 'object' ? homeTeam.name : homeTeam;
  const awayTeamName = typeof awayTeam === 'object' ? awayTeam.name : awayTeam;
  
  // More robust play-in detection using both round property and score pattern
  const isPlayInByRound = round?.startsWith('playin_');
  const isPlayInByScore = (homeScore === 1 && awayScore === 0) || (homeScore === 0 && awayScore === 1);
  const isPlayIn = isPlayInByRound && isPlayInByScore;
  
  // For play-in games, determine the winner
  const getPlayInWinner = () => {
    if (homeScore === 1) return homeTeamName;
    if (awayScore === 1) return awayTeamName;
    return null;
  };
  
  // For play-in games with a winner
  const renderPlayInResult = () => {
    const winner = getPlayInWinner();
    
    if (!winner) {
      return (
        <Typography variant="body1" sx={{ textAlign: 'center', fontStyle: 'italic' }}>
          No winner recorded
        </Typography>
      );
    }
    
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <Chip
          icon={<EmojiEventsIcon />}
          label={`${winner} advances`}
          color={resultColor}
          sx={{ fontWeight: 'medium' }}
        />
      </Box>
    );
  };

  // Standard series display (best of 7)
  const renderSeriesScore = () => {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: isMobile ? 1.5 : 2,
        }}
      >
        <Typography sx={{ fontWeight: 'bold', fontSize: '1.35rem' }}>
          {homeScore}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          vs
        </Typography>
        <Typography sx={{ fontWeight: 'bold', fontSize: '1.35rem' }}>
          {awayScore}
        </Typography>
      </Box>
    );
  };

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
      
      {isPlayIn ? renderPlayInResult() : renderSeriesScore()}
    </Box>
  );
};

export default MatchupScoreDisplay;

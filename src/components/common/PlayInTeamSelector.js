import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';

/**
 * Component for selecting winner in Play-In games
 */
const PlayInTeamSelector = ({
  homeTeam,
  awayTeam,
  selectedTeam,
  onSelectTeam,
  predictedHomeScore,
  predictedAwayScore,
  validationError
}) => {
  return (
    <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {predictedHomeScore !== null && predictedAwayScore !== null && (
        <Box sx={{ mb: 3, width: '100%', textAlign: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Your Prediction
          </Typography>
          <Typography variant="body1">
            Winner: {predictedHomeScore > predictedAwayScore ? homeTeam.name : awayTeam.name}
          </Typography>
        </Box>
      )}

      <Typography variant="subtitle1" sx={{ mb: 2, textAlign: 'center', fontWeight: 500 }}>
        {predictedHomeScore !== null ? 'Update Your Prediction' : 'Select Game Winner'}
      </Typography>

      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        gap: 2,
        width: '100%',
        maxWidth: '500px'
      }}>
        <Button
          variant={selectedTeam === 'home' ? 'contained' : 'outlined'}
          color="primary"
          onClick={() => onSelectTeam('home')}
          sx={{ 
            minWidth: '200px',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', height: '24px', width: '24px' }}>
            {homeTeam.logo && <img src={homeTeam.logo} alt={homeTeam.name} height="24" />}
          </Box>
          {homeTeam.name}
        </Button>

        <Button
          variant={selectedTeam === 'away' ? 'contained' : 'outlined'}
          color="primary"
          onClick={() => onSelectTeam('away')}
          sx={{ 
            minWidth: '200px',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', height: '24px', width: '24px' }}>
            {awayTeam.logo && <img src={awayTeam.logo} alt={awayTeam.name} height="24" />}
          </Box>
          {awayTeam.name}
        </Button>
      </Box>

      {validationError && (
        <Alert severity="error" sx={{ mt: 2, width: '100%', maxWidth: '500px' }}>
          {validationError}
        </Alert>
      )}
    </Box>
  );
};

export default PlayInTeamSelector;
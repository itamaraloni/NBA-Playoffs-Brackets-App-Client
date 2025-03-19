import React from 'react';
import { Box, Button, Alert } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import ScoreCounter from './ScoreCounter';

/**
 * Admin component for editing matchup score
 * 
 * @param {Object} props
 * @param {boolean} props.editMode - Whether edit mode is active
 * @param {Function} props.setEditMode - Function to toggle edit mode
 * @param {Object} props.homeTeam - Home team object
 * @param {Object} props.awayTeam - Away team object
 * @param {number} props.homeScore - Current home score
 * @param {number} props.awayScore - Current away score
 * @param {Function} props.setHomeScore - Function to update home score
 * @param {Function} props.setAwayScore - Function to update away score
 * @param {string} props.validationError - Error message if validation fails
 * @param {Function} props.onSave - Function called when save button is clicked
 */
const MatchupAdminScoreEditor = ({
  editMode,
  setEditMode,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  setHomeScore,
  setAwayScore,
  validationError,
  onSave
}) => {
  return (
    <Box sx={{ mt: 3, textAlign: 'center' }}>
      {!editMode ? (
        <Button 
          variant="outlined" 
          startIcon={<EditIcon />}
          onClick={() => setEditMode(true)}
          size="small"
        >
          Update Score
        </Button>
      ) : (
        <Box>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center', 
            gap: 3,
            px: 3,
            mt: 2,
            mb: 2
          }}>
            <ScoreCounter
              label={`${homeTeam.name}:`}
              value={homeScore}
              onChange={setHomeScore}
            />
            
            <ScoreCounter
              label={`${awayTeam.name}:`}
              value={awayScore}
              onChange={setAwayScore}
              sx={{ mt: { xs: 2, sm: 0 } }}
            />
          </Box>

          {validationError && (
            <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
              {validationError}
            </Alert>
          )}

          <Button 
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={onSave}
            size="small"
          >
            Save Score
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default MatchupAdminScoreEditor;
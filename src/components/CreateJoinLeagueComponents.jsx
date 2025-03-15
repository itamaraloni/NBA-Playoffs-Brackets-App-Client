import React from 'react';
import PropTypes from 'prop-types';
import {
  Paper,
  Typography,
  Button,
  TextField,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Add as CreateIcon,
  Login as JoinIcon
} from '@mui/icons-material';

/**
 * Component for creating a new league
 */
export const CreateLeagueSection = ({ onCreateClick, elevation = 2 }) => {
  const theme = useTheme();
  
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
      <Typography variant="h5" fontWeight="medium" sx={{ mb: 2 }}>
        Create a League
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2, flexGrow: 1 }}>
        Start your own league and invite friends to join!
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<CreateIcon />}
        onClick={onCreateClick}
        sx={{ mt: 'auto' }}
      >
        Create League
      </Button>
    </Paper>
  );
};

CreateLeagueSection.propTypes = {
  onCreateClick: PropTypes.func.isRequired,
  elevation: PropTypes.number
};

/**
 * Component for joining an existing league
 */
export const JoinLeagueSection = ({ 
  leagueCode, 
  setLeagueCode, 
  codeError, 
  isLoading, 
  onJoinClick,
  elevation = 2 
}) => {
  const theme = useTheme();
  
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
      <Typography variant="h5" fontWeight="medium" sx={{ mb: 2 }}>
        Join a League
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Enter the league code provided by your friends:
      </Typography>
      
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        value={leagueCode}
        onChange={(e) => setLeagueCode(e.target.value)}
        placeholder="Enter league code"
        error={!!codeError}
        helperText={codeError}
        sx={{ mb: 2 }}
      />
      
      <Button
        variant="contained"
        color="success"
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <JoinIcon />}
        onClick={onJoinClick}
        sx={{ mt: 'auto' }}
      >
        {isLoading ? 'Checking...' : 'Join League'}
      </Button>
    </Paper>
  );
};

JoinLeagueSection.propTypes = {
  leagueCode: PropTypes.string.isRequired,
  setLeagueCode: PropTypes.func.isRequired,
  codeError: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  onJoinClick: PropTypes.func.isRequired,
  elevation: PropTypes.number
};
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
} from '@mui/material';

const ROUND_OPTIONS = [
  { value: 'playin_first', label: 'Play-In (1st)' },
  { value: 'playin_second', label: 'Play-In (2nd)' },
  { value: 'first', label: 'First Round' },
  { value: 'second', label: 'Conference Semis' },
  { value: 'conference_final', label: 'Conference Finals' },
  { value: 'final', label: 'NBA Finals' },
];

const CONFERENCE_OPTIONS = [
  { value: 'Eastern', label: 'Eastern' },
  { value: 'Western', label: 'Western' },
  { value: 'Final', label: 'Finals' },
];

/**
 * Dialog for creating a new matchup.
 * Team options are extracted from existing matchup data (no standalone teams endpoint).
 * All four fields are required before the Create button is enabled.
 */
const CreateMatchupDialog = ({ open, onClose, onCreate, teams }) => {
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [round, setRound] = useState('');
  const [conference, setConference] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = homeTeamId && awayTeamId && round && conference && homeTeamId !== awayTeamId;

  const handleSubmit = async () => {
    try {
      setError(null);
      setIsSubmitting(true);
      await onCreate({ homeTeamId, awayTeamId, round, conference });
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to create matchup');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setHomeTeamId('');
    setAwayTeamId('');
    setRound('');
    setConference('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Matchup</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <FormControl fullWidth>
            <InputLabel>Home Team</InputLabel>
            <Select
              value={homeTeamId}
              label="Home Team"
              onChange={(e) => setHomeTeamId(e.target.value)}
            >
              {teams.map(team => (
                <MenuItem
                  key={team.teamId}
                  value={team.teamId}
                  disabled={team.teamId === awayTeamId}
                >
                  {team.seed ? `(${team.seed}) ` : ''}{team.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Away Team</InputLabel>
            <Select
              value={awayTeamId}
              label="Away Team"
              onChange={(e) => setAwayTeamId(e.target.value)}
            >
              {teams.map(team => (
                <MenuItem
                  key={team.teamId}
                  value={team.teamId}
                  disabled={team.teamId === homeTeamId}
                >
                  {team.seed ? `(${team.seed}) ` : ''}{team.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Round</InputLabel>
            <Select
              value={round}
              label="Round"
              onChange={(e) => setRound(e.target.value)}
            >
              {ROUND_OPTIONS.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Conference</InputLabel>
            <Select
              value={conference}
              label="Conference"
              onChange={(e) => setConference(e.target.value)}
            >
              {CONFERENCE_OPTIONS.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateMatchupDialog;

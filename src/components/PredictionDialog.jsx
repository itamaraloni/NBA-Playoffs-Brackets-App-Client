import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Chip, useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { getLogoPath } from '../shared/teamUtils';

const SERIES_OPTIONS = [
  { label: '4-0 (Sweep)', loserWins: 0 },
  { label: '4-1',         loserWins: 1 },
  { label: '4-2',         loserWins: 2 },
  { label: '4-3',         loserWins: 3 },
];

/**
 * PredictionDialog — opens when user clicks a bracket matchup card.
 * Lets the user pick a winner (and series score for non-play-in rounds).
 * Saving updates React state only — no API call until Submit.
 *
 * Props:
 *   open      — boolean
 *   onClose   — () => void
 *   matchup   — enriched matchup object from bracketState (may be null when closed)
 *   onSubmit  — (round, conference, matchupPosition, winnerTeamId, seriesScoreLoser) => void
 */
const PredictionDialog = ({ open, onClose, matchup, onSubmit }) => {
  const theme = useTheme();
  const [selectedWinner, setSelectedWinner]       = useState(null);   // team_id
  const [seriesScoreLoser, setSeriesScoreLoser]   = useState(null);   // 0 | 1 | 2 | 3

  // Pre-populate from existing pick when dialog opens for a matchup
  useEffect(() => {
    if (matchup) {
      setSelectedWinner(matchup.predicted_winner_team_id || null);
      if (matchup.predicted_series_score) {
        const loser = parseInt(matchup.predicted_series_score.split('-')[1], 10);
        setSeriesScoreLoser(isNaN(loser) ? null : loser);
      } else {
        setSeriesScoreLoser(null);
      }
    }
  }, [matchup]);

  if (!matchup) return null;

  const isPlayin     = matchup.isPlayin;
  const teams        = [matchup.team_1, matchup.team_2].filter(Boolean);
  const isSaveReady  = selectedWinner !== null && (isPlayin || seriesScoreLoser !== null);

  const handleSave = () => {
    if (!isSaveReady) return;
    onSubmit(
      matchup.round,
      matchup.conference,
      matchup.matchup_position,
      selectedWinner,
      isPlayin ? null : seriesScoreLoser,
    );
  };

  // Format round label for display in dialog title
  const roundLabel = (matchup.round || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 0.5 }}>
        Predict Winner
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.25 }}>
          {roundLabel} · {(matchup.conference || '').toUpperCase()}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Team selection cards */}
        <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
          Pick the winner:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
          {teams.map(team => {
            const isSelected = selectedWinner === team.team_id;
            return (
              <Box
                key={team.team_id}
                onClick={() => setSelectedWinner(team.team_id)}
                sx={{
                  flex: 1,
                  p: 1.5,
                  cursor: 'pointer',
                  borderRadius: 2,
                  textAlign: 'center',
                  border: isSelected
                    ? `2px solid ${theme.palette.primary.main}`
                    : `1px solid ${theme.palette.divider}`,
                  bgcolor: isSelected
                    ? alpha(theme.palette.primary.main, 0.1)
                    : theme.palette.background.paper,
                  transition: 'border-color 0.15s, background-color 0.15s',
                  '&:hover': {
                    borderColor: theme.palette.primary.light,
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                  },
                }}
              >
                {/* Logo */}
                <Box
                  component="img"
                  src={getLogoPath(team.name)}
                  alt={team.name}
                  onError={e => { e.target.style.display = 'none'; }}
                  sx={{ width: 40, height: 40, objectFit: 'contain', mb: 0.75 }}
                />
                {/* Seed + Name */}
                <Typography sx={{
                  fontSize: '0.6875rem', fontWeight: 700, lineHeight: 1.3,
                  color: isSelected ? 'primary.main' : 'text.primary',
                }}>
                  #{team.seed} {team.name}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Series score section — hidden for play-in rounds */}
        {!isPlayin && selectedWinner !== null && (
          <>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
              Series result:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {SERIES_OPTIONS.map(({ label, loserWins }) => (
                <Chip
                  key={loserWins}
                  label={label}
                  size="small"
                  onClick={() => setSeriesScoreLoser(loserWins)}
                  color={seriesScoreLoser === loserWins ? 'primary' : 'default'}
                  variant={seriesScoreLoser === loserWins ? 'filled' : 'outlined'}
                  sx={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.6875rem' }}
                />
              ))}
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} size="small">Cancel</Button>
        <Button
          variant="contained"
          size="small"
          disabled={!isSaveReady}
          onClick={handleSave}
        >
          Save Prediction
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PredictionDialog;

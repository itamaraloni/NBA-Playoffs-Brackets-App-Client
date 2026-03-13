import React from 'react';
import {
  Box,
  Typography,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

/**
 * Maps each health check key to a human-readable label and column definitions.
 * Column definitions specify which record fields to show and their headers.
 */
const CHECK_CONFIG = {
  orphanedPredictions: {
    label: 'Orphaned Predictions',
    description: 'Predictions referencing missing matchups or players',
    columns: [
      { key: 'prediction_id', label: 'Prediction ID' },
      { key: 'reason', label: 'Reason' },
    ],
  },
  scoreMismatches: {
    label: 'Score Mismatches',
    description: 'Players whose stored total doesn\'t match calculated total',
    columns: [
      { key: 'player_name', label: 'Player' },
      { key: 'stored_total', label: 'Stored' },
      { key: 'expected_total', label: 'Expected' },
    ],
  },
  unscoredPredictions: {
    label: 'Unscored Predictions',
    description: 'Predictions on completed matchups that haven\'t been scored',
    columns: [
      { key: 'prediction_id', label: 'Prediction ID' },
      { key: 'predicted_score', label: 'Predicted' },
      { key: 'actual_score', label: 'Actual' },
    ],
  },
  invalidMatchupScores: {
    label: 'Invalid Matchup Scores',
    description: 'Completed matchups with scores that don\'t reach the win threshold',
    columns: [
      { key: 'matchup_id', label: 'Matchup ID' },
      { key: 'round', label: 'Round' },
      { key: 'home_team_score', label: 'Home' },
      { key: 'away_team_score', label: 'Away' },
    ],
  },
  staleChampionshipPoints: {
    label: 'Stale Championship Points',
    description: 'Players with championship points for non-winning teams',
    columns: [
      { key: 'player_name', label: 'Player' },
      { key: 'team_name', label: 'Team' },
      { key: 'championship_team_points', label: 'Points' },
    ],
  },
  incorrectlyActiveTeams: {
    label: 'Incorrectly Active Teams',
    description: 'Teams marked active but eliminated in completed matchups',
    columns: [
      { key: 'team_name', label: 'Team' },
      { key: 'round', label: 'Round' },
    ],
  },
};

/**
 * Health tab — data integrity checks with expandable details.
 *
 * Shows an overall status Alert (healthy = green, issues = red),
 * then 6 Accordions — one per check. Each shows pass/fail Chip
 * in the summary and a detail table if records exist.
 */
const HealthTab = ({ health, loading, error, onRefresh }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!health) return null;

  const isHealthy = health.status === 'healthy';

  return (
    <Box>
      {/* Overall status + refresh */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Alert
          severity={isHealthy ? 'success' : 'error'}
          sx={{ flexGrow: 1 }}
        >
          {isHealthy
            ? 'All checks passed — no data integrity issues found.'
            : `${health.totalIssues} issue${health.totalIssues !== 1 ? 's' : ''} found across data integrity checks.`
          }
        </Alert>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
        >
          Refresh
        </Button>
      </Stack>

      {/* Individual checks */}
      {Object.entries(CHECK_CONFIG).map(([key, config]) => {
        const check = health.checks[key];
        if (!check) return null;

        const isPassing = check.status === 'pass';

        return (
          <Accordion key={key} variant="outlined" disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Typography sx={{ flexGrow: 1 }}>
                  {config.label}
                </Typography>
                <Chip
                  label={isPassing ? 'Pass' : `${check.count} issue${check.count !== 1 ? 's' : ''}`}
                  color={isPassing ? 'success' : 'error'}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {config.description}
              </Typography>

              {check.records.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {config.columns.map(col => (
                          <TableCell key={col.key}>{col.label}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {check.records.map((record, idx) => (
                        <TableRow key={idx}>
                          {config.columns.map(col => (
                            <TableCell key={col.key}>
                              {record[col.key] != null ? String(record[col.key]) : '—'}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No issues found.
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default HealthTab;

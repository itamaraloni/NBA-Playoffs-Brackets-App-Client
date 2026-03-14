import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';

import AdminServices from '../../services/AdminServices';

const LOGO_SIZE = 28;

/**
 * Reusable block that renders a winner-split bar and score-distribution table.
 * Used for both league predictions and bracket predictions sections.
 */
const StatsSection = ({ title, subtitle, total, winnerSplit, scoreDistribution, homeLabel, awayLabel }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
      {total} {subtitle}
    </Typography>

    {/* Winner split bar */}
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2">
          {homeLabel} ({winnerSplit.home.count}) — {winnerSplit.home.percentage.toFixed(1)}%
        </Typography>
        <Typography variant="body2">
          {winnerSplit.away.percentage.toFixed(1)}% — {awayLabel} ({winnerSplit.away.count})
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', height: 24, borderRadius: 1, overflow: 'hidden' }}>
        <Box
          sx={{
            width: `${winnerSplit.home.percentage}%`,
            bgcolor: 'primary.main',
            transition: 'width 0.3s',
            minWidth: winnerSplit.home.percentage > 0 ? '2%' : 0,
          }}
        />
        <Box
          sx={{
            width: `${winnerSplit.away.percentage}%`,
            bgcolor: 'secondary.main',
            transition: 'width 0.3s',
            minWidth: winnerSplit.away.percentage > 0 ? '2%' : 0,
          }}
        />
      </Box>
    </Box>

    {/* Score distribution table */}
    {scoreDistribution.length > 0 ? (
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Score</TableCell>
              <TableCell align="center">Count</TableCell>
              <TableCell align="right">%</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scoreDistribution.map((row) => (
              <TableRow key={row.score}>
                <TableCell>{row.score}</TableCell>
                <TableCell align="center">{row.count}</TableCell>
                <TableCell align="right">{row.percentage.toFixed(1)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    ) : (
      <Typography variant="body2" color="text.secondary">
        No predictions yet
      </Typography>
    )}
  </Box>
);

/**
 * Dialog showing prediction analytics for a matchup.
 *
 * Displays two sections:
 * 1. League Predictions — winner split bar + score distribution from Prediction records
 * 2. Bracket Predictions — same visualizations from BracketPrediction records
 *
 * Each section shows a horizontal bar (Home vs Away pick percentages) and a
 * score distribution table ranked by popularity. Bot players and null bracket
 * picks are excluded from the statistics.
 *
 * Data is fetched fresh each time the dialog opens (not cached),
 * since prediction stats can change as games progress.
 */
const PredictionStatsDialog = ({ open, onClose, matchupId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !matchupId) return;

    setStats(null);

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await AdminServices.getPredictionStats(matchupId);
        setStats(result);
      } catch (err) {
        setError(err.message || 'Failed to load prediction stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [open, matchupId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
      <DialogTitle>Prediction Stats</DialogTitle>
      <DialogContent>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {stats && !isLoading && (
          <Box>
            {/* Matchup header with team logos and names */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: { xs: 1, sm: 2 }, mb: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  component="img"
                  src={stats.homeTeamLogo}
                  alt={stats.homeTeamName}
                  sx={{ width: LOGO_SIZE, height: LOGO_SIZE }}
                />
                <Typography variant="subtitle1" fontWeight="bold">
                  {stats.homeTeamName}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">vs</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {stats.awayTeamName}
                </Typography>
                <Box
                  component="img"
                  src={stats.awayTeamLogo}
                  alt={stats.awayTeamName}
                  sx={{ width: LOGO_SIZE, height: LOGO_SIZE }}
                />
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* League predictions section */}
            <StatsSection
              title="League Predictions"
              subtitle="predictions (excluding bots)"
              total={stats.totalPredictions}
              winnerSplit={stats.winnerSplit}
              scoreDistribution={stats.scoreDistribution}
              homeLabel={stats.homeTeamName}
              awayLabel={stats.awayTeamName}
            />

            <Divider sx={{ mb: 2 }} />

            {/* Bracket predictions section */}
            <StatsSection
              title="Bracket Predictions"
              subtitle="bracket picks (excluding bots)"
              total={stats.bracketPredictions.total}
              winnerSplit={stats.bracketPredictions.winnerSplit}
              scoreDistribution={stats.bracketPredictions.scoreDistribution}
              homeLabel={stats.homeTeamName}
              awayLabel={stats.awayTeamName}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PredictionStatsDialog;

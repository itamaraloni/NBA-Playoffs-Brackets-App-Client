import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';

import AdminServices from '../../services/AdminServices';

/**
 * Dialog showing prediction analytics for a matchup.
 *
 * Displays:
 * 1. Winner split — horizontal bar showing Home vs Away pick percentages
 * 2. Score distribution — table of predicted scores ranked by popularity
 *
 * Data is fetched fresh each time the dialog opens (not cached),
 * since prediction stats can change as games progress.
 */
const PredictionStatsDialog = ({ open, onClose, matchupId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !matchupId) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await AdminServices.getPredictionStats(matchupId);
        setStats(result);
      } catch (err) {
        setError(err.message || 'Failed to load prediction stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [open, matchupId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Prediction Stats</DialogTitle>
      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {stats && !loading && (
          <Box>
            {/* Total predictions */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {stats.totalPredictions} total predictions (excluding bots)
            </Typography>

            {/* Winner split bar */}
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Winner Split
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">
                  Home ({stats.winnerSplit.home.count}) — {stats.winnerSplit.home.percentage.toFixed(1)}%
                </Typography>
                <Typography variant="body2">
                  {stats.winnerSplit.away.percentage.toFixed(1)}% — Away ({stats.winnerSplit.away.count})
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', height: 24, borderRadius: 1, overflow: 'hidden' }}>
                <Box
                  sx={{
                    width: `${stats.winnerSplit.home.percentage}%`,
                    bgcolor: 'primary.main',
                    transition: 'width 0.3s',
                    minWidth: stats.winnerSplit.home.percentage > 0 ? '2%' : 0,
                  }}
                />
                <Box
                  sx={{
                    width: `${stats.winnerSplit.away.percentage}%`,
                    bgcolor: 'secondary.main',
                    transition: 'width 0.3s',
                    minWidth: stats.winnerSplit.away.percentage > 0 ? '2%' : 0,
                  }}
                />
              </Box>
            </Box>

            {/* Score distribution table */}
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Score Distribution
            </Typography>
            {stats.scoreDistribution.length > 0 ? (
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
                    {stats.scoreDistribution.map((row) => (
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
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PredictionStatsDialog;

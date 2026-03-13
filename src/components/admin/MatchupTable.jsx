import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Stack,
  Avatar,
  Typography,
  Box,
} from '@mui/material';
import {
  PlayArrow as ActivateIcon,
  Add as AddIcon,
  BarChart as StatsIcon,
} from '@mui/icons-material';

const STATUS_COLORS = {
  upcoming: 'default',
  in_progress: 'warning',
  completed: 'success',
};

const STATUS_LABELS = {
  upcoming: 'Upcoming',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const ROUND_LABELS = {
  playin_first: 'Play-In (1st)',
  playin_second: 'Play-In (2nd)',
  first: 'First Round',
  second: 'Conference Semis',
  conference_final: 'Conference Finals',
  final: 'NBA Finals',
};

/**
 * Renders the matchup table with contextual action buttons.
 *
 * Action buttons change based on matchup status:
 * - upcoming: Activate button
 * - in_progress: +1 Home / +1 Away score buttons
 * - completed: no score actions
 * - All statuses with predictions: Stats button
 */
const MatchupTable = ({ matchups, onActivate, onUpdateScore, onViewStats }) => {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Home</TableCell>
            <TableCell>Away</TableCell>
            <TableCell>Round</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="center">Score</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {matchups.map((matchup) => (
            <TableRow key={matchup.matchupId} hover>
              {/* Home team */}
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar
                    src={matchup.homeTeam.logo}
                    alt={matchup.homeTeam.name}
                    sx={{ width: 28, height: 28 }}
                  />
                  <Typography variant="body2">
                    {matchup.homeTeam.seed && `(${matchup.homeTeam.seed}) `}
                    {matchup.homeTeam.name}
                  </Typography>
                </Box>
              </TableCell>

              {/* Away team */}
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar
                    src={matchup.awayTeam.logo}
                    alt={matchup.awayTeam.name}
                    sx={{ width: 28, height: 28 }}
                  />
                  <Typography variant="body2">
                    {matchup.awayTeam.seed && `(${matchup.awayTeam.seed}) `}
                    {matchup.awayTeam.name}
                  </Typography>
                </Box>
              </TableCell>

              {/* Round */}
              <TableCell>
                <Typography variant="body2">
                  {ROUND_LABELS[matchup.round] || matchup.round}
                </Typography>
              </TableCell>

              {/* Status chip */}
              <TableCell>
                <Chip
                  label={STATUS_LABELS[matchup.status] || matchup.status}
                  color={STATUS_COLORS[matchup.status] || 'default'}
                  size="small"
                />
              </TableCell>

              {/* Score */}
              <TableCell align="center">
                {matchup.status !== 'upcoming' ? (
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {matchup.homeTeamScore} - {matchup.awayTeamScore}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">—</Typography>
                )}
              </TableCell>

              {/* Actions */}
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                  {matchup.status === 'upcoming' && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      startIcon={<ActivateIcon />}
                      onClick={() => onActivate(matchup.matchupId)}
                    >
                      Activate
                    </Button>
                  )}

                  {matchup.status === 'in_progress' && (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onUpdateScore(matchup.matchupId, {
                          homeTeamScore: matchup.homeTeamScore + 1,
                          awayTeamScore: matchup.awayTeamScore,
                        })}
                      >
                        <AddIcon fontSize="small" sx={{ mr: 0.25 }} />
                        Home
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onUpdateScore(matchup.matchupId, {
                          homeTeamScore: matchup.homeTeamScore,
                          awayTeamScore: matchup.awayTeamScore + 1,
                        })}
                      >
                        <AddIcon fontSize="small" sx={{ mr: 0.25 }} />
                        Away
                      </Button>
                    </>
                  )}

                  <Button
                    size="small"
                    variant="text"
                    startIcon={<StatsIcon />}
                    onClick={() => onViewStats(matchup.matchupId)}
                  >
                    Stats
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}

          {matchups.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">No matchups found</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MatchupTable;

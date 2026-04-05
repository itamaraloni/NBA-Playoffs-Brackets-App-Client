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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PlayArrow as ActivateIcon,
  Add as AddIcon,
  BarChart as StatsIcon,
} from '@mui/icons-material';
import { getShortTeamName } from '../../shared/teamUtils';

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

const PLAYIN_ROUNDS = new Set(['playin_first', 'playin_second']);

/** For completed play-in games, returns the short winner name (e.g. "Thunder"). */
const getPlayInWinnerLabel = (matchup) => {
  if (!PLAYIN_ROUNDS.has(matchup.round)) return null;
  if (matchup.homeTeamScore === matchup.awayTeamScore) return null;
  const winnerName = matchup.homeTeamScore > matchup.awayTeamScore
    ? matchup.homeTeam.name
    : matchup.awayTeam.name;
  return getShortTeamName(winnerName);
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (matchups.length === 0) {
    return (
      <Paper variant="outlined" sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No matchups found</Typography>
      </Paper>
    );
  }

  // Mobile: card layout — each matchup rendered as a compact card
  if (isMobile) {
    return (
      <Stack spacing={1.5}>
        {matchups.map((matchup) => (
          <Paper key={matchup.matchupId} variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              {/* Teams row */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar
                    src={matchup.homeTeam.logo}
                    alt={matchup.homeTeam.name}
                    sx={{ width: 24, height: 24 }}
                  />
                  <Typography variant="body2">
                    {matchup.homeTeam.seed && `(${matchup.homeTeam.seed}) `}
                    {matchup.homeTeam.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">vs</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">
                    {matchup.awayTeam.seed && `(${matchup.awayTeam.seed}) `}
                    {matchup.awayTeam.name}
                  </Typography>
                  <Avatar
                    src={matchup.awayTeam.logo}
                    alt={matchup.awayTeam.name}
                    sx={{ width: 24, height: 24 }}
                  />
                </Box>
              </Box>

              {/* Round + Status + Score */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  {ROUND_LABELS[matchup.round] || matchup.round}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={STATUS_LABELS[matchup.status] || matchup.status}
                    color={STATUS_COLORS[matchup.status] || 'default'}
                    size="small"
                  />
                  {matchup.status !== 'upcoming' && (
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {matchup.homeTeamScore} - {matchup.awayTeamScore}
                      {getPlayInWinnerLabel(matchup) && ` (${getPlayInWinnerLabel(matchup)})`}
                    </Typography>
                  )}
                </Stack>
              </Box>

              {/* Deadline */}
              <Typography variant="caption" color="text.secondary">
                Deadline: {matchup.predictionDeadlineAt
                  ? new Date(matchup.predictionDeadlineAt).toLocaleString()
                  : '—'}
              </Typography>

              {/* Actions — stacked vertically, full width */}
              <Stack spacing={0.5}>
                {matchup.status === 'upcoming' && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    startIcon={<ActivateIcon />}
                    onClick={() => onActivate(matchup.matchupId)}
                    fullWidth
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
                      fullWidth
                    >
                      <AddIcon fontSize="small" sx={{ mr: 0.25 }} />
                      +1 Home
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onUpdateScore(matchup.matchupId, {
                        homeTeamScore: matchup.homeTeamScore,
                        awayTeamScore: matchup.awayTeamScore + 1,
                      })}
                      fullWidth
                    >
                      <AddIcon fontSize="small" sx={{ mr: 0.25 }} />
                      +1 Away
                    </Button>
                  </>
                )}

                <Button
                  size="small"
                  variant="text"
                  startIcon={<StatsIcon />}
                  onClick={() => onViewStats(matchup.matchupId)}
                  fullWidth
                >
                  Stats
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>
    );
  }

  // Desktop: standard table layout
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
            <TableCell>Deadline</TableCell>
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
                    {getPlayInWinnerLabel(matchup) && ` (${getPlayInWinnerLabel(matchup)})`}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">—</Typography>
                )}
              </TableCell>

              {/* Deadline */}
              <TableCell>
                <Typography variant="body2">
                  {matchup.predictionDeadlineAt
                    ? new Date(matchup.predictionDeadlineAt).toLocaleString()
                    : '—'}
                </Typography>
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
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MatchupTable;

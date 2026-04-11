import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Avatar,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { EmojiEvents as TrophyIcon } from '@mui/icons-material';
import { PLAYER_AVATARS } from '../shared/GeneralConsts';

/**
 * GlobalRankings — displays the top-10 global player rankings across all leagues.
 *
 * If the current user is outside the top 10, their rank is appended at the bottom
 * with a visual separator so they can always see where they stand.
 *
 * Props:
 *   globalRankings — { topPlayers, myRank, totalPlayers } from LeagueServices.getGlobalRankings()
 */
const GlobalRankings = ({ globalRankings }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!globalRankings?.topPlayers?.length) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No global ranking data available.</Typography>
      </Paper>
    );
  }

  const { topPlayers, myRank, totalPlayers } = globalRankings;

  // Determine if the current user appears in the top-10 list (match on unique player ID)
  const myRankInTop = myRank
    ? topPlayers.some(p => p.playerId === myRank.playerId)
    : false;

  const resolveAvatar = (avatarId) =>
    PLAYER_AVATARS.find(a => a.id === avatarId)?.src;

  const renderRankCell = (rank) => {
    if (rank === 1) {
      return (
        <Box display="flex" alignItems="center">
          <Typography variant="body2" fontWeight="bold">1</Typography>
          <TrophyIcon fontSize="small" sx={{ color: 'gold', ml: 0.5 }} />
        </Box>
      );
    }
    return rank;
  };

  const renderPlayerCell = (name, avatarId, isMe) => (
    <Box display="flex" alignItems="center">
      <Avatar
        sx={{
          width: 32,
          height: 32,
          mr: 1,
          bgcolor: isMe ? theme.palette.primary.main : theme.palette.grey[300],
          fontSize: '0.875rem'
        }}
        src={resolveAvatar(avatarId)}
        alt={name}
      >
        {name?.charAt(0)}
      </Avatar>
      <Typography variant="body2" fontWeight={isMe ? 'bold' : 'regular'}>
        {name}
        {isMe && (
          <Typography component="span" variant="caption" color="text.secondary">
            {' '}(You)
          </Typography>
        )}
      </Typography>
    </Box>
  );

  const rowHighlight = (isMe) => ({
    bgcolor: isMe ? alpha(theme.palette.primary.main, 0.13) : 'inherit',
  });

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table size={isMobile ? 'small' : 'medium'}>
        <TableHead>
          <TableRow sx={{ bgcolor: theme.palette.action.selected }}>
            <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Rank</TableCell>
            <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Player</TableCell>
            <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>League</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>Score</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {topPlayers.map((player, index) => {
            const isMe = myRank && player.playerId === myRank.playerId;

            return (
              <TableRow key={player.playerId || `${player.rank}-${index}`} sx={rowHighlight(isMe)}>
                <TableCell>{renderRankCell(player.rank)}</TableCell>
                <TableCell>{renderPlayerCell(player.playerName, player.playerAvatar, isMe)}</TableCell>
                <TableCell>{player.leagueName || '—'}</TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold">{player.totalScore}</Typography>
                </TableCell>
              </TableRow>
            );
          })}

          {/* If current user is outside the top 10, show separator + their rank */}
          {myRank && !myRankInTop && (
            <>
              <TableRow>
                <TableCell
                  colSpan={4}
                  sx={{ py: 0.5, border: 'none' }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    ···
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow sx={rowHighlight(true)}>
                <TableCell>{renderRankCell(myRank.rank)}</TableCell>
                <TableCell>{renderPlayerCell(myRank.playerName, myRank.playerAvatar, true)}</TableCell>
                <TableCell>{myRank.leagueName || '—'}</TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold">{myRank.totalScore}</Typography>
                </TableCell>
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>

      {/* Footer: total player count */}
      <Tooltip title="Excluding bot players" enterTouchDelay={0} leaveTouchDelay={1500}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'right', px: 2, py: 1, cursor: 'default' }}
        >
          {totalPlayers} players total
        </Typography>
      </Tooltip>
    </TableContainer>
  );
};

export default GlobalRankings;

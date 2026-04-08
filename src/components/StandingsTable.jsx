import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Box,
  Typography,
  Avatar,
  Chip,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { EmojiEvents as TrophyIcon } from '@mui/icons-material';
import { PLAYER_AVATARS } from '../shared/GeneralConsts';
import { getLogoPath } from '../shared/teamUtils';
import { getPlayerAvatar } from '../shared/playerUtils';

// Medal colors for top-3 rank display
const MEDAL_COLORS = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };

/**
 * Small resource avatar (team logo or NBA player headshot) with initials fallback.
 * Mirrors the fallback pattern used in BonusPicks: try the image, fall back to
 * styled initials box on onError so broken asset paths degrade gracefully.
 */
const ResourceAvatar = ({ src, name }) => {
  const theme = useTheme();
  const [imgError, setImgError] = useState(false);

  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  if (src && !imgError) {
    return (
      <Box
        component="img"
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        sx={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }}
      />
    );
  }

  return (
    <Box
      sx={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.5625rem', fontWeight: 800,
        background: theme.palette.action.selected,
        color: theme.palette.text.primary,
      }}
    >
      {initials}
    </Box>
  );
};

/**
 * Status chip for a champion or MVP pick. Visual language matches PickCard:
 *   in_progress → green "Alive"
 *   eliminated  → red "Eliminated"
 *   scored      → gold "+X pts"
 *   null        → em dash
 */
const PickStatusChip = ({ status, points }) => {
  const theme = useTheme();

  if (!status) {
    return <Typography variant="caption" color="text.disabled">—</Typography>;
  }

  switch (status) {
    case 'scored':
      return (
        <Chip
          size="small"
          label={`+${points} pts`}
          sx={{
            bgcolor: 'rgba(255, 215, 0, 0.15)',
            color: theme.palette.mode === 'dark' ? '#FFD700' : '#B8860B',
            fontWeight: 700,
            border: '1px solid #FFD700',
            fontSize: '0.7rem',
            height: 22,
          }}
        />
      );
    case 'eliminated':
      return (
        <Chip
          size="small"
          label="Eliminated"
          color="error"
          variant="outlined"
          sx={{ fontSize: '0.7rem', height: 22 }}
        />
      );
    case 'in_progress':
    default:
      return (
        <Chip
          size="small"
          label="Alive"
          sx={{
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.25)' : 'rgba(46, 125, 50, 0.12)',
            color: theme.palette.success.main,
            fontWeight: 600,
            border: '1px solid',
            borderColor: theme.palette.success.main,
            fontSize: '0.7rem',
            height: 22,
          }}
        />
      );
  }
};

/**
 * Pick cell: avatar (team logo or player headshot) alongside the status chip.
 * The pick name is revealed on hover via a Tooltip over the whole cell content.
 * This keeps column width consistent — no variable-length text shifts the chip alignment.
 */
const PickCell = ({ pickName, avatarSrc, status, points }) => {
  if (!pickName) {
    return <Typography variant="caption" color="text.disabled">—</Typography>;
  }

  return (
    <Tooltip title={pickName} arrow placement="top">
      <Box display="inline-flex" alignItems="center" gap={0.75} sx={{ cursor: 'default' }}>
        <ResourceAvatar src={avatarSrc} name={pickName} />
        <PickStatusChip status={status} points={points} />
      </Box>
    </Tooltip>
  );
};

/**
 * Rank cell: trophy icon + bold number for top 3, plain number otherwise.
 * Gold / silver / bronze to differentiate the medal positions.
 */
const RankCell = ({ rank }) => {
  if (rank <= 3) {
    return (
      <Box display="flex" alignItems="center">
        <TrophyIcon fontSize="small" sx={{ color: MEDAL_COLORS[rank], mr: 0.5 }} />
        <Typography variant="body2" fontWeight="bold">{rank}</Typography>
      </Box>
    );
  }
  return rank;
};

/**
 * Responsive standings table.
 *
 * Desktop (≥ sm): 7 columns — Rank, Player, Champion, MVP, Predictions, Bracket, Total.
 *   Champion and Finals MVP show a resource avatar + status chip; hover reveals the pick name.
 *   Live Picks, Bracket, and Total headers are sortable (TableSortLabel).
 *   Rank always reflects the server-determined total-score rank, regardless of sort.
 *
 * Mobile (< sm): 3 columns — Rank, Player, Total.
 *   Tapping a row opens the player detail dialog (already surfaces all pick/score detail).
 */
const StandingsTable = ({ players, currentPlayerId, onPlayerSelect }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Sorting state for the numeric score columns (desktop only)
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Derive a sorted copy of the players array; falls back to server order when no sort active.
  // useMemo avoids re-sorting on every render when only unrelated state changes.
  const sortedPlayers = useMemo(() => {
    if (!sortColumn) return players;

    const getValue = (p) => {
      switch (sortColumn) {
        case 'predictions': return p.totalPredictionPoints ?? 0;
        case 'bracket':     return p.bracketScore ?? 0;
        case 'total':       return p.score ?? 0;
        default:            return 0;
      }
    };

    return [...players].sort((a, b) => {
      const diff = getValue(a) - getValue(b);
      if (diff !== 0) return sortDirection === 'asc' ? diff : -diff;
      return a.rank - b.rank;
    });
  }, [players, sortColumn, sortDirection]);

  const resolveAvatar = (avatarId) =>
    PLAYER_AVATARS.find(a => a.id === avatarId)?.src;

  const renderPlayerCell = (player, isCurrentPlayer) => (
    <Box display="flex" alignItems="center">
      <Avatar
        sx={{
          width: 32,
          height: 32,
          mr: 1,
          bgcolor: isCurrentPlayer ? theme.palette.primary.main : theme.palette.grey[300],
          fontSize: '0.875rem',
        }}
        src={resolveAvatar(player.playerAvatar)}
        alt={player.name}
      >
        {player.name.charAt(0)}
      </Avatar>
      <Typography
        variant="body2"
        fontWeight={isCurrentPlayer ? 'bold' : 'regular'}
        sx={isMobile ? { maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : {}}
      >
        {player.name}
        {isCurrentPlayer && (
          <Typography component="span" variant="caption" color="text.secondary">
            {' '}(You)
          </Typography>
        )}
      </Typography>
    </Box>
  );

  // Current-player row: background tint + left-edge accent via inset box-shadow
  // (border-left on <tr> is unreliable in the CSS table model)
  const buildRowSx = (isCurrentPlayer) => ({
    bgcolor: isCurrentPlayer ? alpha(theme.palette.primary.main, 0.08) : 'inherit',
    ...(isCurrentPlayer && {
      boxShadow: `inset 3px 0 0 ${theme.palette.primary.main}`,
    }),
    '&:hover': {
      bgcolor: isCurrentPlayer
        ? alpha(theme.palette.primary.main, 0.15)
        : theme.palette.action.hover,
      cursor: 'pointer',
    },
  });

  // Helper to build TableSortLabel props for a given column key
  const sortLabelProps = (column) => ({
    active: sortColumn === column,
    direction: sortColumn === column ? sortDirection : 'desc',
    onClick: () => handleSort(column),
  });

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table size={isMobile ? 'small' : 'medium'}>
        <TableHead>
          <TableRow>
            {isMobile ? (
              <>
                <TableCell>Rank</TableCell>
                <TableCell>Player</TableCell>
                <TableCell align="right">Total</TableCell>
              </>
            ) : (
              <>
                <TableCell>Rank</TableCell>
                <TableCell>Player</TableCell>
                <TableCell>Champion</TableCell>
                <TableCell>Finals MVP</TableCell>
                <TableCell align="right">
                  <TableSortLabel {...sortLabelProps('predictions')}>
                    Live Picks
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel {...sortLabelProps('bracket')}>
                    Bracket
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel {...sortLabelProps('total')}>
                    Total
                  </TableSortLabel>
                </TableCell>
              </>
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {sortedPlayers.map((player) => {
            const isCurrentPlayer = player.id === currentPlayerId;

            if (isMobile) {
              return (
                <TableRow
                  key={player.id}
                  sx={buildRowSx(isCurrentPlayer)}
                  onClick={() => onPlayerSelect && onPlayerSelect(player.id)}
                >
                  <TableCell><RankCell rank={player.rank} /></TableCell>
                  <TableCell>{renderPlayerCell(player, isCurrentPlayer)}</TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold">{player.score}</Typography>
                  </TableCell>
                </TableRow>
              );
            }

            return (
              <TableRow
                key={player.id}
                sx={buildRowSx(isCurrentPlayer)}
                onClick={() => onPlayerSelect && onPlayerSelect(player.id)}
              >
                <TableCell><RankCell rank={player.rank} /></TableCell>
                <TableCell>{renderPlayerCell(player, isCurrentPlayer)}</TableCell>
                <TableCell>
                  <PickCell
                    pickName={player.championshipPrediction}
                    avatarSrc={player.championshipPrediction ? getLogoPath(player.championshipPrediction) : null}
                    status={player.championshipPickStatus}
                    points={player.championshipTeamPoints}
                  />
                </TableCell>
                <TableCell>
                  <PickCell
                    pickName={player.mvpPrediction}
                    avatarSrc={player.mvpPrediction ? getPlayerAvatar(player.mvpPrediction) : null}
                    status={player.mvpPickStatus}
                    points={player.mvpPoints}
                  />
                </TableCell>
                <TableCell align="right">{player.totalPredictionPoints ?? 0}</TableCell>
                <TableCell align="right">{player.bracketScore ?? 0}</TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold">{player.score}</Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StandingsTable;

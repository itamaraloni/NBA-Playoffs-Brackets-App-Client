import React from 'react';
import PropTypes from 'prop-types';
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
  useMediaQuery,
  useTheme,
  Tooltip
} from '@mui/material';
import { EmojiEvents as TrophyIcon } from '@mui/icons-material';

/**
 * Responsive standings table for displaying player rankings
 */
const StandingsTable = ({ players, currentPlayerId, onPlayerSelect }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  // Responsive table columns based on screen size
  const getTableColumns = () => {
    if (isMobile) {
      // On mobile, show only rank, player and score
      return (
        <>
          <TableCell>Rank</TableCell>
          <TableCell>Player</TableCell>
          <TableCell align="right">Score</TableCell>
        </>
      );
    } else if (isTablet) {
      // On tablet, add championship prediction
      return (
        <>
          <TableCell>Rank</TableCell>
          <TableCell>Player</TableCell>
          <TableCell>Championship</TableCell>
          <TableCell align="right">Score</TableCell>
        </>
      );
    } else {
      // On desktop, show all columns
      return (
        <>
          <TableCell>Rank</TableCell>
          <TableCell>Player</TableCell>
          <TableCell>Championship</TableCell>
          <TableCell>MVP</TableCell>
          <TableCell align="right">Score</TableCell>
        </>
      );
    }
  };

  // Responsive table rows based on screen size
  const getTableRows = (player, index) => {
    const isCurrentPlayer = player.id === currentPlayerId;
    const isLeader = index === 0;
    
    if (isMobile) {
      return (
        <>
          <TableCell>
            {isLeader ? (
              <Box display="flex" alignItems="center">
                <TrophyIcon fontSize="small" sx={{ color: 'gold', mr: 0.5 }} />
                <Typography variant="body2" fontWeight="bold">{index + 1}</Typography>
              </Box>
            ) : (
              index + 1
            )}
          </TableCell>
          <TableCell>
            <Box display="flex" alignItems="center">
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  mr: 1, 
                  bgcolor: isCurrentPlayer ? theme.palette.primary.main : theme.palette.grey[300],
                  fontSize: '0.875rem'
                }}
              >
                {player.name.charAt(0)}
              </Avatar>
              <Typography 
                variant="body2" 
                fontWeight={isCurrentPlayer ? 'bold' : 'regular'}
                sx={{ maxWidth: '80px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
              >
                {player.name}
                {isCurrentPlayer && <Typography component="span" variant="caption" color="text.secondary">{' '}(You)</Typography>}
              </Typography>
            </Box>
          </TableCell>
          <TableCell align="right">
            <Typography fontWeight="bold">{player.score}</Typography>
          </TableCell>
        </>
      );
    } else if (isTablet) {
      return (
        <>
          <TableCell>
            {isLeader ? (
              <Box display="flex" alignItems="center">
                <TrophyIcon fontSize="small" sx={{ color: 'gold', mr: 0.5 }} />
                <Typography variant="body2" fontWeight="bold">{index + 1}</Typography>
              </Box>
            ) : (
              index + 1
            )}
          </TableCell>
          <TableCell>
            <Box display="flex" alignItems="center">
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  mr: 1, 
                  bgcolor: isCurrentPlayer ? theme.palette.primary.main : theme.palette.grey[300]
                }}
              >
                {player.name.charAt(0)}
              </Avatar>
              <Typography variant="body2" fontWeight={isCurrentPlayer ? 'bold' : 'regular'}>
                {player.name}
                {isCurrentPlayer && <Typography component="span" variant="caption" color="text.secondary">{' '}(You)</Typography>}
              </Typography>
            </Box>
          </TableCell>
          <TableCell>{player.championshipPrediction}</TableCell>
          <TableCell align="right">
            <Typography fontWeight="bold">{player.score}</Typography>
          </TableCell>
        </>
      );
    } else {
      return (
        <>
          <TableCell>
            {isLeader ? (
              <Box display="flex" alignItems="center">
                <TrophyIcon fontSize="small" sx={{ color: 'gold', mr: 0.5 }} />
                <Typography variant="body2" fontWeight="bold">{index + 1}</Typography>
              </Box>
            ) : (
              index + 1
            )}
          </TableCell>
          <TableCell>
            <Box display="flex" alignItems="center">
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  mr: 1, 
                  bgcolor: isCurrentPlayer ? theme.palette.primary.main : theme.palette.grey[300]
                }}
              >
                {player.name.charAt(0)}
              </Avatar>
              <Typography variant="body2" fontWeight={isCurrentPlayer ? 'bold' : 'regular'}>
                {player.name}
                {isCurrentPlayer && <Typography component="span" variant="caption" color="text.secondary">{' '}(You)</Typography>}
              </Typography>
            </Box>
          </TableCell>
          <TableCell>{player.championshipPrediction}</TableCell>
          <TableCell>{player.mvpPrediction}</TableCell>
          <TableCell align="right">
            <Typography fontWeight="bold">{player.score}</Typography>
          </TableCell>
        </>
      );
    }
  };

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table size={isMobile ? "small" : "medium"}>
        <TableHead>
          <TableRow>
            {getTableColumns()}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedPlayers.map((player, index) => (
            <Tooltip 
              key={player.id}
              title="Click to view player details" 
              arrow
              placement="top"
            >
              <TableRow 
                sx={{ 
                  bgcolor: player.id === currentPlayerId ? 
                    `${theme.palette.primary.main}15` : 'inherit',
                  '&:hover': {
                    bgcolor: player.id === currentPlayerId ? 
                      `${theme.palette.primary.main}25` : 
                      theme.palette.action.hover,
                    cursor: 'pointer'
                  }
                }}
                onClick={() => onPlayerSelect && onPlayerSelect(player.id)}
              >
                {getTableRows(player, index)}
              </TableRow>
            </Tooltip>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

StandingsTable.propTypes = {
  players: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      championshipPrediction: PropTypes.string,
      mvpPrediction: PropTypes.string,
      score: PropTypes.number.isRequired
    })
  ).isRequired,
  currentPlayerId: PropTypes.string,
  onPlayerSelect: PropTypes.func
};

export default StandingsTable;
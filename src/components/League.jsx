import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Divider,
  useTheme,
  Paper
} from '@mui/material';
import {
  Group as UsersIcon,
  CalendarMonth as CalendarIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import PlayerCard from './PlayerCard';

const League = ({ 
  league, 
  currentPlayerId = null,
  showPlayers = true,
  onJoinLeague = null,
  isPreview = false,
  onCopyCode = null
}) => {
  const theme = useTheme();
  
  return (
    <Card 
      variant="outlined" 
      sx={{ 
        overflow: 'hidden',
        mb: 3
      }}
    >
      {/* League Header */}
      <CardContent sx={{ 
        bgcolor: league?.isActive ? 
          `${theme.palette.success.main}08` : 
          `${theme.palette.grey[100]}`
      }}>
        <Typography variant="h5" component="h3" gutterBottom>
          {league.name}
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2, 
          alignItems: 'center',
          mb: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.primary.main }} />
            <Typography variant="body2">
              Season: {`${new Date().getFullYear()-1}-${new Date().getFullYear()}`}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <UsersIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.primary.main }} />
            <Typography variant="body2">
              {league?.playerCount || 0} players
            </Typography>
          </Box>
          
          <Chip 
            label={league?.isActive ? "Active" : "Completed"} 
            color={league?.isActive ? "success" : "default"} 
            size="small"
            variant="outlined"
          />
        </Box>

        {/* Join League button */}
        {onJoinLeague && (
          <Button 
            variant="contained" 
            color="primary"
            size="medium"
            sx={{ mt: 2 }}
            onClick={() => onJoinLeague(league?.id, league?.code)}
          >
            Join League
          </Button>
        )}
        
        {/* League code display for preview */}
        {(isPreview || onCopyCode) && league?.code && (
          <Paper variant="outlined" sx={{ mt: 2, p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2">
              Join code: <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 'medium' }}>{league?.code}</Box>
            </Typography>
            
            {onCopyCode && (
              <Button 
                size="small" 
                variant="text" 
                color="primary" 
                startIcon={<CopyIcon />}
                onClick={() => onCopyCode(league.code)}
              >
                Copy
              </Button>
            )}
          </Paper>
        )}
      </CardContent>
      
      {/* League Players */}
      {showPlayers && league?.players && league.players.length > 0 && (
        <>
          <Divider />
          <CardContent>
            <Typography variant="h6" component="h4" sx={{ mb: 2 }}>
              Players
            </Typography>
            
            <Box>
              {league.players
                .sort((a, b) => (b.score || 0) - (a.score || 0)) // Sort by score descending
                .map((player) => (
                  <PlayerCard 
                    key={player.id}
                    player={player}
                    isCurrentPlayer={player.id === currentPlayerId}
                  />
              ))}
            </Box>
          </CardContent>
        </>
      )}
    </Card>
  );
};

League.propTypes = {
  league: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    isActive: PropTypes.bool,
    code: PropTypes.string,
    playerCount: PropTypes.number,
    players: PropTypes.arrayOf(PropTypes.object)
  }).isRequired,
  currentPlayerId: PropTypes.string,
  showPlayers: PropTypes.bool,
  onJoinLeague: PropTypes.func,
  isPreview: PropTypes.bool,
  onCopyCode: PropTypes.func
};

export default League;
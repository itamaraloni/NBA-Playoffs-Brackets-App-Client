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
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import PlayerCard from './PlayerCard';

const League = ({
  league,
  currentPlayerId = null,
  showPlayers = true,
  onCopyInviteLink = null,
  onRegenerateInvite = null,
  isCommissioner = false,
  regenerating = false
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

        {/* Invite link section */}
        {onCopyInviteLink && league?.inviteToken && (
          <Paper variant="outlined" sx={{ mt: 2, p: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="body2" sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                Invite link: <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 'medium' }}>
                  {`${window.location.origin}/invite/${league.inviteToken}`}
                </Box>
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                <Button
                  size="small"
                  variant="text"
                  color="primary"
                  startIcon={<CopyIcon />}
                  onClick={onCopyInviteLink}
                >
                  Copy
                </Button>
                {isCommissioner && onRegenerateInvite && (
                  <Button
                    size="small"
                    variant="text"
                    color="warning"
                    startIcon={<RefreshIcon />}
                    onClick={onRegenerateInvite}
                    disabled={regenerating}
                  >
                    {regenerating ? 'Regenerating...' : 'Regenerate'}
                  </Button>
                )}
              </Box>
            </Box>
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
    inviteToken: PropTypes.string,
    playerCount: PropTypes.number,
    players: PropTypes.arrayOf(PropTypes.object)
  }).isRequired,
  currentPlayerId: PropTypes.string,
  showPlayers: PropTypes.bool,
  onCopyInviteLink: PropTypes.func,
  onRegenerateInvite: PropTypes.func,
  isCommissioner: PropTypes.bool,
  regenerating: PropTypes.bool
};

export default League;
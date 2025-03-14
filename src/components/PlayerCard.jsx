import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  useTheme,
  CardActionArea
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  MilitaryTech as MvpIcon
} from '@mui/icons-material';

const PlayerCard = ({ 
  player, 
  onClick, 
  isSelectable = false, 
  isCurrentPlayer = false,
  compact = false
}) => {
  const theme = useTheme();
  
  const CardWrapper = isSelectable ? CardActionArea : Box;
  
  return (
    <Card 
      variant="outlined"
      sx={{ 
        mb: 2,
        bgcolor: isCurrentPlayer ? `${theme.palette.primary.main}10` : 'inherit',
      }}
    >
      <CardWrapper onClick={isSelectable ? onClick : undefined} sx={{ width: '100%' }}>
        <CardContent sx={{ p: compact ? 1.5 : 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Avatar */}
            <Avatar
              sx={{ 
                width: compact ? 40 : 48, 
                height: compact ? 40 : 48, 
                mr: 2,
                bgcolor: isCurrentPlayer ? theme.palette.primary.main : theme.palette.grey[400]
              }}
            >
              {player.name.charAt(0)}
            </Avatar>
            
            {/* Player Info */}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant={compact ? "body1" : "h6"} component="h3" fontWeight="medium">
                {player.name}
                {isCurrentPlayer && (
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    (You)
                  </Typography>
                )}
              </Typography>
              
              {/* Show predictions if they exist */}
              {!compact && (player.championshipPrediction || player.mvpPrediction) && (
                <Box sx={{ mt: 1 }}>
                  {player.championshipPrediction && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <TrophyIcon sx={{ fontSize: 16, color: 'gold', mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        Champion: {player.championshipPrediction}
                      </Typography>
                    </Box>
                  )}
                  
                  {player.mvpPrediction && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MvpIcon sx={{ fontSize: 16, color: 'gold', mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        MVP: {player.mvpPrediction}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
            
            {/* Score or status */}
            {player.score !== undefined && (
              <Typography variant="h6" fontWeight="bold" color="primary">
                {player.score}
              </Typography>
            )}
            
            {/* League Status Badge */}
            {player.leagueId && !player.score && (
              <Chip 
                label="In League" 
                color="primary" 
                size="small" 
                variant="outlined"
              />
            )}
          </Box>
        </CardContent>
      </CardWrapper>
    </Card>
  );
};

PlayerCard.propTypes = {
  player: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    championshipPrediction: PropTypes.string,
    mvpPrediction: PropTypes.string,
    leagueId: PropTypes.string,
    score: PropTypes.number
  }).isRequired,
  onClick: PropTypes.func,
  isSelectable: PropTypes.bool,
  isCurrentPlayer: PropTypes.bool,
  compact: PropTypes.bool
};

export default PlayerCard;
import React from 'react';
import PropTypes from 'prop-types';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Avatar,
  Divider,
  Chip,
  Button,
  useTheme
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  MilitaryTech as MvpIcon,
  Edit as EditIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import PredictionStatsTable from './PredictionStatsTable';
import { PLAYER_AVATARS } from '../shared/GeneralConsts';

/**
 * Component for showing player stats in dashboard
 */
const PlayerStatsCard = ({ 
  playerData, 
  leagueData,
  onEditPicks, 
  elevation = 2 
}) => {
  const theme = useTheme();
  
  if (!playerData) return null;
  
  // Calculate if user can edit picks (deadline April 14, 2025)
  const currentDate = new Date();
  const editDeadline = new Date('2025-04-14T23:59:59');
  const canEdit = currentDate < editDeadline;

  return (
    <Paper
      elevation={elevation}
      sx={{
        p: 3,
        borderRadius: 2,
        height: '100%',
        bgcolor: theme.palette.background.paper
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar 
          sx={{ 
            bgcolor: theme.palette.primary.main,
            width: 48,
            height: 48,
            mr: 2
          }}
          src={PLAYER_AVATARS.find(avatar => avatar.id === playerData.player_avatar)?.src}
          alt={playerData.name}
        >
          {playerData.name?.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight="medium">
            {playerData.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {leagueData?.name ? `League: ${leagueData.name}` : 'No League'}
          </Typography>
        </Box>
        <Box sx={{ ml: 'auto', textAlign: 'center', display: 'flex', alignItems: 'center' }}>
            <TrendingUpIcon sx={{ color: theme.palette.success.main, mr: 1, fontSize: 28 }} />
            <Box>
                <Typography variant="body2" color="success.main">
                Total Points
                </Typography>
                <Typography variant="h5" color="success.main" fontWeight="bold" lineHeight={1.2}>
                {playerData.total_points || 0}
                </Typography>
            </Box>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />
      
      {/* Championship and MVP Predictions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2.5, 
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(232, 244, 253, 0.8)',
              borderColor: theme.palette.primary.main,
              position: 'relative'
            }}
          >
            {canEdit && (
              <Button
                color="primary"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => onEditPicks('championship')}
                sx={{ 
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  minWidth: 'auto',
                  p: '4px 4px'
                }}
              >
              </Button>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrophyIcon sx={{ color: 'gold', mr: 1 }} />
              <Typography variant="body1" fontWeight="medium">
                Championship Pick
              </Typography>
            </Box>
            <Chip 
              label={playerData.winning_team || 'Not selected'} 
              color="primary" 
              variant="outlined" 
              sx={{ fontWeight: 'medium', fontSize: '0.95rem' }}
            />
            {playerData.championship_team_points !== undefined && (
              <Typography variant="body2" fontWeight="medium" sx={{ mt: 1.5, color: theme.palette.primary.main }}>
                {playerData.championship_team_points} points earned
              </Typography>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2.5, 
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(156, 39, 176, 0.08)' : 'rgba(243, 229, 245, 0.8)',
              borderColor: theme.palette.secondary.main,
              position: 'relative'
            }}
          >
            {canEdit && (
              <Button
                color="secondary"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => onEditPicks('mvp')}
                sx={{ 
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  minWidth: 'auto',
                  p: '4px 4px'
                }}
              >
              </Button>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <MvpIcon sx={{ color: 'gold', mr: 1 }} />
              <Typography variant="body1" fontWeight="medium">
                MVP Pick
              </Typography>
            </Box>
            <Chip 
              label={playerData.mvp || 'Not selected'} 
              color="secondary" 
              variant="outlined" 
              sx={{ fontWeight: 'medium', fontSize: '0.95rem' }}
            />
            {playerData.mvp_points !== undefined && (
              <Typography variant="body2" fontWeight="medium" sx={{ mt: 1.5, color: theme.palette.secondary.main }}>
                {playerData.mvp_points} points earned
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Prediction Statistics By Round
      </Typography>
      
      {/* Stats Table Component */}
      <PredictionStatsTable playerData={playerData} />
      
    </Paper>
  );
};

PlayerStatsCard.propTypes = {
  playerData: PropTypes.object,
  leagueData: PropTypes.object,
  onEditPicks: PropTypes.func,
  pointsIcon: PropTypes.node,
  elevation: PropTypes.number
};

export default PlayerStatsCard;
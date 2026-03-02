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
import { PLAYER_AVATARS, NBA_TEAMS_WITH_POINTS, MVP_CANDIDATES_WITH_POINTS } from '../shared/GeneralConsts';
import { PLAYIN_START_DATE } from '../shared/SeasonConfig';

/**
 * Sub-component for displaying pick status badge and points.
 * Handles all status values: in_progress, eliminated, scored, unknown.
 *
 * @param {string} status - Pick status from server: 'in_progress' | 'eliminated' | 'scored' | 'unknown'
 * @param {number} earnedPoints - Points already awarded (> 0 when scored)
 * @param {number} lookupPoints - Points this pick is worth (from constants lookup)
 * @param {string} accentColor - MUI theme color key for scored state (e.g. 'primary' or 'secondary')
 */
const PickStatusBadge = ({ status, earnedPoints, lookupPoints, accentColor }) => {
  const pts = earnedPoints > 0 ? earnedPoints : lookupPoints;
  return (
    <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      <Typography variant="body2" fontWeight="medium"
        color={status === 'scored' ? `${accentColor}.main` : 'text.secondary'}>
        {status === 'scored' ? `+${pts} pts earned` : `Worth ${pts ?? '?'} pts`}
      </Typography>
      {status === 'in_progress' && <Chip size="small" label="In Progress 🔁" />}
      {status === 'eliminated' && <Chip size="small" label="Missed ❌" color="error" />}
      {status === 'scored' && <Chip size="small" label="You're a Wizard Harry 🧙🏼‍♂️✅" color="success" />}
      {status === 'unknown' && <Chip size="small" label="N/A" variant="outlined" />}
    </Box>
  );
};

/**
 * Component for showing player stats in dashboard
 */
const PlayerStatsCard = ({
  playerData,
  leagueData,
  onEditPicks,
  allowEditing = true,
  elevation = 2
}) => {
  const theme = useTheme();

  if (!playerData) return null;

  const canEdit = new Date() < PLAYIN_START_DATE && allowEditing;

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
          src={PLAYER_AVATARS.find(avatar => avatar.id === playerData.playerAvatar)?.src}
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
                {playerData.totalPoints || 0}
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
            {canEdit && onEditPicks && (
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
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrophyIcon sx={{ color: 'gold', mr: 1 }} />
              <Typography variant="body1" fontWeight="medium">
                Championship Pick
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              {playerData.winningTeam &&
                <Avatar
                  src={NBA_TEAMS_WITH_POINTS.find(t => t.name === playerData.winningTeam)?.logo}
                  alt={playerData.winningTeam}
                  sx={{ width: 40, height: 40, mr: 1 }}
                />
              }
              <Chip
                label={playerData.winningTeam || 'Not selected'}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 'medium', fontSize: '0.95rem' }}
              />
            </Box>
            {playerData.winningTeam && (
              <PickStatusBadge
                status={playerData.championshipPickStatus}
                earnedPoints={playerData.championshipTeamPoints}
                lookupPoints={NBA_TEAMS_WITH_POINTS.find(t => t.name === playerData.winningTeam)?.points}
                accentColor="primary"
              />
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
            {canEdit && onEditPicks && (
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
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MvpIcon sx={{ color: 'gold', mr: 1 }} />
              <Typography variant="body1" fontWeight="medium">
                MVP Pick
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              {playerData.mvp &&
                <Avatar
                  src={MVP_CANDIDATES_WITH_POINTS.find(p => p.name === playerData.mvp)?.avatar}
                  alt={playerData.mvp}
                  sx={{ width: 40, height: 40, mr: 1 }}
                />
              }
              <Chip
                label={playerData.mvp || 'Not selected'}
                color="secondary"
                variant="outlined"
                sx={{ fontWeight: 'medium', fontSize: '0.95rem' }}
              />
            </Box>
            {playerData.mvp && (
              <PickStatusBadge
                status={playerData.mvpPickStatus}
                earnedPoints={playerData.mvpPoints}
                lookupPoints={MVP_CANDIDATES_WITH_POINTS.find(p => p.name === playerData.mvp)?.points}
                accentColor="secondary"
              />
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
  allowEditing: PropTypes.bool,
  pointsIcon: PropTypes.node,
  elevation: PropTypes.number
};

export default PlayerStatsCard;

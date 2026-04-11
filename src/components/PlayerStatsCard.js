import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Avatar,
  Chip,
  Divider,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import ScoreBreakdownChart from './ScoreBreakdownChart';
import PickCard from './PickCard';
import PredictionStatsBars from './PredictionStatsBars';
import AvatarPickerGrid from './common/AvatarPickerGrid';
import { PLAYER_AVATARS } from '../shared/GeneralConsts';
import { useTeams } from '../hooks/useTeams';
import { useMvpCandidates } from '../hooks/useMvpCandidates';
import { PLAYIN_START_DATE } from '../shared/SeasonConfig';
import { getPlayerAvatar } from '../shared/playerUtils';

const getTeamLogo = (name) =>
  name ? `/resources/team-logos/${name.toLowerCase().replace(/\s+/g, '-')}.png` : null;

const PlayerStatsCard = ({
  playerData,
  leagueData,
  onEditPicks,
  onEditAvatar,
  allowEditing = true,
  elevation = 2
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { teams } = useTeams();
  const { mvpCandidates } = useMvpCandidates();

  // Avatar edit dialog state
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState(null);

  if (!playerData) return null;

  const matchupPoints = playerData.totalPredictionPoints || 0;
  const bracketPoints = playerData.bracketScore || 0;
  const championshipPoints = playerData.championshipTeamPoints || 0;
  const mvpPoints = playerData.mvpPoints || 0;
  const totalScore = playerData.totalScore || 0;

  const teamLookup = (teams || []).find((team) => team.name === playerData.winningTeam);
  const mvpLookup = (mvpCandidates || []).find((player) => player.name === playerData.mvp);
  const canEdit = new Date() < PLAYIN_START_DATE && allowEditing;
  const playerAvatarSrc = PLAYER_AVATARS.find((avatar) => avatar.id === playerData.playerAvatar)?.src;

  // Avatar can always be changed — not deadline-gated
  const canEditAvatar = Boolean(onEditAvatar) && allowEditing;

  const handleOpenAvatarDialog = () => {
    setPendingAvatar(playerData.playerAvatar ?? null);
    setAvatarDialogOpen(true);
  };

  const handleSaveAvatar = () => {
    if (pendingAvatar && pendingAvatar !== playerData.playerAvatar) {
      onEditAvatar(pendingAvatar);
    }
    setAvatarDialogOpen(false);
  };

  const handleCancelAvatar = () => {
    setPendingAvatar(null);
    setAvatarDialogOpen(false);
  };

  return (
    <Paper
      elevation={elevation}
      sx={{
        p: isMobile ? 2 : 3,
        borderRadius: 2,
        bgcolor: theme.palette.background.paper
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: 1.5,
          mb: 2,
          flexWrap: isMobile ? 'wrap' : 'nowrap'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: '1 1 0', minWidth: 0 }}>
          {/* Avatar with optional edit overlay */}
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            <Avatar
              src={playerAvatarSrc}
              alt={playerData.name}
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 48,
                height: 48,
              }}
            >
              {playerData.name?.charAt(0)}
            </Avatar>

            {canEditAvatar && (
              <Tooltip title="Change avatar" placement="bottom" arrow>
                <IconButton
                  size="small"
                  onClick={handleOpenAvatarDialog}
                  sx={{
                    position: 'absolute',
                    bottom: -4,
                    right: -4,
                    width: 20,
                    height: 20,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <EditIcon sx={{ fontSize: 11 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={700} lineHeight={1.2} noWrap>
              {playerData.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {leagueData?.name ? leagueData.name : 'No League'}
            </Typography>
          </Box>
        </Box>

        {(playerData.leagueRank != null || playerData.globalRank != null) && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 0.75,
              alignItems: 'center',
              justifyContent: isMobile ? 'flex-start' : 'flex-end',
              width: isMobile ? '100%' : 'auto',
              flexShrink: 0
            }}
          >
            {playerData.leagueRank != null && (
              <Tooltip title="League ranking including bot players" enterTouchDelay={0} leaveTouchDelay={1500}>
                <Chip
                  label={`#${playerData.leagueRank} of ${playerData.leagueTotalPlayers} in ${leagueData?.name || 'league'}`}
                  sx={{
                    height: isMobile ? 'auto' : 30,
                    maxWidth: isMobile ? '100%' : 'none',
                    fontSize: isMobile ? '0.75rem' : '0.8125rem',
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                    bgcolor: theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.06)',
                    color: theme.palette.text.primary,
                    border: `1px solid ${
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.12)'
                        : 'rgba(0, 0, 0, 0.10)'
                    }`,
                    '& .MuiChip-label': {
                      px: isMobile ? 1.25 : 1.75,
                      overflow: 'hidden',
                      textOverflow: isMobile ? 'clip' : 'ellipsis',
                      whiteSpace: isMobile ? 'normal' : 'nowrap',
                      display: 'block',
                      py: isMobile ? 0.5 : 0
                    }
                  }}
                />
              </Tooltip>
            )}

            {playerData.globalRank != null && (
              <Tooltip title="Excluding bot players" enterTouchDelay={0} leaveTouchDelay={1500}>
                <Chip
                  label={`#${playerData.globalRank} of ${playerData.totalPlayers} globally`}
                  sx={{
                    height: isMobile ? 'auto' : 30,
                    maxWidth: isMobile ? '100%' : 'none',
                    fontSize: isMobile ? '0.75rem' : '0.8125rem',
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                    bgcolor: `${theme.palette.primary.main}18`,
                    color: theme.palette.primary[theme.palette.mode === 'dark' ? 'light' : 'main'],
                    border: `1px solid ${theme.palette.primary.main}30`,
                    '& .MuiChip-label': {
                      px: isMobile ? 1.25 : 1.75,
                      whiteSpace: isMobile ? 'normal' : 'nowrap',
                      display: 'block',
                      py: isMobile ? 0.5 : 0
                    }
                  }}
                />
              </Tooltip>
            )}
          </Box>
        )}
      </Box>

      <Box sx={{ mb: 2.5 }}>
        <ScoreBreakdownChart
          totalScore={totalScore}
          matchupPoints={matchupPoints}
          bracketPoints={bracketPoints}
          championshipPoints={championshipPoints}
          mvpPoints={mvpPoints}
          championshipPickStatus={playerData.championshipPickStatus}
          mvpPickStatus={playerData.mvpPickStatus}
        />
      </Box>

      <Divider sx={{ mb: 2.5 }} />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <PickCard
            type="championship"
            pickName={playerData.winningTeam}
            pickStatus={playerData.championshipPickStatus}
            earnedPoints={playerData.championshipTeamPoints}
            lookupPoints={teamLookup?.championshipPoints}
            avatarSrc={getTeamLogo(playerData.winningTeam)}
            onEdit={onEditPicks}
            canEdit={canEdit}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <PickCard
            type="mvp"
            pickName={playerData.mvp}
            pickStatus={playerData.mvpPickStatus}
            earnedPoints={playerData.mvpPoints}
            lookupPoints={mvpLookup?.mvpPoints}
            avatarSrc={getPlayerAvatar(playerData.mvp)}
            onEdit={onEditPicks}
            canEdit={canEdit}
          />
        </Grid>
      </Grid>

      <PredictionStatsBars
        matchupStats={{
          hits: playerData.hits,
          bullsEye: playerData.bullsEye,
          misses: playerData.misses,
          points: playerData.matchupPoints
        }}
        bracketStats={playerData.bracketHits ? {
          hits: playerData.bracketHits,
          bullsEye: playerData.bracketBullsEye,
          misses: playerData.bracketMisses,
          points: playerData.bracketPoints
        } : null}
      />

      {/* ── Avatar picker dialog ── */}
      <Dialog
        open={avatarDialogOpen}
        onClose={handleCancelAvatar}
        fullScreen={isMobile}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Change Avatar
          <IconButton onClick={handleCancelAvatar} size="small" edge="end">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={isMobile
          ? { display: 'flex', flexDirection: 'column', p: 0, flex: 1, overflow: 'hidden' }
          : { px: 0, pb: 0 }
        }>
          <AvatarPickerGrid
            value={pendingAvatar}
            onChange={setPendingAvatar}
            fillHeight={isMobile}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          {!isMobile && (
            <Button onClick={handleCancelAvatar} color="inherit">Cancel</Button>
          )}
          <Button
            onClick={handleSaveAvatar}
            variant="contained"
            fullWidth={isMobile}
            disabled={!pendingAvatar || pendingAvatar === playerData.playerAvatar}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PlayerStatsCard;

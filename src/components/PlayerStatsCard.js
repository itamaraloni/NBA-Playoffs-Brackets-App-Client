import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ScoreBreakdownChart from './ScoreBreakdownChart';
import PickCard from './PickCard';
import PredictionStatsBars from './PredictionStatsBars';
import { PLAYER_AVATARS } from '../shared/GeneralConsts';
import { useTeams } from '../hooks/useTeams';
import { useMvpCandidates } from '../hooks/useMvpCandidates';
import { PLAYIN_START_DATE } from '../shared/SeasonConfig';
import { getPlayerAvatar } from '../shared/playerUtils';

/** Derive team logo path from team name (same pattern used across the app) */
const getTeamLogo = (name) =>
  name ? `/resources/team-logos/${name.toLowerCase().replace(/\s+/g, '-')}.png` : null;

/**
 * PlayerStatsCard — sports-analytics dashboard card showing a player's
 * prediction performance, championship/MVP picks, and score breakdown.
 *
 * Used in two contexts:
 *   1. Dashboard page (allowEditing=true) — full width, editable picks
 *   2. PlayerDetailDialog (allowEditing=false) — inside a Dialog, read-only
 *
 * The component is backwards-compatible: new fields like `bracketScore`
 * are optional and gracefully degrade when missing.
 */
const PlayerStatsCard = ({
  playerData,
  leagueData,
  onEditPicks,
  allowEditing = true,
  elevation = 2
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { teams } = useTeams();
  const { mvpCandidates } = useMvpCandidates();

  if (!playerData) return null;

  // --- Data derivation ---
  // Score breakdown pillars for the donut chart
  const matchupPoints = playerData.totalPredictionPoints || 0;
  const bracketPoints = playerData.bracketScore || 0;
  const championshipPoints = playerData.championshipTeamPoints || 0;
  const mvpPoints = playerData.mvpPoints || 0;
  const totalScore = playerData.totalScore || 0;

  // Pick card lookups
  const teamLookup = (teams || []).find(t => t.name === playerData.winningTeam);
  const mvpLookup = (mvpCandidates || []).find(p => p.name === playerData.mvp);
  const canEdit = new Date() < PLAYIN_START_DATE && allowEditing;

  // Avatar resolution
  const playerAvatarSrc = PLAYER_AVATARS.find(a => a.id === playerData.playerAvatar)?.src;

  return (
    <Paper
      elevation={elevation}
      sx={{
        p: isMobile ? 2 : 3,
        borderRadius: 2,
        bgcolor: theme.palette.background.paper
      }}
    >
      {/* ─── Header: Player Identity ─── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Avatar
          src={playerAvatarSrc}
          alt={playerData.name}
          sx={{
            bgcolor: theme.palette.primary.main,
            width: 48,
            height: 48
          }}
        >
          {playerData.name?.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
            {playerData.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {leagueData?.name ? `${leagueData.name}` : 'No League'}
          </Typography>
        </Box>
      </Box>

      {/* ─── Score Breakdown Donut ─── */}
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

      {/* ─── Pick Cards: Championship + MVP ─── */}
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

      {/* ─── Prediction Stats: Matchup/Bracket Toggle + Bars ─── */}
      <PredictionStatsBars
        matchupStats={{
          hits: playerData.hits,
          bullsEye: playerData.bullsEye,
          misses: playerData.misses
        }}
        bracketStats={playerData.bracketHits ? {
          hits: playerData.bracketHits,
          bullsEye: playerData.bracketBullsEye,
          misses: playerData.bracketMisses
        } : null}
      />
    </Paper>
  );
};

export default PlayerStatsCard;

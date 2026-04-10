import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Avatar,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  EmojiEvents as TrophyIcon,
  MilitaryTech as MvpIcon,
  Edit as EditIcon
} from '@mui/icons-material';

/**
 * Visual card for a championship or MVP pick.
 * Shows the pick avatar, name, status badge, and optional edit button.
 *
 * Status treatments:
 *   in_progress → green "Alive" chip, normal avatar
 *   eliminated  → red "Eliminated" chip, grayscale avatar
 *   scored      → gold "+X pts" chip, gold border glow
 *   unknown     → outlined "N/A" chip
 */
const PickCard = ({
  type,           // 'championship' | 'mvp'
  pickName,       // team name or player name (null if not selected)
  pickStatus,     // 'in_progress' | 'eliminated' | 'scored' | 'unknown'
  earnedPoints,   // points already awarded
  lookupPoints,   // what this pick is worth (from teams/mvp lookup)
  avatarSrc,      // team logo or player avatar URL
  onEdit,         // callback when edit clicked (null = no edit)
  canEdit         // whether editing is currently allowed
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const isChampionship = type === 'championship';
  const accentColor = isChampionship ? theme.palette.primary.main : theme.palette.secondary.main;
  const Icon = isChampionship ? TrophyIcon : MvpIcon;

  // Background tints per type — use alpha() so the tint always matches the accent color
  const bgColor = alpha(accentColor, theme.palette.mode === 'dark' ? 0.08 : 0.06);

  // Status-dependent styling
  const isEliminated = pickStatus === 'eliminated';
  const isScored = pickStatus === 'scored';
  const displayPoints = earnedPoints > 0 ? earnedPoints : lookupPoints;

  const renderStatusChip = () => {
    switch (pickStatus) {
      case 'in_progress':
        return (
          <Chip
            size="small"
            label="Alive"
            sx={{
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.25)' : 'rgba(46, 125, 50, 0.12)',
              color: theme.palette.success.main,
              fontWeight: 600,
              border: '1px solid',
              borderColor: theme.palette.success.main
            }}
          />
        );
      case 'eliminated':
        return <Chip size="small" label="Eliminated" color="error" variant="outlined" />;
      case 'scored':
        return (
          <Chip
            size="small"
            label={`+${displayPoints} pts`}
            sx={{
              bgcolor: 'rgba(255, 215, 0, 0.15)',
              color: theme.palette.mode === 'dark' ? '#FFD700' : '#B8860B',
              fontWeight: 700,
              border: '1px solid',
              borderColor: '#FFD700'
            }}
          />
        );
      case 'unknown':
        return <Chip size="small" label="N/A" variant="outlined" />;
      default:
        return null;
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        bgcolor: bgColor,
        borderColor: isScored ? '#FFD700' : accentColor,
        borderWidth: isScored ? 2 : 1,
        borderRadius: 2,
        position: 'relative',
        transition: 'box-shadow 0.2s',
        ...(isScored && {
          boxShadow: `0 0 12px rgba(255, 215, 0, 0.25)`
        }),
        /* Hover-reveal edit button on desktop */
        '& .pick-edit-btn': {
          opacity: isMobile ? 1 : 0,
          transition: 'opacity 0.2s'
        },
        '&:hover .pick-edit-btn': {
          opacity: 1
        }
      }}
    >
      {/* Edit button */}
      {canEdit && onEdit && (
        <IconButton
          className="pick-edit-btn"
          size="small"
          onClick={() => onEdit(type)}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: accentColor,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' }
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      )}

      {/* Header: icon + label */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <Icon sx={{ color: '#FFD700', mr: 0.75, fontSize: 22 }} />
        <Typography variant="body2" fontWeight={600} color="text.secondary">
          {isChampionship ? 'Championship Team' : 'Finals MVP'}
        </Typography>
      </Box>

      {/* Pick display: avatar + name + status */}
      {pickName ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            src={avatarSrc}
            alt={pickName}
            sx={{
              width: 52,
              height: 52,
              ...(isEliminated && {
                filter: 'grayscale(0.8)',
                opacity: 0.6
              })
            }}
          >
            {pickName.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body1"
              fontWeight={600}
              noWrap
              sx={{
                ...(isEliminated && {
                  color: 'text.disabled',
                  textDecoration: 'line-through'
                })
              }}
            >
              {pickName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
              {renderStatusChip()}
              {!isScored && displayPoints != null && (
                <Typography variant="caption" color="text.secondary">
                  Worth {displayPoints} pts
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      ) : (
        <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
          Not selected
        </Typography>
      )}
    </Paper>
  );
};

export default PickCard;

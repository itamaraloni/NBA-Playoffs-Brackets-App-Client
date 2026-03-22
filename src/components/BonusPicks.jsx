import React, { useState } from 'react';
import { Box, Chip, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { getLogoPath } from '../shared/teamUtils';
import { getPlayerAvatar } from '../shared/playerUtils';

/**
 * Small team logo with 3-letter fallback.
 */
function SmallLogo({ name, size = 20 }) {
  const theme = useTheme();
  const [imgError, setImgError] = useState(false);

  if (!name) return null;

  if (!imgError) {
    return (
      <Box
        component="img"
        src={getLogoPath(name)}
        alt={name}
        onError={() => setImgError(true)}
        sx={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, objectFit: 'contain' }}
      />
    );
  }

  return (
    <Box sx={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.375rem', fontWeight: 800, letterSpacing: '-0.3px',
      background: theme.palette.action.selected, color: theme.palette.text.primary,
    }}>
      {name.slice(0, 3).toUpperCase()}
    </Box>
  );
}

/**
 * Avatar for MVP pick — loads player image with initials fallback.
 */
function MvpAvatar({ name }) {
  const theme = useTheme();
  const [imgError, setImgError] = useState(false);

  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()
    : '?';

  if (name && !imgError) {
    return (
      <Box
        component="img"
        src={getPlayerAvatar(name)}
        alt={name}
        onError={() => setImgError(true)}
        sx={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }}
      />
    );
  }

  return (
    <Box sx={{
      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.5625rem', fontWeight: 800,
      background: theme.palette.action.selected, color: theme.palette.text.primary,
    }}>
      {initials}
    </Box>
  );
}

/**
 * Single bonus pick card (Championship or MVP).
 */
function BonusCard({ title, chipLabel, chipColor, name, subText, logo, avatar, icon, bodyBg }) {
  const theme = useTheme();

  return (
    <Box sx={{
      borderRadius: '8px', overflow: 'hidden',
      border: `1px solid ${theme.palette.divider}`,
      background: theme.palette.background.paper,
      boxShadow: theme.shadows[1],
      mb: '6px',
    }}>
      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 1, py: '4px',
        background: theme.palette.action.hover,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}>
        <Typography sx={{
          fontSize: '0.625rem', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: theme.palette.text.secondary,
        }}>
          {title}
        </Typography>
        {chipLabel && (
          <Chip
            size="small"
            variant="outlined"
            label={chipLabel}
            sx={{
              height: 18,
              fontSize: '0.5625rem', fontWeight: 800,
              letterSpacing: '0.04em', textTransform: 'uppercase',
              '& .MuiChip-label': { px: '6px' },
              ...chipColor,
            }}
          />
        )}
      </Box>

      {/* Body */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: '6px',
        px: 1, py: '6px',
        background: bodyBg || 'transparent',
      }}>
        {logo}
        {avatar}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Typography sx={{
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.01em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {name || 'No pick'}
          </Typography>
          {subText && (
            <Typography sx={{
              fontSize: '0.625rem', fontWeight: 500,
              color: theme.palette.text.secondary,
            }}>
              {subText}
            </Typography>
          )}
        </Box>
        {icon}
      </Box>
    </Box>
  );
}

/**
 * BonusPicks — Championship + MVP pick cards shown below Finals.
 *
 * Props:
 *   championshipPick      — team name string (or null)
 *   mvpPick               — player name string (or null)
 *   championshipPickStatus — 'correct' | 'wrong' | 'pending' | null
 *   mvpPickStatus          — 'correct' | 'wrong' | 'pending' | null
 *   mvpPickTeam           — team name for MVP subtitle (optional)
 *   isLocked              — boolean
 */
const BonusPicks = ({
  championshipPick, mvpPick,
  championshipPickStatus, mvpPickStatus,
  mvpPickTeam,
  isLocked,
}) => {
  const theme = useTheme();

  const getStatusConfig = (status) => {
    if (!isLocked || !status) return { chipLabel: null, chipColor: {}, bodyBg: 'transparent', icon: null };

    switch (status) {
      case 'correct':
        return {
          chipLabel: 'Hit',
          chipColor: {
            color: theme.palette.success.main,
            background: alpha(theme.palette.success.main, 0.14),
            borderColor: alpha(theme.palette.success.main, 0.35),
          },
          bodyBg: alpha(theme.palette.success.main, 0.12),
          icon: (
            <Typography component="span" sx={{
              fontSize: '0.6875rem', color: theme.palette.success.light,
              width: 14, textAlign: 'center', lineHeight: 1, flexShrink: 0,
            }}>
              {'\u2713'}
            </Typography>
          ),
        };
      case 'wrong':
        return {
          chipLabel: 'Miss',
          chipColor: {
            color: theme.palette.error.main,
            background: alpha(theme.palette.error.main, 0.14),
            borderColor: alpha(theme.palette.error.main, 0.35),
          },
          bodyBg: alpha(theme.palette.error.main, 0.12),
          icon: (
            <Typography component="span" sx={{
              fontSize: '0.6875rem', color: theme.palette.error.light,
              width: 14, textAlign: 'center', lineHeight: 1, flexShrink: 0,
            }}>
              {'\u2717'}
            </Typography>
          ),
        };
      case 'pending':
      default:
        return {
          chipLabel: 'Pending',
          chipColor: {
            color: theme.palette.warning.main,
            background: alpha(theme.palette.warning.main, 0.14),
            borderColor: alpha(theme.palette.warning.main, 0.35),
          },
          bodyBg: 'transparent',
          icon: null,
        };
    }
  };

  const champConfig = getStatusConfig(championshipPickStatus);
  const mvpConfig = getStatusConfig(mvpPickStatus);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', mt: '6px' }}>
      {/* Bonus Picks divider */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: '4px' }}>
        <Box sx={{ flex: 1, height: '1px', background: alpha(theme.palette.warning.main, 0.18) }} />
        <Typography sx={{
          fontSize: '0.625rem', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.12em',
          color: theme.palette.warning.main, opacity: 0.7,
        }}>
          Bonus Picks
        </Typography>
        <Box sx={{ flex: 1, height: '1px', background: alpha(theme.palette.warning.main, 0.18) }} />
      </Box>

      {/* Championship Pick */}
      <BonusCard
        title="Championship Pick"
        chipLabel={champConfig.chipLabel}
        chipColor={champConfig.chipColor}
        name={championshipPick}
        logo={championshipPick ? <SmallLogo name={championshipPick} /> : null}
        icon={champConfig.icon}
        bodyBg={champConfig.bodyBg}
      />

      {/* MVP Pick */}
      <BonusCard
        title="Finals MVP"
        chipLabel={mvpConfig.chipLabel}
        chipColor={mvpConfig.chipColor}
        name={mvpPick}
        subText={mvpPickTeam}
        avatar={mvpPick ? <MvpAvatar name={mvpPick} /> : null}
        icon={mvpConfig.icon}
        bodyBg={mvpConfig.bodyBg}
      />
    </Box>
  );
};

export default BonusPicks;

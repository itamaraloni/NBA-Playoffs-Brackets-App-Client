import React, { useRef, useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  EmojiEvents as EmojiEventsIcon,
  MusicNote as MusicNoteIcon,
  Public as PublicIcon,
  SportsBasketball as SportsBasketballIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { PLAYER_AVATARS, PLAYER_AVATAR_GROUPS } from '../../shared/GeneralConsts';

// Maps group id → tab icon. Add an entry here when adding a new group.
const GROUP_ICONS = {
  ballers:     <SportsBasketballIcon fontSize="small" />,
  goats:       <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                 <span style={{ fontSize: '0.85rem', lineHeight: 1 }}>🐐</span>
                 <EmojiEventsIcon fontSize="small" />
               </Box>,
  music:       <MusicNoteIcon fontSize="small" />,
  politicians: <PublicIcon fontSize="small" />,
  others:      <StarIcon fontSize="small" />,
};

// Build a lookup map once at module load so the grid doesn't scan the array per render.
const AVATAR_MAP = Object.fromEntries(PLAYER_AVATARS.map(a => [a.id, a]));

/**
 * AvatarPickerGrid — emoji-picker style avatar selector.
 *
 * Props:
 *   value      {string|null}  — currently selected avatar id
 *   onChange   {function}     — called with the new avatar id when the user clicks one
 *   fillHeight {boolean}      — when true, the scroll area grows to fill its container
 *                               (use inside a fullscreen dialog where height is available)
 */
const AvatarPickerGrid = ({ value, onChange, fillHeight = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const scrollerRef = useRef(null);
  // One ref per group section so we can jump to it on tab click.
  const groupRefs = useRef([]);

  // Mobile tap-label: briefly show the avatar name after tapping
  const [flashId, setFlashId] = useState(null);
  const flashTimeoutRef = useRef(null);

  const handleTabChange = (_, idx) => {
    setActiveTab(idx);
    const section = groupRefs.current[idx];
    if (section && scrollerRef.current) {
      // offsetTop is relative to the scrollable container since the section
      // is a direct child of it — no need to calculate nested offsets.
      scrollerRef.current.scrollTop = section.offsetTop;
    }
  };

  const handleAvatarClick = (id) => {
    onChange(id);
    if (isMobile) {
      // Show the avatar label briefly after tapping
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      setFlashId(id);
      flashTimeoutRef.current = setTimeout(() => setFlashId(null), 1500);
    }
  };

  const selectedBg =
    theme.palette.mode === 'dark'
      ? 'rgba(66, 66, 66, 0.6)'
      : 'rgba(224, 242, 254, 0.6)';

  return (
    <Box sx={fillHeight ? { display: 'flex', flexDirection: 'column', height: '100%' } : {}}>
      {/* ── Category tabs ── */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{
          minHeight: 40,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': { minHeight: 40, py: 0.5 },
        }}
      >
        {PLAYER_AVATAR_GROUPS.map((group, idx) => (
          <Tab
            key={group.id}
            icon={GROUP_ICONS[group.id] ?? <StarIcon fontSize="small" />}
            iconPosition="start"
            label={group.label}
            sx={{ fontSize: '0.75rem', gap: 0.5, minWidth: 0, textTransform: 'none' }}
            aria-label={group.label}
          />
        ))}
      </Tabs>

      {/* ── Scrollable avatar area ── */}
      <Box
        ref={scrollerRef}
        sx={{
          // fillHeight: grow to fill the flex parent (fullscreen dialog context)
          // default: fixed cap so it doesn't blow out an inline or small-dialog layout
          ...(fillHeight ? { flex: 1 } : { maxHeight: 240 }),
          overflowY: 'auto',
          // Thin scrollbar so it doesn't eat into the grid width
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: 2,
            bgcolor: 'action.disabled',
          },
        }}
      >
        {PLAYER_AVATAR_GROUPS.map((group, idx) => (
          <Box
            key={group.id}
            ref={el => { groupRefs.current[idx] = el; }}
          >
            {/* Sticky group label */}
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                zIndex: 1,
                px: 1.5,
                py: 0.5,
                bgcolor: theme.palette.background.paper,
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box
                component="span"
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: 'text.secondary',
                }}
              >
                {group.label}
              </Box>
            </Box>

            {/* Avatar grid */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                p: 1.5,
              }}
            >
              {group.avatarIds.map(id => {
                const avatar = AVATAR_MAP[id];
                if (!avatar) return null;
                const isSelected = value === id;

                return (
                  <Tooltip
                    key={id}
                    title={avatar.alt}
                    placement="top"
                    arrow
                    // Desktop: show on hover after a short delay
                    // Mobile: show briefly after tap (controlled), hover disabled
                    {...(isMobile
                      ? {
                          open: flashId === id,
                          disableHoverListener: true,
                          disableFocusListener: true,
                          disableTouchListener: true,
                        }
                      : { enterDelay: 400 }
                    )}
                  >
                    <Box
                      onClick={() => handleAvatarClick(id)}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: '50%',
                        border: '2px solid',
                        borderColor: isSelected
                          ? 'primary.main'
                          : 'transparent',
                        bgcolor: isSelected ? selectedBg : 'transparent',
                        p: '2px',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          borderColor: isSelected
                            ? 'primary.main'
                            : 'action.disabled',
                          bgcolor: isSelected ? selectedBg : 'action.hover',
                          transform: 'scale(1.08)',
                        },
                      }}
                    >
                      <Avatar
                        src={avatar.src}
                        alt={avatar.alt}
                        sx={{ width: 52, height: 52, pointerEvents: 'none' }}
                      />
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default AvatarPickerGrid;

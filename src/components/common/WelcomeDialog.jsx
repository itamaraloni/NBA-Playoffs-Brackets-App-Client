import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as ContentCopyIcon,
  EmojiEvents as EmojiEventsIcon,
  GroupAdd as GroupAddIcon,
  SportsBasketball as SportsBasketballIcon
} from '@mui/icons-material';
import { PLAYER_AVATARS } from '../../shared/GeneralConsts';
import { useAuth } from '../../contexts/AuthContext';
import { formatDeadline, GuidanceRow, HeaderLogoPlaceholder } from './welcomeDialogHelpers';

const copyTextToClipboard = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textField = document.createElement('textarea');
  textField.value = text;
  textField.setAttribute('readonly', '');
  textField.style.position = 'absolute';
  textField.style.left = '-9999px';
  document.body.appendChild(textField);
  textField.select();
  document.execCommand('copy');
  document.body.removeChild(textField);
};

const WelcomeDialog = ({
  open,
  onClose,
  playerName,
  avatarId,
  leagueName,
  isCommissioner,
  inviteToken
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { activePlayer } = useAuth();

  const avatar = PLAYER_AVATARS.find((option) => String(option.id) === String(avatarId));
  const resolvedLeagueName = leagueName || activePlayer?.league_name || 'your league';
  const inviteUrl = inviteToken ? `${window.location.origin}/invite/${inviteToken}` : null;
  const deadlineText = formatDeadline();
  const titleText = isCommissioner
    ? `${playerName}, you just created the ${resolvedLeagueName} league.`
    : `${playerName}, you are in ${resolvedLeagueName}.`;
  const introText = isCommissioner
    ? `Your league is ready. Share the invite link, keep an eye on membership from League page, and make sure your own bracket is submitted before ${deadlineText}.`
    : `Your player profile is ready. Next, submit your bracket before ${deadlineText} and fill in live picks before each series becomes active.`;

  const handleCopyInvite = async () => {
    if (!inviteUrl) {
      return;
    }

    try {
      await copyTextToClipboard(inviteUrl);
      if (window.notify) {
        window.notify.success('Invite link copied to clipboard.');
      }
    } catch (error) {
      console.error('Failed to copy invite link:', error);
      if (window.notify) {
        window.notify.error('Failed to copy invite link.');
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => onClose('/dashboard')}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: theme.palette.mode === 'dark'
            ? 'rgba(255, 193, 7, 0.10)'
            : 'rgba(255, 243, 224, 0.95)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <EmojiEventsIcon sx={{ color: 'warning.main' }} />
          <Typography variant="h6" component="span">You&apos;re in.</Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <HeaderLogoPlaceholder />
          <IconButton edge="end" color="inherit" onClick={() => onClose('/dashboard')} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: 3 }}>
          <Avatar
            src={avatar?.src}
            alt={avatar?.alt || playerName}
            sx={{ width: 80, height: 80, mb: 2, boxShadow: 3 }}
          >
            {playerName?.charAt(0)?.toUpperCase()}
          </Avatar>

          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {titleText}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {introText}
          </Typography>
        </Box>

        <Stack spacing={1.5} sx={{ mb: 3 }}>
          <GuidanceRow
            icon={<EmojiEventsIcon fontSize="small" />}
            title="Submit your bracket"
            body={`Lock in your playoff path before ${deadlineText}.`}
            pageLabel="Bracket"
          />
          <GuidanceRow
            icon={<SportsBasketballIcon fontSize="small" />}
            title="Fill in live picks"
            body="Set your live picks before each matchup becomes active so you do not miss scoring opportunities."
            pageLabel="Live Picks"
          />
          <GuidanceRow
            icon={<GroupAddIcon fontSize="small" />}
            title="Create or join another league"
            body="Use your profile area to join another league from an invitation link or start a league of your own."
            pageLabel="Profile"
          />
        </Stack>

        {isCommissioner && inviteUrl && (
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <GroupAddIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Invite your league
              </Typography>
            </Box>

            <Typography
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: 'action.hover',
                mb: 1.5
              }}
            >
              {inviteUrl}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1, minWidth: 240 }}>
                From League page you can copy this link again, regenerate the token if it leaks or gets shared too widely, and invalidate older invite links when you need tighter control.
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyInvite}
              >
                Copy
              </Button>
            </Box>
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center' }}>
        <Button
          fullWidth={fullScreen}
          variant="contained"
          onClick={() => onClose('/dashboard')}
          sx={{ minWidth: fullScreen ? '100%' : 220 }}
        >
          Go Explore App
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WelcomeDialog;

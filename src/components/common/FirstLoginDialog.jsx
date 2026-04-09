import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  EmojiEvents as EmojiEventsIcon,
  Groups as GroupsIcon,
  Insights as InsightsIcon,
  SportsBasketball as SportsBasketballIcon
} from '@mui/icons-material';
import { formatDeadline, GuidanceRow, HeaderLogoPlaceholder } from './welcomeDialogHelpers';

const FirstLoginDialog = ({ open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const deadlineText = formatDeadline();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: theme.palette.mode === 'dark'
            ? 'rgba(25, 118, 210, 0.10)'
            : 'rgba(232, 244, 253, 0.95)'
        }}
      >
        <Typography variant="h6" component="span">Welcome to Playoff Prophet</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <HeaderLogoPlaceholder />
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5 }}>
          Start with the core pages that matter most so you can join a league, submit your bracket, and keep your predictions current as the playoffs unfold.
        </Typography>

        <Stack spacing={1.5}>
          <GuidanceRow
            icon={<GroupsIcon fontSize="small" />}
            title="Create or join a league"
            body="Use your profile area to start a league of your own or join one from an invite link."
            pageLabel="Profile"
          />
          <GuidanceRow
            icon={<EmojiEventsIcon fontSize="small" />}
            title="Submit your bracket"
            body={`Lock in your full playoff bracket before ${deadlineText}.`}
            pageLabel="Bracket"
          />
          <GuidanceRow
            icon={<SportsBasketballIcon fontSize="small" />}
            title="Complete live picks"
            body="Visit Live Picks page early and lock in each live pick before a series becomes active, otherwise you lose that pick window."
            pageLabel="Live Picks"
          />
          <GuidanceRow
            icon={<InsightsIcon fontSize="small" />}
            title="Track scores and standings"
            body="Use the app to follow league rankings, results, and how each finished series affects your score."
            pageLabel="Dashboard"
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center' }}>
        <Button
          fullWidth={fullScreen}
          variant="contained"
          onClick={onClose}
          sx={{ minWidth: fullScreen ? '100%' : 220 }}
        >
          Go Explore App
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FirstLoginDialog;

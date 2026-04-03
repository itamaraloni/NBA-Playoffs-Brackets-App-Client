import React from 'react';
import PropTypes from 'prop-types';
import {
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
  EmojiEvents as EmojiEventsIcon,
  Groups as GroupsIcon,
  Insights as InsightsIcon,
  SportsBasketball as SportsBasketballIcon
} from '@mui/icons-material';
import { PLAYIN_START_DATE } from '../../shared/SeasonConfig';

const LOGO_PLACEHOLDER_SIZE = 44;

const formatDeadline = () => PLAYIN_START_DATE.toLocaleString('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
});

const HeaderLogoPlaceholder = () => (
  <Box
    sx={{
      width: LOGO_PLACEHOLDER_SIZE,
      height: LOGO_PLACEHOLDER_SIZE,
      borderRadius: 1.5,
      border: '1px dashed',
      borderColor: 'divider',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.paper',
      color: 'text.secondary',
      fontSize: '0.6rem',
      fontWeight: 700,
      letterSpacing: '0.04em',
      flexShrink: 0
    }}
  >
    LOGO
  </Box>
);

const GuidanceRow = ({ icon, title, body, pageLabel }) => (
  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
      <Box sx={{ color: 'primary.main', mt: 0.25 }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {body}
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, whiteSpace: 'nowrap' }}>
        {pageLabel}
      </Typography>
    </Box>
  </Paper>
);

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
        <Typography variant="h6">Welcome to Playoff Prophet</Typography>
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
            title="Complete matchup predictions"
            body="Visit Predictions page early and fill in each series before it becomes active, otherwise you lose that pick window."
            pageLabel="Predictions"
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

FirstLoginDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default FirstLoginDialog;

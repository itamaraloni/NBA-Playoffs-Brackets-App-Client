import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { PLAYIN_START_DATE } from '../../shared/SeasonConfig';

export const LOGO_PLACEHOLDER_SIZE = 44;

export const formatDeadline = () => PLAYIN_START_DATE.toLocaleString('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
});

export const HeaderLogoPlaceholder = () => (
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

export const GuidanceRow = ({ icon, title, body, pageLabel }) => (
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

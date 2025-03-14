import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4 as DarkIcon, Brightness7 as LightIcon } from '@mui/icons-material';
import { useAppTheme } from './ThemeProvider';

const ThemeToggle = ({ sx }) => {
  const { mode, toggleTheme } = useAppTheme();

  return (
    <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
      <IconButton 
        onClick={toggleTheme} 
        color="inherit" 
        aria-label="toggle theme"
        size="large"
        sx={{ 
          ml: 1,
          ...sx 
        }}
      >
        {mode === 'light' ? <DarkIcon /> : <LightIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
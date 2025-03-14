import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useTheme
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Logout as LogoutIcon } from '@mui/icons-material';
import ThemeToggle from '../theme/ThemeToggle';

const StandaloneHeader = ({ title, onLogout, showLogout = true }) => {
  const theme = useTheme();

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title || 'NBA Playoffs Predictor'}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ThemeToggle />
          
          <Button 
            component={Link} 
            to="/dashboard" 
            variant="contained" 
            color="primary"
            sx={{ ml: 1 }}
          >
            Home
          </Button>

          {showLogout && (
            <Button
              color="error"
              startIcon={<LogoutIcon />}
              onClick={onLogout}
              sx={{ ml: 2 }}
            >
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default StandaloneHeader;
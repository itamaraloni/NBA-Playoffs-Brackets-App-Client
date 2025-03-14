import React, { useState } from 'react';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  Divider,
  Container,
  useMediaQuery,
  useTheme,
  Tooltip
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Home as DashboardIcon,
  Group as MyLeagueIcon,
  Whatshot as PredictionsIcon,
  AccountCircle as ProfileIcon,
  Close as CloseIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from '../theme/ThemeToggle';

const DRAWER_WIDTH = 240;

const Layout = ({ children, onLogout }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navigationItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'My League', icon: <MyLeagueIcon />, path: '/league' },
    { text: 'Predictions', icon: <PredictionsIcon />, path: '/predictions' },
    { text: 'Profile', icon: <ProfileIcon />, path: '/profile' },
  ];

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          NBA Playoffs
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Divider />
      
      {/* Navigation items */}
      <List sx={{ flexGrow: 1 }}>
        {navigationItems.map((item) => (
          <Tooltip 
            key={item.text}
            title={item.text} 
            placement="right"
            disableHoverListener={!isMobile}
          >
            <ListItem 
              button 
              component={Link} 
              to={item.path}
              selected={location.pathname === item.path}
              onClick={isMobile ? handleDrawerToggle : undefined}
              sx={{
                minHeight: 48,
                px: 2.5,
                '&.Mui-selected': {
                  backgroundColor: `${theme.palette.primary.main}15`,
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  '&:hover': {
                    backgroundColor: `${theme.palette.primary.main}25`,
                  }
                }
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 0, 
                mr: 3,
                color: location.pathname === item.path ? 
                  theme.palette.primary.main : 
                  theme.palette.text.secondary
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontSize: '0.95rem',
                  fontWeight: location.pathname === item.path ? '500' : '400'
                }}
              />
            </ListItem>
          </Tooltip>
        ))}
      </List>
      
      {/* Logout button at bottom */}
      <Divider />
      <List>
        <ListItem 
          button 
          onClick={onLogout}
          sx={{
            minHeight: 48,
            px: 2.5,
            my: 1,
            '&:hover': {
              backgroundColor: `${theme.palette.error.main}15`,
            }
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: 0, 
            mr: 3,
            color: theme.palette.error.main
          }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Logout" 
            primaryTypographyProps={{ 
              fontSize: '0.95rem',
            }}
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        color="default"
        elevation={1}
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div"
            sx={{ flexGrow: 1 }}
          >
            NBA Playoffs Predictor
          </Typography>
          <ThemeToggle />
        </Toolbar>
      </AppBar>
      
      {/* Drawer for desktop - permanent */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
      
      {/* Drawer for mobile - temporary */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawer}
      </Drawer>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          backgroundColor: (theme) => theme.palette.background.default
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        <Container maxWidth="lg" sx={{ mb: 4 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
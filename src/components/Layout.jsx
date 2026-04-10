import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
  Tooltip
} from '@mui/material';
import {
  Home as DashboardIcon,
  Group as MyLeagueIcon,
  Whatshot as LivePicksIcon,
  AccountCircle as ProfileIcon,
  Close as CloseIcon,
  Logout as LogoutIcon,
  AccountTree as BracketIcon,
  AdminPanelSettings as AdminIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from '../theme/ThemeToggle';
import LeagueSwitcher from './LeagueSwitcher';
import { useAuth } from '../contexts/AuthContext';

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_COLLAPSED = 64;

const Layout = ({ children, onLogout }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });
  const location = useLocation();
  const { isAdmin } = useAuth();

  const drawerWidth = sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  const handleCollapseToggle = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navigationItems = [
    { text: 'Dashboard',   icon: <DashboardIcon />,   path: '/dashboard'   },
    { text: 'Live Picks',  icon: <LivePicksIcon />, path: '/predictions' },
    { text: 'Bracket',     icon: <BracketIcon />,     path: '/bracket'     },
    { text: 'My League',   icon: <MyLeagueIcon />,    path: '/league'      },
    ...(isAdmin ? [{ text: 'Admin', icon: <AdminIcon />, path: '/admin' }] : []),
    { text: 'Profile',     icon: <ProfileIcon />,     path: '/profile'     },
  ];

  // Desktop collapsed state — on mobile the drawer is always full-width
  const isCollapsed = !isMobile && sidebarCollapsed;
  const appBarToolbarSx = {
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto auto',
    alignItems: 'center',
    columnGap: { xs: 0.5, md: 1 },
    minHeight: 64,
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Box sx={{
        display: 'flex',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        alignItems: 'center',
        p: isCollapsed ? 1 : 2,
        minHeight: 56,
      }}>
        {!isCollapsed && (
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            NBA Playoffs
          </Typography>
        )}
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
            disableHoverListener={!isCollapsed}
          >
            <ListItem
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={isMobile ? handleDrawerToggle : undefined}
              sx={{
                minHeight: 48,
                px: isCollapsed ? 0 : 2.5,
                justifyContent: isCollapsed ? 'center' : 'flex-start',
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
                mr: isCollapsed ? 0 : 3,
                justifyContent: 'center',
                color: location.pathname === item.path ?
                  theme.palette.primary.main :
                  theme.palette.text.secondary
              }}>
                {item.icon}
              </ListItemIcon>
              {!isCollapsed && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: location.pathname === item.path ? '500' : '400'
                  }}
                />
              )}
            </ListItem>
          </Tooltip>
        ))}
      </List>

      {/* Collapse toggle — desktop only */}
      {!isMobile && (
        <>
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
            <Tooltip title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
              <IconButton onClick={handleCollapseToggle} size="small">
                {sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </>
      )}

      {/* Logout button at bottom */}
      <Divider />
      <List>
        {isCollapsed ? (
          <Tooltip title="Logout" placement="right">
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <IconButton onClick={onLogout} color="error" size="small">
                <LogoutIcon />
              </IconButton>
            </Box>
          </Tooltip>
        ) : (
          <Button
            onClick={onLogout}
            fullWidth
            color="error"
            startIcon={<LogoutIcon />}
          >
            Logout
          </Button>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* OPTION A POC — subtle blurred background image across all pages */}
      <Box
        component="img"
        src="/og-image-clean.png"
        aria-hidden="true"
        sx={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          objectPosition: '62% center',
          zIndex: -1,
          pointerEvents: 'none',
          opacity: 0.18,
          filter: 'blur(10px)',
          transform: 'scale(1.05)', // prevent blur edges from showing
        }}
      />

      <AppBar
        position="fixed"
        color="default"
        elevation={1}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >

        <Toolbar sx={appBarToolbarSx}>
          {/* Mobile: logo image acts as the drawer toggle; desktop: hidden (no hamburger needed) */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { md: 'none' }, gridColumn: { xs: 1, md: 1 }, p: 0.5 }}
          >
            <Box
              component="img"
              src="/head-logo.png"
              alt="Playoff Prophet"
              sx={{ width: 36, height: 36, borderRadius: '50%', display: 'block' }}
            />
          </IconButton>
          <Box
            sx={{ minWidth: 0, gridColumn: { xs: 2, md: 2 }, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            {/* Logo only shown on desktop — on mobile it's already the menu trigger above */}
            <Box
              component="img"
              src="/head-logo.png"
              alt="Playoff Prophet logo"
              sx={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: { xs: 'none', md: 'block' } }}
            />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              Playoff Prophet
            </Typography>
          </Box>
          <Box
            sx={{
              minWidth: 0,
              gridColumn: { xs: 3, md: 3 },
              display: 'flex',
              alignItems: 'center',
              justifySelf: 'end',
            }}
          >
            <LeagueSwitcher />
          </Box>
          <Box
            sx={{
              gridColumn: { xs: 4, md: 4 },
              display: 'flex',
              alignItems: 'center',
              justifySelf: 'end',
            }}
          >
            <ThemeToggle />
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Drawer for desktop - permanent */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
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
          minWidth: location.pathname === '/bracket' ? 0 : undefined,
          overflowX: 'hidden',
          pt: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          minHeight: '100vh',
          backgroundColor: 'transparent'
        }}
      >
        <Toolbar sx={{ minHeight: 64 }} /> {/* Spacer for fixed AppBar */}
        {location.pathname === '/bracket' ? (
          <Box sx={{ px: { xs: 0, md: 3 }, mb: { xs: 0, md: 4 } }}>
            {children}
          </Box>
        ) : (
          <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 }, mb: 4 }}>
            {children}
          </Container>
        )}
      </Box>
    </Box>
  );
};

export default Layout;

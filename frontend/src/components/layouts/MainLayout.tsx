import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Divider,
  useMediaQuery,
  Container,
  Tooltip
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { 
  Menu as MenuIcon, 
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Public as PublicIcon,
  Campaign as CampaignIcon,
  Event as EventIcon,
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
  AccountTree as AccountTreeIcon,
  Mic as MicIcon,
  Psychology as PsychologyIcon,
  Settings as SettingsIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon
} from '@mui/icons-material';
import { useTheme } from '../../theme';

// Drawer width
const DRAWER_WIDTH = 240;

const MainLayout: React.FC = () => {
  // Get theme and theme toggle function
  const { mode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  
  // State for drawer open/closed
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Check if screen is mobile size
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  // Toggle drawer
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  // Close drawer when clicking a link on mobile
  const handleNavClick = () => {
    if (isMobile) {
      setDrawerOpen(false);
    }
  };
  
  // Navigation items
  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'RPG Worlds', icon: <PublicIcon />, path: '/rpg-worlds' },
    { text: 'Campaigns', icon: <CampaignIcon />, path: '/campaigns' },
    { text: 'Sessions', icon: <EventIcon />, path: '/sessions' },
    { text: 'Characters', icon: <PersonIcon />, path: '/characters' },
    { text: 'Locations', icon: <LocationOnIcon />, path: '/locations' },
    { text: 'Mind Map', icon: <AccountTreeIcon />, path: '/mind-map' },
    { text: 'Transcription', icon: <MicIcon />, path: '/transcription' },
    { text: 'Brain', icon: <PsychologyIcon />, path: '/brain' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];
  
  // Drawer content
  const drawerContent = (
    <>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-end', 
        px: [1]
      }}>
        <Typography variant= h6 noWrap component=div sx={{ flexGrow: 1 }}>
          RPG Archivist
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={handleNavClick}
            component=a 
            href={item.path}
            sx={{ 
              borderRadius: 1,
              m: 0.5,
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar 
        position=fixed 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: (theme) => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(drawerOpen && !isMobile && {
            marginLeft: DRAWER_WIDTH,
            width: calc(100% - px),
            transition: (theme) => theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color=inherit
            aria-label=open drawer
            edge=start
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant=h6 noWrap component=div sx={{ flexGrow: 1 }}>
            RPG Archivist
          </Typography>
          <Tooltip title={Switch to  mode}>
            <IconButton color=inherit onClick={toggleTheme}>
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      
      {/* Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
      
      {/* Main content */}
      <Box
        component=main
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: calc(100% - px) },
          transition: (theme) => theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(drawerOpen && !isMobile && {
            marginLeft: ${DRAWER_WIDTH}px,
            transition: (theme) => theme.transitions.create('margin', {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <Container maxWidth=xl sx={{ mt: 2 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;

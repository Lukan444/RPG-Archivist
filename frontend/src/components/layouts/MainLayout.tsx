import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Container,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Public as WorldIcon,
  Campaign as CampaignIcon,
  Event as SessionIcon,
  Person as CharacterIcon,
  LocationOn as LocationIcon,
  Inventory as ItemIcon,
  Timeline as TimelineIcon,
  Psychology as BrainIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle as ProfileIcon,
  AccountTree as MindMapIcon,
  RateReview as ProposalIcon,
  Chat as StorytellingIcon,
  Analytics as ContentAnalysisIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { logout, user } = useAuth();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          RPG Archivist
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem button component={Link} to="/dashboard" selected={isActive('/dashboard')}>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/rpg-worlds" selected={isActive('/rpg-worlds')}>
          <ListItemIcon>
            <WorldIcon />
          </ListItemIcon>
          <ListItemText primary="Worlds" />
        </ListItem>
        <ListItem button component={Link} to="/campaigns" selected={isActive('/campaigns')}>
          <ListItemIcon>
            <CampaignIcon />
          </ListItemIcon>
          <ListItemText primary="Campaigns" />
        </ListItem>
        <ListItem button component={Link} to="/sessions" selected={isActive('/sessions')}>
          <ListItemIcon>
            <SessionIcon />
          </ListItemIcon>
          <ListItemText primary="Sessions" />
        </ListItem>
        <ListItem button component={Link} to="/characters" selected={isActive('/characters')}>
          <ListItemIcon>
            <CharacterIcon />
          </ListItemIcon>
          <ListItemText primary="Characters" />
        </ListItem>
        <ListItem button component={Link} to="/locations" selected={isActive('/locations')}>
          <ListItemIcon>
            <LocationIcon />
          </ListItemIcon>
          <ListItemText primary="Locations" />
        </ListItem>
        <ListItem button component={Link} to="/events" selected={isActive('/events')}>
          <ListItemIcon>
            <ItemIcon />
          </ListItemIcon>
          <ListItemText primary="Events" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button component={Link} to="/timeline" selected={isActive('/timeline')}>
          <ListItemIcon>
            <TimelineIcon />
          </ListItemIcon>
          <ListItemText primary="Timeline" />
        </ListItem>
        <ListItem button component={Link} to="/mind-map" selected={isActive('/mind-map')}>
          <ListItemIcon>
            <MindMapIcon />
          </ListItemIcon>
          <ListItemText primary="Mind Map" />
        </ListItem>
        <ListItem button component={Link} to="/brain" selected={isActive('/brain')}>
          <ListItemIcon>
            <BrainIcon />
          </ListItemIcon>
          <ListItemText primary="Brain" />
        </ListItem>
        <ListItem button component={Link} to="/storytelling" selected={isActive('/storytelling')}>
          <ListItemIcon>
            <StorytellingIcon />
          </ListItemIcon>
          <ListItemText primary="Storytelling" />
        </ListItem>
        <ListItem button component={Link} to="/content-analysis" selected={isActive('/content-analysis')}>
          <ListItemIcon>
            <ContentAnalysisIcon />
          </ListItemIcon>
          <ListItemText primary="Content Analysis" />
        </ListItem>
        <ListItem button component={Link} to="/proposals" selected={isActive('/proposals')}>
          <ListItemIcon>
            <ProposalIcon />
          </ListItemIcon>
          <ListItemText primary="Proposals" />
        </ListItem>
        <ListItem button component={Link} to="/search" selected={isActive('/search')}>
          <ListItemIcon>
            <SearchIcon />
          </ListItemIcon>
          <ListItemText primary="Search" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
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
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            RPG Archivist
          </Typography>
          <Tooltip title="Account">
            <IconButton
              onClick={handleMenuOpen}
              size="large"
              edge="end"
              color="inherit"
            >
              <Avatar
                alt={user?.name || 'User'}
                src={user?.avatar || ''}
                sx={{ width: 32, height: 32 }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
              <ListItemIcon>
                <ProfileIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem component={Link} to="/settings" onClick={handleMenuClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ mt: 2 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
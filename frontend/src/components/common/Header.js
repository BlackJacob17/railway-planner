import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Badge, 
  Box, 
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Notifications as NotificationsIcon, 
  Logout,
  Settings,
  Person,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useNotification from '../../hooks/useNotification';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  boxShadow: '0 1px 4px 0 rgba(0,0,0,0.12)',
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
}));

const Header = ({ onMenuClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showSuccess } = useNotification();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = React.useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      showSuccess('Successfully logged out');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleMenuClose();
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    handleMenuClose();
  };

  const isMenuOpen = Boolean(anchorEl);
  const isNotificationsOpen = Boolean(notificationsAnchorEl);

  const menuId = 'primary-search-account-menu';
  const notificationsId = 'primary-search-notifications-menu';

  const renderNotifications = (
    <Menu
      anchorEl={notificationsAnchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      id={notificationsId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isNotificationsOpen}
      onClose={handleNotificationsClose}
    >
      <Box sx={{ width: 360, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Notifications</Typography>
          <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
            Mark all as read
          </Typography>
        </Box>
        <Divider />
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              No new notifications
            </Typography>
          </Box>
        </Box>
      </Box>
    </Menu>
  );

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleProfileClick}>
        <ListItemIcon>
          <Person fontSize="small" />
        </ListItemIcon>
        Profile
      </MenuItem>
      <MenuItem onClick={handleSettingsClick}>
        <ListItemIcon>
          <Settings fontSize="small" />
        </ListItemIcon>
        Settings
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <Logout fontSize="small" />
        </ListItemIcon>
        Logout
      </MenuItem>
    </Menu>
  );

  return (
    <>
      <StyledAppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.9,
              },
            }}
            onClick={() => navigate('/')}
          >
            <Box 
              component="span" 
              sx={{ 
                backgroundColor: 'primary.main', 
                color: '#fff',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                mr: 1
              }}
            >
              Railway
            </Box>
            Planner
          </Typography>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              size="large"
              aria-label="toggle theme"
              color="inherit"
              onClick={() => {}}
              sx={{ mr: 1 }}
            >
              {theme.palette.mode === 'dark' ? (
                <LightModeIcon />
              ) : (
                <DarkModeIcon />
              )}
            </IconButton>
            
            <Tooltip title="Notifications">
              <IconButton
                size="large"
                aria-label="show new notifications"
                color="inherit"
                onClick={handleNotificationsOpen}
                sx={{ mr: 1 }}
              >
                <Badge badgeContent={0} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'pointer',
                p: 0.5,
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
              onClick={handleProfileMenuOpen}
            >
              <Avatar 
                alt={user?.name || 'User'}
                src={user?.avatar}
                sx={{ width: 36, height: 36, mr: 1 }}
              >
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </Avatar>
              {!isMobile && (
                <Box>
                  <Typography variant="subtitle2" noWrap>
                    {user?.name || 'User'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" noWrap>
                    {user?.role || 'User'}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Toolbar>
      </StyledAppBar>
      {renderMenu}
      {renderNotifications}
    </>
  );
};

export default Header;

import React, { useState, useEffect } from 'react';
import { 
  Drawer, 
  List, 
  Divider, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Collapse, 
  IconButton, 
  Typography, 
  Box, 
  useTheme, 
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Dashboard as DashboardIcon,
  Train as TrainIcon,
  LocationOn as StationIcon,
  Book as BookingIcon,
  Star as ReviewIcon,
  Route as RouteIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ExpandLess,
  ExpandMore,
  People as PeopleIcon,

  Help as HelpIcon,
  ContactSupport as ContactSupportIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const drawerWidth = 240;

const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
  width: open ? drawerWidth : theme.spacing(7) + 1,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  '& .MuiDrawer-paper': {
    width: open ? drawerWidth : theme.spacing(7) + 1,
    borderRight: 'none',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
  },
  '& .MuiListItemIcon-root': {
    minWidth: theme.spacing(5),
  },
  '& .MuiListItemButton-root': {
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(0.5, 1.5, 0.5, 1.5),
    padding: theme.spacing(1, 1.5),
    '&.Mui-selected': {
      backgroundColor: theme.palette.action.selected,
      '&:hover': {
        backgroundColor: theme.palette.action.selected,
      },
    },
  },
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1.5),
  ...theme.mixins.toolbar,
}));

const Sidebar = ({ open, onClose, onToggle, isMobile }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState({});
  useMediaQuery(theme.breakpoints.down('md'));

  // Auto-close mobile menu when route changes
  useEffect(() => {
    if (isMobile && open) {
      onClose();
    }
  }, [location.pathname, isMobile, open, onClose]);


  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
      exact: true,
      roles: ['user', 'admin'],
    },
    {
      text: 'Trains',
      icon: <TrainIcon />,
      path: '/trains',
      exact: false,
      roles: ['user', 'admin'],
    },
    {
      text: 'Stations',
      icon: <StationIcon />,
      path: '/stations',
      exact: false,
      roles: ['user', 'admin'],
    },
    {
      text: 'Bookings',
      icon: <BookingIcon />,
      path: '/bookings',
      exact: false,
      roles: ['user', 'admin'],
    },
    {
      text: 'Plan Journey',
      icon: <RouteIcon />,
      path: '/plan-journey',
      exact: true,
      roles: ['user', 'admin'],
    },
    {
      text: 'Reviews',
      icon: <ReviewIcon />,
      path: '/reviews',
      exact: true,
      roles: ['user', 'admin'],
    },
    {
      text: 'Admin',
      icon: <PeopleIcon />,
      path: '/admin',
      exact: false,
      roles: ['admin'],
      children: [
        { text: 'Users', path: '/admin/users', exact: false },
        { text: 'Trains', path: '/admin/trains', exact: false },
        { text: 'Stations', path: '/admin/stations', exact: false },
        { text: 'Bookings', path: '/admin/bookings', exact: false },
        { text: 'Reports', path: '/admin/reports', exact: false },
      ],
    },
  ];

  const bottomMenuItems = [
    { 
      text: 'Help', 
      icon: <HelpIcon />, 
      path: '/help',
      exact: true,
      roles: ['user', 'admin']
    },
    { 
      text: 'Contact', 
      icon: <ContactSupportIcon />, 
      path: '/contact',
      exact: true,
      roles: ['user', 'admin']
    },
    { 
      text: 'About', 
      icon: <InfoIcon />, 
      path: '/about',
      exact: true,
      roles: ['user', 'admin']
    },
  ];

  const handleClick = (text) => {
    setExpanded(prev => ({
      ...prev,
      [text]: !prev[text]
    }));
  };

  const isActive = (path, exact = true) => {
    if (path === '/' && location.pathname === '/') return true;
    return exact 
      ? location.pathname === path 
      : location.pathname.startsWith(path) && path !== '/';
  };

  const renderMenuItems = (items, isNested = false) => {
    return items.map((item) => {
      // Skip items that the user doesn't have permission to see
      if (item.roles && !item.roles.includes(user?.role || 'user')) {
        return null;
      }

      const hasChildren = item.children && item.children.length > 0;
      const isItemActive = isActive(item.path, item.exact !== false);
      const isExpanded = expanded[item.text] || isItemActive;

      return (
        <React.Fragment key={item.path}>
          <ListItem 
            disablePadding 
            component="div"
            sx={{ 
              display: 'block',
              ...(isNested && { pl: 3 }),
            }}
          >
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={isItemActive}
              onClick={(e) => {
                if (hasChildren) {
                  e.preventDefault();
                  handleClick(item.text);
                } else if (isMobile) {
                  onClose();
                }
              }}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                ...(isNested && { pl: 4 }),
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: isItemActive ? 'primary.main' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{
                  fontWeight: isItemActive ? 600 : 'normal',
                }}
                sx={{ opacity: open ? 1 : 0 }}
              />
              {hasChildren && open && (
                isExpanded ? <ExpandLess /> : <ExpandMore />
              )}
            </ListItemButton>
          </ListItem>
          
          {hasChildren && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderMenuItems(item.children, true)}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <StyledDrawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
    >
      {!isMobile && (
        <DrawerHeader>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrainIcon color="primary" sx={{ mr: 1 }} />
            {open && (
              <Typography variant="h6" noWrap component="div">
                Railway Planner
              </Typography>
            )}
          </Box>
          <IconButton onClick={onToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
      )}
      
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <List sx={{ flexGrow: 1 }}>
          {renderMenuItems(menuItems.filter(item => !item.bottom))}
        </List>
        
        <Divider />
        
        <List>
          {renderMenuItems(bottomMenuItems.filter(item => !item.bottom))}
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography 
              variant="caption" 
              color="textSecondary"
              sx={{ 
                display: 'block',
                lineHeight: 1.3,
              }}
            >
              © {new Date().getFullYear()} Railway Planner
              <br />
              All rights reserved
            </Typography>
          </Box>
        </List>
      </Box>
    </StyledDrawer>
  );
};

export default Sidebar;

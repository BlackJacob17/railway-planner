import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Toolbar, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    marginLeft: 0,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 240,
    }),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
}));

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header onMenuClick={handleDrawerToggle} />
      <Sidebar 
        mobileOpen={mobileOpen} 
        onClose={() => setMobileOpen(false)}
        isMobile={isMobile}
        open={sidebarOpen}
        onToggle={setSidebarOpen}
      />
      <Main 
        open={sidebarOpen && !isMobile}
        sx={{
          minHeight: '100vh',
          backgroundColor: 'background.default',
          paddingTop: '64px', // Height of the header
        }}
      >
        <Toolbar /> {/* This pushes content down below the app bar */}
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Outlet />
        </Container>
      </Main>
    </Box>
  );
};

export default MainLayout;

import React from 'react';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';
import { styled, keyframes } from '@mui/system';

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const LoadingSpinner = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  '& .MuiCircularProgress-root': {
    animation: `${rotate} 1.5s linear infinite`,
  },
  '& .MuiCircularProgress-circle': {
    strokeLinecap: 'round',
  },
}));

const LoadingScreen = ({ 
  fullScreen = false, 
  message = 'Loading...', 
  size = 40,
  thickness = 4,
  color = 'primary',
  delay = 0,
  withLogo = true,
}) => {
  const [show, setShow] = React.useState(delay === 0);

  React.useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setShow(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  if (!show) return null;

  return (
    <Fade in={show}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: fullScreen ? '100vh' : '100%',
          width: fullScreen ? '100vw' : '100%',
          position: fullScreen ? 'fixed' : 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: fullScreen ? 'background.paper' : 'transparent',
          zIndex: fullScreen ? 9999 : 'auto',
        }}
      >
        <LoadingSpinner>
          {withLogo && (
            <Box
              component="img"
              src="/logo-icon.svg"
              alt="Loading..."
              sx={{
                width: size * 1.5,
                height: size * 1.5,
                mb: 2,
                opacity: 0.8,
              }}
            />
          )}
          <CircularProgress 
            size={size} 
            thickness={thickness}
            color={color}
            disableShrink
            sx={{
              mb: 2,
              '& .MuiCircularProgress-circle': {
                stroke: theme => theme.palette.mode === 'light' 
                  ? theme.palette.primary.main 
                  : theme.palette.primary.light,
              },
            }}
          />
          {message && (
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{
                mt: 2,
                fontWeight: 500,
                maxWidth: 300,
                textAlign: 'center',
              }}
            >
              {message}
            </Typography>
          )}
        </LoadingSpinner>
      </Box>
    </Fade>
  );
};

export default LoadingScreen;

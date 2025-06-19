import React from 'react';
import { Box, Button, Container, Typography, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFoundPage = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        p: 3,
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 4,
            }}
          >
            <Box
              component={motion.div}
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              sx={{
                width: 120,
                height: 120,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                backgroundColor: theme.palette.error.light,
                color: theme.palette.error.contrastText,
                mb: 3,
              }}
            >
              <ErrorOutlineIcon sx={{ fontSize: 60 }} />
            </Box>
            
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' },
                fontWeight: 700,
                mb: 2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              404
            </Typography>
            
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: 'text.primary',
              }}
            >
              Oops! Page Not Found
            </Typography>
            
            <Typography
              variant="body1"
              sx={{
                maxWidth: 600,
                mb: 4,
                color: 'text.secondary',
                lineHeight: 1.7,
              }}
            >
              The page you are looking for might have been removed, had its name changed, 
              or is temporarily unavailable. Please check the URL or return to the homepage.
            </Typography>
            
            <Box
              component={motion.div}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                component={RouterLink}
                to="/"
                variant="contained"
                color="primary"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: theme.shadows[4],
                  '&:hover': {
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                Back to Home
              </Button>
            </Box>
          </Box>
          
          <Box
            sx={{
              mt: 8,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            {['/trains', '/stations', '/bookings', '/journey'].map((path) => (
              <Button
                key={path}
                component={RouterLink}
                to={path}
                variant="outlined"
                sx={{
                  textTransform: 'capitalize',
                  borderRadius: 2,
                  px: 3,
                }}
              >
                {path.replace('/', '') || 'Home'}
              </Button>
            ))}
          </Box>
        </motion.div>
      </Container>
      
      <Box
        component="footer"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          py: 2,
          textAlign: 'center',
          color: 'text.secondary',
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Typography variant="body2">
          © {new Date().getFullYear()} Railway Planner. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default NotFoundPage;

import React from 'react';
import { Box, Button, Container, Typography, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

const ServerErrorPage = () => {
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
                scale: [1, 1.05, 1],
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
              <SentimentVeryDissatisfiedIcon sx={{ fontSize: 60 }} />
            </Box>
            
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' },
                fontWeight: 700,
                mb: 2,
                color: 'error.dark',
              }}
            >
              500
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
              Oops! Something went wrong
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
              We're experiencing some technical difficulties. Our team has been notified 
              and we're working to fix the issue. Please try again later.
            </Typography>
            
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                justifyContent: 'center',
                mb: 4,
              }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => window.location.reload()}
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                >
                  Try Again
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  component={RouterLink}
                  to="/"
                  variant="outlined"
                  color="primary"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                >
                  Go to Home
                </Button>
              </motion.div>
            </Box>
            
            <Box
              sx={{
                mt: 4,
                p: 3,
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                maxWidth: 600,
                textAlign: 'left',
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Need immediate assistance?
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Our support team is available 24/7 to help you with any issues you're experiencing.
                Please contact us at{' '}
                <Box component="span" sx={{ color: 'primary.main' }}>
                  support@railwayplanner.com
                </Box>{' '}
                or call us at +1 (555) 123-4567.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Error code: 500_internal_server_error
              </Typography>
            </Box>
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

export default ServerErrorPage;

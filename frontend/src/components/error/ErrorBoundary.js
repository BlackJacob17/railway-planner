import React, { Component } from 'react';
import { Box, Button, Container, Typography, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
    
    // You can also log the error to an error reporting service here
    // logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <ErrorFallback 
          error={this.state.error} 
          errorInfo={this.state.errorInfo} 
          onReset={() => this.setState({ hasError: false, error: null, errorInfo: null })}
        />
      );
    }

    return this.props.children; 
  }
}

const ErrorFallback = ({ error, errorInfo, onReset }) => {
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
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 700,
              mb: 2,
              color: 'error.dark',
            }}
          >
            Something went wrong
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
            We're sorry, but an unexpected error occurred. Our team has been notified and we're working to fix the issue.
          </Typography>
          
          {process.env.NODE_ENV === 'development' && (
            <Box
              sx={{
                mt: 4,
                p: 3,
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                maxWidth: 800,
                textAlign: 'left',
                overflow: 'auto',
                maxHeight: 300,
              }}
            >
              <Typography variant="subtitle2" color="error" gutterBottom>
                {error && error.toString()}
              </Typography>
              <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                {errorInfo && errorInfo.componentStack}
              </Typography>
            </Box>
          )}
          
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              justifyContent: 'center',
              mt: 4,
            }}
          >
            <Button
              onClick={onReset}
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
            
            <Button
              component="a"
              href="mailto:support@railwayplanner.com"
              variant="text"
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
              Contact Support
            </Button>
          </Box>
        </Box>
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

export default ErrorBoundary;

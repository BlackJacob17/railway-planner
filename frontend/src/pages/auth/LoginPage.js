import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Link, 
  Grid, 
  Checkbox, 
  FormControlLabel, 
  Divider, 
  IconButton, 
  InputAdornment,
  Paper,
  Alert,
  Fade,
  CircularProgress,
  useTheme
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Train as TrainIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useDispatch } from 'react-redux';


import { login } from '../../store/slices/authSlice';

const AuthContainer = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[10],
  maxWidth: 500,
  margin: '0 auto',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    margin: theme.spacing(2),
    width: 'auto',
  },
}));

const SocialButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  textTransform: 'none',
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  '&:hover': {
    boxShadow: theme.shadows[3],
  },
}));

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [formError, setFormError] = useState('');
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const from = location.state?.from?.pathname || '/';
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  // Clear form error when form data changes
  useEffect(() => {
    if (formError) {
      setFormError('');
    }
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loading } = useSelector((state) => state.auth);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting || loading) {
      return;
    }
    
    setFormError('');
    
    // Basic form validation
    if (!formData.email || !formData.password) {
      setFormError('Please enter both email and password');
      return;
    }
    
    setIsSubmitting(true);
    
    // Scroll to top to show any errors
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    try {
      const { email, password, rememberMe } = formData;
      const resultAction = await dispatch(login({ email, password, rememberMe }));
      
      // Check if the login was successful
      if (login.fulfilled.match(resultAction)) {
        // Get the redirect path from location state or default to dashboard
        const redirectTo = location.state?.from || '/dashboard';
        console.log('Login successful, redirecting to:', redirectTo);
        
        // Small delay to show success state before redirect
        setTimeout(() => {
          navigate(redirectTo, { replace: true });
        }, 500);
      } else if (login.rejected.match(resultAction)) {
        // Handle login failure
        const errorMessage = resultAction.payload || 'Login failed. Please check your credentials and try again.';
        setFormError(errorMessage);
        
        // Clear password field on error for security
        setFormData(prev => ({
          ...prev,
          password: ''
        }));
      }
    } catch (error) {
      console.error('Login error:', error);
      setFormError('An unexpected error occurred. Please try again.');
      
      // Clear password field on error for security
      setFormData(prev => ({
        ...prev,
        password: ''
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider) => {
    if (isSubmitting || loading) {
      return; // Prevent multiple submissions
    }
    
    console.log(`Logging in with ${provider}`);
    setFormError(`${provider} login is not implemented yet`);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ position: 'relative' }}>
      {(isSubmitting || loading) && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1,
            borderRadius: (theme) => theme.shape.borderRadius * 2,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <AuthContainer elevation={3}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <TrainIcon color="primary" sx={{ fontSize: 50, mb: 1 }} />
          <Typography component="h1" variant="h4" color="primary">
            Railway Planner
          </Typography>
          <Typography variant="h5" sx={{ mt: 2, fontWeight: 'medium' }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to continue your journey
          </Typography>
        </Box>

        {formError && (
          <Fade in={!!formError}>
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {formError}
            </Alert>
          </Fade>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting || loading}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            disabled={isSubmitting || loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={toggleShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mt: 1,
            mb: 1
          }}>
            <FormControlLabel
              control={
                <Checkbox
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  color="primary"
                  size="small"
                  disabled={isSubmitting || loading}
                />
              }
              label={
                <Typography variant="body2" color="textSecondary">
                  Remember me
                </Typography>
              }
              disabled={loading}
            />
            <Link 
              component={isSubmitting || loading ? 'span' : RouterLink} 
              to="/forgot-password" 
              variant="body2"
              sx={{
                textDecoration: 'none',
                cursor: isSubmitting || loading ? 'not-allowed' : 'pointer',
                color: isSubmitting || loading ? 'text.disabled' : 'primary.main',
                '&:hover': {
                  textDecoration: isSubmitting || loading ? 'none' : 'underline',
                },
              }}
              onClick={(e) => {
                if (isSubmitting || loading) {
                  e.preventDefault();
                }
              }}
            >
              Forgot password?
            </Link>
          </Box>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ 
              mt: 3, 
              mb: 2,
              py: 1.5,
              '&.Mui-disabled': {
                backgroundColor: 'primary.main',
                opacity: 0.7
              }
            }}
            disabled={isSubmitting || loading || !formData.email || !formData.password}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </Box>

        <Divider sx={{ width: '100%', my: 3 }}>OR</Divider>

        <Box sx={{ width: '100%', mb: 2 }}>
          <SocialButton
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={() => !isSubmitting && !loading && handleSocialLogin('Google')}
            disabled={isSubmitting || loading}
            sx={{ 
              color: isSubmitting || loading ? 'text.disabled' : '#DB4437',
              borderColor: isSubmitting || loading ? 'text.disabled' : '#DB4437',
              opacity: isSubmitting || loading ? 0.7 : 1,
              cursor: isSubmitting || loading ? 'not-allowed' : 'pointer',
              '&:hover': {
                backgroundColor: isSubmitting || loading ? 'transparent' : 'rgba(219, 68, 55, 0.04)'
              }
            }}
          >
            Continue with Google
          </SocialButton>
          <SocialButton
            fullWidth
            variant="outlined"
            startIcon={<FacebookIcon color={isSubmitting || loading ? 'disabled' : 'primary'} />}
            onClick={() => !isSubmitting && !loading && handleSocialLogin('Facebook')}
            disabled={isSubmitting || loading}
            sx={{ 
              mb: 2,
              color: isSubmitting || loading ? 'text.disabled' : 'primary.main',
              borderColor: isSubmitting || loading ? 'text.disabled' : 'primary.main',
              opacity: isSubmitting || loading ? 0.7 : 1,
              cursor: isSubmitting || loading ? 'not-allowed' : 'pointer',
              '&:hover': {
                backgroundColor: isSubmitting || loading ? 'transparent' : 'rgba(25, 118, 210, 0.04)'
              }
            }}
          >
            Continue with Facebook
          </SocialButton>
          <SocialButton
            fullWidth
            variant="outlined"
            startIcon={<TwitterIcon color={isSubmitting || loading ? 'disabled' : 'info'} />}
            onClick={() => !isSubmitting && !loading && handleSocialLogin('Twitter')}
            disabled={isSubmitting || loading}
            sx={{ 
              color: isSubmitting || loading ? 'text.disabled' : '#03A9F4',
              borderColor: isSubmitting || loading ? 'text.disabled' : '#03A9F4',
              opacity: isSubmitting || loading ? 0.7 : 1,
              cursor: isSubmitting || loading ? 'not-allowed' : 'pointer',
              '&:hover': {
                backgroundColor: isSubmitting || loading ? 'transparent' : 'rgba(3, 169, 244, 0.04)'
              }
            }}
          >
            Continue with Twitter
          </SocialButton>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link 
              component={isSubmitting || loading ? 'span' : RouterLink} 
              to="/register" 
              variant="body2"
              sx={{
                cursor: isSubmitting || loading ? 'not-allowed' : 'pointer',
                color: isSubmitting || loading ? 'text.disabled' : 'primary.main',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: isSubmitting || loading ? 'none' : 'underline',
                },
              }}
              onClick={(e) => {
                if (isSubmitting || loading) {
                  e.preventDefault();
                }
              }}
            >
              Sign up
            </Link>
          </Typography>
        </Box>
      </AuthContainer>
    </Container>
  );
}

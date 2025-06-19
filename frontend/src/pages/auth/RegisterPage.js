import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../../store/slices/authSlice';
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
  Alert,
  FormHelperText,
  Paper,
  InputLabel,
  OutlinedInput,
  FormControl,
  useTheme,
  CircularProgress,
  LinearProgress,
  Fade
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Train as TrainIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../hooks/useAuth';

const AuthContainer = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[10],
  maxWidth: 800,
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

const PasswordRequirement = ({ valid, text }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
    {valid ? (
      <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 1 }} />
    ) : (
      <ErrorIcon color="error" fontSize="small" sx={{ mr: 1 }} />
    )}
    <Typography variant="body2" color={valid ? 'text.secondary' : 'error'}>
      {text}
    </Typography>
  </Box>
);

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({});
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const from = location.state?.from?.pathname || '/';
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);
  
  // Password validation rules
  const passwordValidations = {
    minLength: formData.password.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    passwordsMatch: formData.password === formData.confirmPassword && formData.password !== '',
  };
  
  const isFormValid = 
    formData.firstName.trim() && 
    formData.lastName.trim() && 
    /^\S+@\S+\.\S+$/.test(formData.email) &&
    /^\+?[0-9\s-]{10,}$/.test(formData.phone) &&
    formData.password &&
    formData.confirmPassword &&
    Object.values(passwordValidations).every(v => v) &&
    formData.acceptTerms;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid) {
      // Mark all fields as touched to show validation errors
      setTouched({
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        password: true,
        confirmPassword: true,
        acceptTerms: true,
      });
      return;
    }
    
    try {
      await dispatch(register({
        username: formData.firstName.trim() + ' ' + formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      })).unwrap();
      
      // Redirect to login page with success message
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please log in to continue.',
          messageType: 'success'
        } 
      });
    } catch (error) {
      console.error('Registration failed:', error);
      // Error is handled by the auth slice
    }
  };

  const handleSocialRegister = (provider) => {
    // Implement social registration logic here
    console.log(`Registering with ${provider}`);
    // setError(`${provider} registration is not implemented yet`);
  };

  // Calculate password strength (0-100)
  const calculatePasswordStrength = () => {
    let strength = 0;
    if (formData.password.length >= 8) strength += 20;
    if (passwordValidations.hasUpperCase) strength += 20;
    if (passwordValidations.hasNumber) strength += 20;
    if (passwordValidations.hasSpecialChar) strength += 20;
    if (passwordValidations.passwordsMatch) strength += 20;
    return strength;
  };

  const passwordStrength = calculatePasswordStrength();
  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return 'error';
    if (passwordStrength < 80) return 'warning';
    return 'success';
  };

  return (
    <Container component="main" maxWidth="md">
      <AuthContainer elevation={3}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <TrainIcon color="primary" sx={{ fontSize: 50, mb: 1 }} />
          <Typography component="h1" variant="h4" color="primary">
            Create Your Account
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Join thousands of travelers and start your journey today
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              {error && (
                <Fade in={!!error}>
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                </Fade>
              )}
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    name="firstName"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={() => handleBlur('firstName')}
                    error={touched.firstName && !formData.firstName}
                    helperText={touched.firstName && !formData.firstName ? 'First name is required' : ''}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={() => handleBlur('lastName')}
                    error={touched.lastName && !formData.lastName}
                    helperText={touched.lastName && !formData.lastName ? 'Last name is required' : ''}
                  />
                </Grid>
              </Grid>
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                error={touched.email && !/^\S+@\S+\.\S+$/.test(formData.email)}
                helperText={
                  touched.email && !/^\S+@\S+\.\S+$/.test(formData.email) 
                    ? 'Please enter a valid email address' 
                    : ''
                }
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="phone"
                label="Phone Number"
                name="phone"
                autoComplete="tel"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                onBlur={() => handleBlur('phone')}
                error={touched.phone && !/^\+?[0-9\s-]{10,}$/.test(formData.phone)}
                helperText={
                  touched.phone && !/^\+?[0-9\s-]{10,}$/.test(formData.phone)
                    ? 'Please enter a valid phone number'
                    : ''
                }
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                error={touched.password && !passwordValidations.minLength}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              {formData.password && (
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      Password Strength:
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={passwordStrength} 
                      color={getPasswordStrengthColor()}
                      sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1, minWidth: 40, textAlign: 'right' }}>
                      {passwordStrength}%
                    </Typography>
                  </Box>
                  <PasswordRequirement 
                    valid={passwordValidations.minLength} 
                    text="At least 8 characters" 
                  />
                  <PasswordRequirement 
                    valid={passwordValidations.hasUpperCase} 
                    text="At least one uppercase letter" 
                  />
                  <PasswordRequirement 
                    valid={passwordValidations.hasNumber} 
                    text="At least one number" 
                  />
                  <PasswordRequirement 
                    valid={passwordValidations.hasSpecialChar} 
                    text="At least one special character" 
                  />
                </Box>
              )}
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur('confirmPassword')}
                error={touched.confirmPassword && !passwordValidations.passwordsMatch}
                helperText={
                  touched.confirmPassword && !passwordValidations.passwordsMatch
                    ? 'Passwords do not match'
                    : ''
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <FormControlLabel
                control={
                  <Checkbox 
                    name="acceptTerms" 
                    color="primary" 
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the{' '}
                    <Link href="/terms" target="_blank" rel="noopener noreferrer">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" target="_blank" rel="noopener noreferrer">
                      Privacy Policy
                    </Link>
                  </Typography>
                }
                sx={{ mt: 2, display: 'block' }}
              />
              {touched.acceptTerms && !formData.acceptTerms && (
                <Typography variant="caption" color="error">
                  You must accept the terms and conditions
                </Typography>
              )}
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={loading || !isFormValid}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
              </Button>
              
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link component={RouterLink} to="/login" variant="body2">
                    Sign in
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center',
              p: 4,
              backgroundColor: 'rgba(25, 118, 210, 0.04)',
              borderRadius: 2,
              border: '1px dashed rgba(25, 118, 210, 0.3)'
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>
                Benefits of joining us
              </Typography>
              <Box component="ul" sx={{ pl: 2, mb: 3 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  ✓ Easy and fast ticket booking
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  ✓ Exclusive member discounts
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  ✓ Personalized travel recommendations
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  ✓ Priority customer support
                </Typography>
                <Typography component="li" variant="body2">
                  ✓ Earn loyalty points on every booking
                </Typography>
              </Box>
              
              <Divider sx={{ my: 3 }}>OR</Divider>
              
              <Typography variant="subtitle2" color="text.secondary" align="center" gutterBottom>
                Sign up with
              </Typography>
              
              <SocialButton
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={() => handleSocialRegister('Google')}
                sx={{ color: '#DB4437', borderColor: '#DB4437', mb: 2 }}
              >
                Continue with Google
              </SocialButton>
              <SocialButton
                fullWidth
                variant="outlined"
                startIcon={<FacebookIcon color="primary" />}
                onClick={() => handleSocialRegister('Facebook')}
                sx={{ mb: 2 }}
              >
                Continue with Facebook
              </SocialButton>
              <SocialButton
                fullWidth
                variant="outlined"
                startIcon={<TwitterIcon color="info" />}
                onClick={() => handleSocialRegister('Twitter')}
              >
                Continue with Twitter
              </SocialButton>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block', textAlign: 'center' }}>
                By continuing, you agree to our Terms of Service and Privacy Policy
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </AuthContainer>
    </Container>
  );
}

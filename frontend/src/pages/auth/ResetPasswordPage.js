import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { resetPassword, clearError } from '../../store/slices/authSlice';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  Paper,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const AuthContainer = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: 400,
  margin: 'auto',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[5],
}));

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { resetToken } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, message } = useSelector((state) => state.auth);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      // This should be handled with a more robust validation library in a real app
      alert("Passwords don't match");
      return;
    }
    dispatch(resetPassword({ token: resetToken, newPassword: password }));
  };

  useEffect(() => {
    if (message) {
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  }, [message, navigate]);

  return (
    <Container component="main" maxWidth="xs">
      <AuthContainer elevation={3}>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Reset Password
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <FormControl variant="outlined" fullWidth margin="normal" required>
            <InputLabel htmlFor="password">New Password</InputLabel>
            <OutlinedInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="New Password"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
          <FormControl variant="outlined" fullWidth margin="normal" required>
            <InputLabel htmlFor="confirm-password">Confirm New Password</InputLabel>
            <OutlinedInput
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              label="Confirm New Password"
            />
          </FormControl>
          {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
          {message && <Alert severity="success" sx={{ width: '100%', mt: 2 }}>{message}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || !!message}
          >
            {loading ? <CircularProgress size={24} /> : 'Reset Password'}
          </Button>
          {message && (
            <Typography variant="body2" align="center">
              Redirecting to <Link component={RouterLink} to="/login">login</Link>...
            </Typography>
          )}
        </Box>
      </AuthContainer>
    </Container>
  );
}


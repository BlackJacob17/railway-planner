import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as loginAPI, register as registerAPI, getMe as getMeAPI, logout as logoutAPI, forgotPassword as forgotPasswordAPI, resetPassword as resetPasswordAPI, updateUserProfile as updateUserProfileAPI, changePassword as changePasswordAPI } from '../../services/api/authAPI';
import { createApiError } from '../../utils/apiErrorHandler';
import setAuthToken from '../../utils/setAuthToken';

// Load token from storage
const getTokenFromStorage = () => {
  // Check localStorage first, then sessionStorage
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Helper function to store token based on rememberMe preference
const storeAuthData = (token, rememberMe = false) => {
  if (rememberMe) {
    localStorage.setItem('token', token);
    localStorage.setItem('rememberMe', 'true');
  } else {
    sessionStorage.setItem('token', token);
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
  }
};

// Helper function to clear all auth data
const clearAuthData = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  localStorage.removeItem('rememberMe');
};

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await registerAPI(userData);
      
      // Extract token and user data from response
      const { token, user } = response;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      // Store token based on rememberMe (default to false for registration)
      const rememberMe = userData.rememberMe || false;
      if (rememberMe) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
      
      // Set auth token for axios
      setAuthToken(token);
      
      return { user, token };
    } catch (error) {
      // Clear any stored auth data on error
      clearAuthData();
      
      // Log the error for debugging
      console.error('Registration error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Return the error message to be handled by the UI
      return rejectWithValue(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password, rememberMe = false }, { rejectWithValue }) => {
    try {
      const response = await loginAPI({ email, password });
      
      // Extract token and user data from response
      const { token, user } = response;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      // Store token based on rememberMe
      if (rememberMe) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
      
      // Set auth token for axios
      setAuthToken(token);
      
      return { user, token };
    } catch (error) {
      // Clear any stored auth data on error
      clearAuthData();
      
      // Log the error for debugging
      console.error('Login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Return the error message to be handled by the UI
      return rejectWithValue(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  }
);

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      // Try to get token from localStorage first, then sessionStorage
      let token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        console.log('No token found, user is not authenticated');
        return rejectWithValue('No token found');
      }
      
      console.log('Loading user with token:', token.substring(0, 10) + '...');
      
      // Set the token in axios headers
      setAuthToken(token);
      
      // Fetch user data
      const response = await getMeAPI();
      
      if (!response || !response.user) {
        throw new Error('Invalid user data received from server');
      }
      
      console.log('User loaded successfully:', response.user);
      return { user: response.user };
      
    } catch (error) {
      console.error('Error loading user:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Clear auth data if there's an error
      clearAuthData();
      
      // Return the error message to be handled by the UI
      return rejectWithValue('Failed to load user. Please log in again.');
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true, // Start with loading true to check auth state
  isInitialized: false, // Track if initial auth check is complete
  error: null,
  token: getTokenFromStorage(),
};

// Async thunk for logout
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await forgotPasswordAPI(email);
      return response.message;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await resetPasswordAPI({ token, password });
      return response.message;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await updateUserProfileAPI(profileData);
      return response.user;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await changePasswordAPI(passwordData);
      return response.message;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Logging out user...');
      
      // Clear auth data from storage
      clearAuthData();
      
      console.log('Logout successful');
      return null;
      
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Still clear auth data even if there's an error
      clearAuthData();
      
      return rejectWithValue('An error occurred during logout');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear auth state without making API calls (for use in error cases)
    clearAuth: (state) => {
      // Clear all auth data
      clearAuthData();
      
      // Reset state
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, { payload: { user, token } }) => {
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    
    builder.addCase(register.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = payload.user;
      state.token = payload.token;
      state.error = null;
      state.isInitialized = true;
      console.log('Registration successful');
    });
    
    builder.addCase(register.rejected, (state, { payload }) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = payload;
      state.isInitialized = true;
      console.error('Registration failed:', payload);
    });
    
    // Login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    
    builder.addCase(login.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = payload.user;
      state.token = payload.token;
      state.error = null;
      state.isInitialized = true;
      console.log('Login successful');
    });
    
    builder.addCase(login.rejected, (state, { payload }) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = payload;
      console.error('Login failed:', payload);
    });
    
    // Load User
    builder.addCase(loadUser.pending, (state) => {
      // Only set loading to true if we haven't initialized yet
      // This prevents the loading spinner from showing on every route change
      if (!state.isInitialized) {
        state.loading = true;
      }
      state.error = null;
    });
    
    builder.addCase(loadUser.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = payload.user;
      state.error = null;
      state.isInitialized = true;
      console.log('User loaded successfully');
    });
    
    builder.addCase(loadUser.rejected, (state, { payload }) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = payload;
      state.isInitialized = true;
      console.error('Failed to load user:', payload);
    });
    
    // Logout
    builder.addCase(logout.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    
    builder.addCase(logout.fulfilled, (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      state.isInitialized = true;
      console.log('Logout successful');
    });
    
    builder.addCase(logout.rejected, (state, { payload }) => {
      // Even if logout fails, we still want to clear the auth state
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = payload;
      state.isInitialized = true;
      console.warn('Logout completed with warnings:', payload);
    });

    // Forgot Password
    builder.addCase(forgotPassword.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = null;
    });
    builder.addCase(forgotPassword.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.message = payload;
    });
    builder.addCase(forgotPassword.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    });

    // Reset Password
    builder.addCase(resetPassword.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = null;
    });
    builder.addCase(resetPassword.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.message = payload;
    });
    builder.addCase(resetPassword.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    });

    // Update User Profile
    builder.addCase(updateUserProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = null;
    });
    builder.addCase(updateUserProfile.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.user = payload;
      state.message = 'Profile updated successfully';
    });
    builder.addCase(updateUserProfile.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    });

    // Change Password
    builder.addCase(changePassword.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = null;
    });
    builder.addCase(changePassword.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.message = payload;
    });
    builder.addCase(changePassword.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    });
  },
});

export const { clearAuth, clearError } = authSlice.actions;
export default authSlice.reducer;

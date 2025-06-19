import axios from 'axios';
import { handleApiError, withErrorHandling } from '../../utils/apiErrorHandler';

const API_URL = process.env.REACT_APP_API_URL;

// Create axios instance with base URL// API client with interceptors
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage or sessionStorage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log the error for debugging
    console.error('API Error:', error.message);
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      
      // Redirect to login page if we're not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API methods
export const register = async (userData) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    return data;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

export const login = async ({ email, password }) => {
  try {
    const { data } = await api.post('/auth/login', {
      email,
      password
    });
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = async () => {
  // No need to call the backend since we don't have a logout endpoint
  return Promise.resolve();
};

export const forgotPassword = async (email) => {
  try {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error;
  }
};

export const resetPassword = async ({ token, password }) => {
  try {
    const { data } = await api.put(`/auth/reset-password/${token}`, { password });
    return data;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const { data } = await api.put('/auth/me', profileData);
    return data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

export const changePassword = async (passwordData) => {
  try {
    const { data } = await api.put('/auth/change-password', passwordData);
    return data;
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};

export const getMe = async () => {
  try {
    console.log('Fetching user data from /auth/me...');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log('Current token:', token ? token.substring(0, 10) + '...' : 'No token found');
    
    const { data } = await api.get('/auth/me');
    console.log('User data received:', data);
    return data;
  } catch (error) {
    console.error('Get me error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    throw error;
  }
};

const authAPI = {
  register,
  login,
  logout,
  getMe
};

export default authAPI;

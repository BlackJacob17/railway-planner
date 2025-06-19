import api from '../services/api';

// Set the auth token for axios requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // Store the token in the appropriate storage based on rememberMe
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    if (rememberMe) {
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }
  } else {
    // Remove auth header
    delete api.defaults.headers.common['Authorization'];
    // Clear tokens from all storage
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
  }
};

// Get the stored token
export const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Remove auth token from storage and headers
export const removeAuthToken = () => {
  // Remove auth header
  delete api.defaults.headers.common['Authorization'];
  // Clear tokens from all storage
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  localStorage.removeItem('rememberMe');
};

// Logout helper
export const logout = () => {
  // Clear all auth data
  removeAuthToken();
  
  // Redirect to login page
  window.location.href = '/login';
};

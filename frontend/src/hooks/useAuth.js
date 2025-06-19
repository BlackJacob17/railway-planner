import { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  loadUser, 
  login as loginAction, 
  register as registerAction, 
  logout as logoutAction, 
  clearError 
} from '../store/slices/authSlice';
import { getAuthToken, setAuthToken, removeAuthToken } from '../utils/auth';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Create memoized selector
  const selectAuthData = useMemo(
    () =>
      createSelector(
        [(state) => state.auth],
        (auth) => ({
          user: auth.user,
          isAuthenticated: auth.isAuthenticated,
          loading: auth.loading,
          error: auth.error,
          token: auth.token || getAuthToken(),
        })
      ),
    [] // No dependencies as we're not using any external values
  );

  const { 
    user, 
    isAuthenticated, 
    loading, 
    error, 
    token 
  } = useSelector(selectAuthData);

  // Load user on mount or when token changes
  useEffect(() => {
    const loadUserData = async () => {
      const currentToken = getAuthToken();
      
      if (currentToken && !user && !loading) {
        try {
          // Set the auth token in axios headers
          setAuthToken(currentToken);
          
          // Load user data
          await dispatch(loadUser()).unwrap();
        } catch (error) {
          console.error('Failed to load user:', error);
          // Clear invalid token
          removeAuthToken();
        }
      } else if (!currentToken && isAuthenticated) {
        // No token but user is authenticated - clear state
        dispatch(logoutAction());
      }
    };
    
    loadUserData();
  }, [dispatch, user, loading, isAuthenticated]);

  // Handle authentication state changes
  useEffect(() => {
    if (!loading) {
      // If not authenticated but has a token, token might be invalid
      if (!isAuthenticated && token) {
        console.warn('Token exists but user is not authenticated - token may be invalid or expired');
        removeAuthToken();
      }
      
      // Redirect to login if not authenticated and not already on login/register page
      const authPages = ['/login', '/register', '/forgot-password', '/reset-password'];
      const isAuthPage = authPages.some(page => location.pathname.startsWith(page));
      
      if (!isAuthenticated && !isAuthPage && !loading) {
        navigate('/login', { 
          state: { 
            from: location,
            message: 'Please log in to continue',
            messageType: 'info'
          },
          replace: true 
        });
      }
    }
  }, [isAuthenticated, loading, token, navigate, location]);

  /**
   * Logout the current user
   */
  const logout = useCallback(() => {
    dispatch(logoutAction());
    removeAuthToken();
    navigate('/', { replace: true });
  }, [dispatch, navigate]);
  
  /**
   * Login helper function
   */
  const login = useCallback(async (credentials) => {
    try {
      const result = await dispatch(loginAction(credentials)).unwrap();
      setAuthToken(result.token);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Login failed. Please check your credentials.' 
      };
    }
  }, [dispatch]);

  /**
   * Register a new user
   */
  const register = useCallback(async (userData) => {
    try {
      const result = await dispatch(registerAction(userData)).unwrap();
      setAuthToken(result.token);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Registration failed. Please try again.' 
      };
    }
  }, [dispatch]);

  /**
   * Clear any authentication errors
   */
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // State
    user,
    isAuthenticated,
    loading,
    error,
    token,
    
    // Actions
    login,
    logout,
    register,
    clearAuthError,
  };
};

/**
 * Higher-Order Component (HOC) to protect routes that require authentication
 */
export const withAuth = (Component) => {
  const WrappedComponent = (props) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        navigate('/login', { 
          state: { from: location },
          replace: true 
        });
      }
    }, [isAuthenticated, loading, location, navigate]);

    if (loading) {
      return <div>Loading...</div>; // Or a proper loading component
    }

    return isAuthenticated ? <Component {...props} /> : null;
  };

  return WrappedComponent;
};

/**
 * Higher-Order Component (HOC) to protect admin routes
 */
export const withAdmin = (Component) => {
  const WrappedComponent = (props) => {
    const { isAuthenticated, loading, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
      if (!loading && (!isAuthenticated || user?.role !== 'admin')) {
        navigate('/unauthorized', { 
          state: { from: location },
          replace: true 
        });
      }
    }, [isAuthenticated, loading, user, location, navigate]);

    if (loading) {
      return <div>Loading...</div>; // Or a proper loading component
    }

    return isAuthenticated && user?.role === 'admin' ? <Component {...props} /> : null;
  };

  return WrappedComponent;
};

export default useAuth;

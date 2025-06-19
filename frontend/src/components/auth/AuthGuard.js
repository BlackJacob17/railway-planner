import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import LoadingScreen from '../common/LoadingScreen';

/**
 * AuthGuard component to protect routes that require authentication
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {boolean} [props.redirectToLogin=true] - Whether to redirect to login page if not authenticated
 * @param {string} [props.redirectPath] - Custom redirect path (defaults to '/login')
 * @returns {JSX.Element} - Rendered component
 */
const AuthGuard = ({ 
  children, 
  redirectToLogin = true, 
  redirectPath = '/login',
  ...rest 
}) => {
  const { isAuthenticated, isInitialized } = useSelector((state) => state.auth);
  const location = useLocation();

  // Show loading screen while checking auth state
  if (!isInitialized) {
    return <LoadingScreen fullScreen />;
  }

  // If not authenticated and should redirect to login
  if (!isAuthenticated && redirectToLogin) {
    // Store the current location to redirect back after login
    const from = location.pathname + location.search;
    const redirectState = from !== '/login' 
      ? { from, search: location.search, state: location.state }
      : undefined;
      
    console.log('Redirecting to login, will redirect back to:', from);
    return (
      <Navigate 
        to={redirectPath} 
        state={redirectState}
        replace 
      />
    );
  }

  // If not authenticated and no redirect, show nothing or a message
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated, render children
  return <>{children}</>;
};

AuthGuard.propTypes = {
  children: PropTypes.node,
  redirectToLogin: PropTypes.bool,
  redirectPath: PropTypes.string,
};

export default AuthGuard;

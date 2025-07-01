import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import UnauthorizedPage from '../../pages/errors/UnauthorizedPage';

/**
 * RoleBasedGuard component to protect routes based on user roles
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string[]} props.allowedRoles - Array of allowed role IDs
 * @param {boolean} [props.showForbidden] - Whether to show 403 Forbidden page or redirect
 * @param {string} [props.redirectTo] - Path to redirect if not authorized (defaults to '/unauthorized')
 * @returns {JSX.Element} - Rendered component
 */
const RoleBasedGuard = ({ 
  children, 
  allowedRoles = [],
  showForbidden = false,
  redirectTo = '/unauthorized',
  ...rest 
}) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  
  // If no specific roles are required, allow access
  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // If user is not loaded yet, show nothing (AuthGuard will handle loading state)
  if (!user) {
    return null;
  }

  // Check if user has any of the allowed roles
  const hasRequiredRole = allowedRoles.some(role => {
    // Handle both string and numeric role comparisons
    return user.roles.some(userRole => 
      userRole._id === role || 
      userRole.name === role ||
      userRole.name.toLowerCase() === role.toLowerCase()
    );
  });

  // If user has required role, render children
  if (hasRequiredRole) {
    return <>{children}</>;
  }

  // If showing forbidden page
  if (showForbidden) {
    return <UnauthorizedPage />;
  }

  // Otherwise, redirect to unauthorized page or custom path
  return (
    <Navigate 
      to={redirectTo} 
      state={{ from: location }} 
      replace 
    />
  );
};

RoleBasedGuard.propTypes = {
  children: PropTypes.node,
  allowedRoles: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ])
  ),
  showForbidden: PropTypes.bool,
  redirectTo: PropTypes.string,
};

RoleBasedGuard.defaultProps = {
  allowedRoles: [],
  showForbidden: false,
  redirectTo: '/unauthorized',
};

export default RoleBasedGuard;

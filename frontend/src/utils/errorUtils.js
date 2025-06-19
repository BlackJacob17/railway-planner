import { ROLES } from './constants';

/**
 * Handles API errors and returns a user-friendly error message
 * @param {Error} error - The error object from the API call
 * @param {Object} options - Additional options for error handling
 * @param {Function} options.onAuthError - Callback for authentication errors
 * @param {Function} options.onPermissionError - Callback for permission errors
 * @param {Function} options.onValidationError - Callback for validation errors
 * @param {Function} options.onNotFound - Callback for not found errors
 * @param {Function} options.onServerError - Callback for server errors
 * @returns {string} - A user-friendly error message
 */
export const handleApiError = (error, {
  onAuthError,
  onPermissionError,
  onValidationError,
  onNotFound,
  onServerError,
} = {}) => {
  console.error('API Error:', error);
  
  // Handle network errors
  if (!error.response) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  const { status, data } = error.response;
  
  // Handle different HTTP status codes
  switch (status) {
    case 400: // Bad Request
      if (data?.errors) {
        // Handle validation errors
        if (onValidationError) {
          onValidationError(data.errors);
        }
        return 'Please correct the highlighted errors and try again.';
      }
      return data?.message || 'Invalid request. Please check your input and try again.';
      
    case 401: // Unauthorized
      if (onAuthError) {
        onAuthError();
      }
      return 'Your session has expired. Please log in again.';
      
    case 403: // Forbidden
      if (onPermissionError) {
        onPermissionError();
      }
      return 'You do not have permission to perform this action.';
      
    case 404: // Not Found
      if (onNotFound) {
        onNotFound();
      }
      return data?.message || 'The requested resource was not found.';
      
    case 422: // Unprocessable Entity (validation errors)
      if (data?.errors) {
        if (onValidationError) {
          onValidationError(data.errors);
        }
        return 'Please correct the highlighted errors and try again.';
      }
      return data?.message || 'Validation failed. Please check your input.';
      
    case 429: // Too Many Requests
      return data?.message || 'Too many requests. Please try again later.';
      
    case 500: // Internal Server Error
    case 502: // Bad Gateway
    case 503: // Service Unavailable
    case 504: // Gateway Timeout
      if (onServerError) {
        onServerError();
      }
      return data?.message || 'An unexpected error occurred. Please try again later.';
      
    default:
      return data?.message || 'An error occurred. Please try again.';
  }
};

/**
 * Checks if the user has the required role/permission
 * @param {Object} user - The user object from the auth state
 * @param {string|Array} requiredRole - The required role(s)
 * @returns {boolean} - Whether the user has the required role
 */
export const hasPermission = (user, requiredRole) => {
  if (!user || !user.roles) return false;
  
  // If no role is required, allow access
  if (!requiredRole) return true;
  
  // Convert single role to array for consistent handling
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  // Check if user has any of the required roles
  return user.roles.some(userRole => {
    return requiredRoles.some(role => {
      // Check by role ID, name, or role constant
      return (
        userRole._id === role ||
        userRole.name === role ||
        userRole.name.toLowerCase() === role.toLowerCase() ||
        (ROLES[role] && (
          userRole._id === ROLES[role] ||
          userRole.name === ROLES[role] ||
          userRole.name.toLowerCase() === ROLES[role].toLowerCase()
        ))
      );
    });
  });
};

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} - The debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Creates a throttled function that only invokes func at most once per every wait milliseconds
 * @param {Function} func - The function to throttle
 * @param {number} limit - The number of milliseconds to throttle invocations to
 * @returns {Function} - The throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Deep clones an object
 * @param {Object} obj - The object to clone
 * @returns {Object} - The cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
};

/**
 * Formats a date string or Date object to a human-readable format
 * @param {string|Date} date - The date to format
 * @param {string} formatStr - The format string (defaults to 'MMM d, yyyy')
 * @returns {string} - The formatted date string
 */
export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Add more formatting options as needed
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };
  
  return d.toLocaleDateString('en-US', options);
};

/**
 * Formats a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (defaults to 'USD')
 * @returns {string} - The formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

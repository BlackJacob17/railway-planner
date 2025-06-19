/**
 * Handles API errors consistently across the application
 * @param {Error} error - The error object from the API call
 * @param {Object} options - Configuration options
 * @param {Function} options.onAuthError - Callback for authentication errors (401)
 * @param {Function} options.onForbidden - Callback for forbidden errors (403)
 * @param {Function} options.onNotFound - Callback for not found errors (404)
 * @param {Function} options.onServerError - Callback for server errors (500+)
 * @param {Function} options.onNetworkError - Callback for network errors
 * @param {Function} options.onClientError - Callback for client errors (400-499)
 * @returns {Object} - An object containing the error message and status code
 */
export const handleApiError = (error, {
  onAuthError = null,
  onForbidden = null,
  onNotFound = null,
  onServerError = null,
  onNetworkError = null,
  onClientError = null,
} = {}) => {
  console.error('API Error:', {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status,
    config: {
      url: error.config?.url,
      method: error.config?.method,
      data: error.config?.data,
    },
  });

  const response = error.response;
  let errorMessage = 'An unexpected error occurred';
  let statusCode = null;

  if (!response) {
    // Network error or no response from server
    errorMessage = 'Unable to connect to the server. Please check your internet connection.';
    statusCode = 'NETWORK_ERROR';
    
    if (onNetworkError) {
      onNetworkError(error);
    } else {
      // Default network error handling
      console.error('Network Error:', error.message);
    }
    
    return { error: errorMessage, statusCode };
  }

  // Extract status code and response data
  statusCode = response.status;
  const { data } = response;
  
  // Handle specific status codes
  switch (statusCode) {
    case 400:
      errorMessage = data?.message || 'Bad request';
      if (data?.errors) {
        // Handle validation errors
        errorMessage = Object.values(data.errors)
          .map(err => (Array.isArray(err) ? err.join(' ') : err))
          .join('\n');
      }
      break;
      
    case 401:
      errorMessage = data?.message || 'Session expired. Please log in again.';
      if (onAuthError) {
        onAuthError(error);
      } else {
        // Default auth error handling
        console.warn('Authentication required');
      }
      break;
      
    case 403:
      errorMessage = data?.message || 'You do not have permission to perform this action';
      if (onForbidden) onForbidden(error);
      break;
      
    case 404:
      errorMessage = data?.message || 'The requested resource was not found';
      if (onNotFound) onNotFound(error);
      break;
      
    case 429:
      errorMessage = data?.message || 'Too many requests. Please try again later.';
      break;
      
    case 500:
      errorMessage = data?.message || 'Internal server error. Please try again later.';
      if (onServerError) onServerError(error);
      break;
      
    default:
      if (statusCode >= 500) {
        errorMessage = data?.message || 'A server error occurred. Please try again later.';
        if (onServerError) onServerError(error);
      } else if (statusCode >= 400) {
        errorMessage = data?.message || 'An error occurred with your request.';
        if (onClientError) onClientError(error);
      }
  }

  return { error: errorMessage, statusCode };
};

/**
 * Creates a consistent error object from an API error
 * @param {Error} error - The error object
 * @returns {Object} - A standardized error object
 */
export const createApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return {
      message: error.response.data?.message || 'An error occurred',
      status: error.response.status,
      data: error.response.data,
      isApiError: true,
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      message: 'No response from server. Please check your connection.',
      status: 'NETWORK_ERROR',
      isNetworkError: true,
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      message: error.message || 'An unexpected error occurred',
      status: 'CLIENT_ERROR',
      isClientError: true,
    };
  }
};

/**
 * Wrapper for async API calls that handles errors consistently
 * @param {Function} apiCall - The API call function to wrap
 * @param {Object} options - Error handling options
 * @returns {Promise<{data: *, error: *}>} - The API response or error
 */
export const withErrorHandling = async (apiCall, options = {}) => {
  try {
    const response = await apiCall();
    return { data: response.data, error: null };
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error, options);
    return { data: null, error: errorMessage, statusCode };
  }
};

import { useCallback, useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNotification } from './useNotification';
import { handleApiError } from '../utils/errorUtils';

// Default retry configuration
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  retryOn: [502, 503, 504], // Retry on these status codes
};

/**
 * Custom hook for making API requests with loading states, error handling, and caching
 * @param {Object} options - Configuration options
 * @param {Function} options.apiCall - The API call function to execute
 * @param {boolean} [options.autoFetch=false] - Whether to fetch data on mount
 * @param {Array} [options.deps=[]] - Dependencies to trigger auto-fetch
 * @param {Object} [options.initialData=null] - Initial data before first fetch
 * @param {boolean} [options.enableCache=true] - Enable response caching
 * @param {number} [options.cacheTime=300000] - Cache duration in ms (5 minutes)
 * @param {Object} [options.retry] - Retry configuration
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @param {boolean} [options.showError=true] - Show error notifications
 * @param {boolean} [options.showSuccess=false] - Show success notifications
 * @returns {Object} API request state and methods
 */
const useApiRequest = ({
  apiCall,
  autoFetch = false,
  deps = [],
  initialData = null,
  enableCache = true,
  cacheTime = 5 * 60 * 1000, // 5 minutes
  retry: retryConfig = {},
  onSuccess,
  onError,
  showError = true,
  showSuccess = false,
} = {}) => {
  const dispatch = useDispatch();
  const { showError: showErrorNotification, showSuccess: showSuccessNotification } = useNotification();
  
  // State
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  
  // Refs
  const isMounted = useRef(true);
  const cache = useRef(new Map());
  const retryCount = useRef(0);
  const retryTimeout = useRef(null);
  
  // Merge default and provided retry config
  const { maxRetries, retryDelay, retryOn } = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
      }
    };
  }, []);
  
  /**
   * Clear the cache for this hook instance
   */
  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);
  
  /**
   * Reset the hook state to initial values
   */
  const reset = useCallback(() => {
    if (!isMounted.current) return;
    setData(initialData);
    setError(null);
    setStatus('idle');
    retryCount.current = 0;
    if (retryTimeout.current) {
      clearTimeout(retryTimeout.current);
      retryTimeout.current = null;
    }
  }, [initialData]);
  
  /**
   * Make the API request
   * @param {Object} requestData - Data to pass to the API call
   * @param {Object} options - Additional options
   * @param {boolean} [options.force=false] - Force a new request even if cached data exists
   * @returns {Promise} The API response
   */
  const request = useCallback(async (requestData = {}, { force = false } = {}) => {
    if (!apiCall) {
      const error = new Error('No API call function provided');
      console.error(error);
      return { data: null, error };
    }
    
    // Generate a cache key based on the request data
    const cacheKey = JSON.stringify({ requestData });
    const cachedResponse = cache.current.get(cacheKey);
    
    // Return cached data if available and not forcing a new request
    if (cachedResponse && !force && (Date.now() - cachedResponse.timestamp < cacheTime)) {
      if (isMounted.current) {
        setData(cachedResponse.data);
        setStatus('success');
      }
      return { data: cachedResponse.data, error: null };
    }
    
    // Set loading state
    if (isMounted.current) {
      setLoading(true);
      setStatus('loading');
    }
    
    try {
      // Make the API call
      const response = await apiCall(requestData, { dispatch });
      
      // Update cache if enabled
      if (enableCache && response) {
        cache.current.set(cacheKey, {
          data: response,
          timestamp: Date.now(),
        });
      }
      
      // Update state if component is still mounted
      if (isMounted.current) {
        setData(response);
        setError(null);
        setStatus('success');
        
        // Show success notification if enabled
        if (showSuccess) {
          showSuccessNotification('Request successful');
        }
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(response, { requestData });
        }
      }
      
      return { data: response, error: null };
    } catch (err) {
      // Handle API error
      const error = handleApiError(err, {
        onAuthError: () => {
          // Handle authentication errors (e.g., redirect to login)
          // This is handled by the auth middleware, so we don't need to do anything here
        },
      });
      
      // Check if we should retry the request
      const shouldRetry = 
        retryCount.current < maxRetries && 
        (retryOn.includes(err.response?.status) || !err.response);
      
      if (shouldRetry) {
        retryCount.current += 1;
        
        // Retry after a delay
        await new Promise(resolve => {
          retryTimeout.current = setTimeout(resolve, retryDelay);
        });
        
        // Make the request again
        return request(requestData, { force });
      }
      
      // Update state if component is still mounted
      if (isMounted.current) {
        setError(error);
        setStatus('error');
        
        // Show error notification if enabled
        if (showError) {
          showErrorNotification(error);
        }
        
        // Call error callback if provided
        if (onError) {
          onError(error, { requestData });
        }
      }
      
      return { data: null, error };
    } finally {
      // Reset loading state if component is still mounted
      if (isMounted.current) {
        setLoading(false);
      }
      
      // Reset retry count
      retryCount.current = 0;
      
      // Clear retry timeout
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
        retryTimeout.current = null;
      }
    }
  }, [
    apiCall, 
    dispatch, 
    enableCache, 
    cacheTime, 
    maxRetries, 
    retryDelay, 
    retryOn, 
    onSuccess, 
    onError, 
    showError, 
    showSuccess, 
    showErrorNotification, 
    showSuccessNotification
  ]);
  
  // Auto-fetch when dependencies change
  useEffect(() => {
    if (autoFetch) {
      request();
    }
    
    // Cleanup on unmount or when dependencies change
    return () => {
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
      }
    };
  }, [autoFetch, request, ...deps]);
  
  // Return the API state and methods
  return {
    // State
    data,
    loading,
    error,
    status,
    isIdle: status === 'idle',
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    
    // Methods
    request,
    reset,
    clearCache,
    
    // Alias for request (for backward compatibility)
    fetch: request,
    
    // Alias for common operations
    refresh: (data) => request(data, { force: true }),
    
    // Helper methods for optimistic updates
    setData,
    setError: (error) => {
      if (isMounted.current) {
        setError(error);
        setStatus('error');
      }
    },
  };
};

export default useApiRequest;

/**
 * Higher-order function that creates a pre-configured useApiRequest hook
 * @param {Object} defaultOptions - Default options for the hook
 * @returns {Function} A custom hook with the default options pre-configured
 */
useApiRequest.create = (defaultOptions = {}) => {
  return (options = {}) => {
    return useApiRequest({ ...defaultOptions, ...options });
  };
};

/**
 * Pre-configured hook for GET requests
 */
export const useGetRequest = (options = {}) => {
  return useApiRequest({
    autoFetch: true,
    showError: true,
    showSuccess: false,
    ...options,
  });
};

/**
 * Pre-configured hook for POST requests
 */
export const usePostRequest = (options = {}) => {
  return useApiRequest({
    autoFetch: false,
    showError: true,
    showSuccess: true,
    ...options,
  });
};

/**
 * Pre-configured hook for PUT requests
 */
export const usePutRequest = (options = {}) => {
  return useApiRequest({
    autoFetch: false,
    showError: true,
    showSuccess: true,
    ...options,
  });
};

/**
 * Pre-configured hook for DELETE requests
 */
export const useDeleteRequest = (options = {}) => {
  return useApiRequest({
    autoFetch: false,
    showError: true,
    showSuccess: true,
    ...options,
  });
};

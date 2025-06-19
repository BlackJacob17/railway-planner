import { useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Custom hook for handling API requests with loading and error states
 * @param {Function} apiCall - The API call function (e.g., from services/api)
 * @param {Object} options - Configuration options
 * @param {boolean} [options.autoFetch=false] - Whether to fetch data immediately
 * @param {Array} [options.deps=[]] - Dependencies to trigger auto-fetch
 * @param {Function} [options.onSuccess] - Callback for successful API call
 * @param {Function} [options.onError] - Callback for API call error
 * @param {Function} [options.onFinally] - Callback after API call completes (success or error)
 * @returns {Object} API state and methods
 */
const useApi = (apiCall, options = {}) => {
  const {
    autoFetch = false,
    deps = [],
    onSuccess,
    onError,
    onFinally,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const isMounted = useRef(true);
  const dispatch = useDispatch();
  const authToken = useSelector((state) => state.auth.token);

  // Reset the hook state
  const reset = useCallback(() => {
    if (!isMounted.current) return;
    setData(null);
    setError(null);
    setStatus('idle');
  }, []);

  // The main API request function
  const request = useCallback(
    async (requestData, requestOptions = {}) => {
      // Skip if already loading
      if (loading && !requestOptions.force) {
        return { data: null, error: new Error('Request already in progress') };
      }

      // Set loading state
      setLoading(true);
      setStatus('loading');
      setError(null);

      try {
        // Make the API call
        const response = await apiCall(requestData);
        
        // Handle successful response
        if (isMounted.current) {
          setData(response);
          setStatus('success');
          
          // Call success callback if provided
          if (onSuccess) {
            onSuccess(response, { requestData });
          }
          
          return { data: response, error: null };
        }
      } catch (err) {
        // Handle error
        if (isMounted.current) {
          const errorObj = err.response?.data || err.message || 'An error occurred';
          setError(errorObj);
          setStatus('error');
          
          // Call error callback if provided
          if (onError) {
            onError(errorObj, { requestData });
          }
          
          return { data: null, error: errorObj };
        }
      } finally {
        // Clean up
        if (isMounted.current) {
          setLoading(false);
          
          // Call finally callback if provided
          if (onFinally) {
            onFinally();
          }
        }
      }
      
      return { data: null, error: new Error('Component unmounted') };
    },
    [apiCall, loading, onError, onFinally, onSuccess]
  );

  // Auto-fetch on mount or when dependencies change
  const fetchData = useCallback(
    async (fetchOptions = {}) => {
      if (autoFetch || fetchOptions.force) {
        return await request(fetchOptions.data, { force: fetchOptions.force });
      }
      return { data: null, error: null };
    },
    [autoFetch, request]
  );

  // Set up effect for auto-fetching
  React.useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
    
    // Clean up on unmount
    return () => {
      isMounted.current = false;
    };
  }, [autoFetch, fetchData, ...deps]);

  // Refresh data
  const refresh = useCallback(
    async (refreshData) => {
      return await request(refreshData, { force: true });
    },
    [request]
  );

  // Update data manually (useful for optimistic updates)
  const updateData = useCallback((updater) => {
    if (typeof updater === 'function') {
      setData(updater);
    } else {
      setData(updater);
    }
  }, []);

  // Set error manually
  const setErrorManually = useCallback((errorMessage) => {
    setError(errorMessage);
    setStatus('error');
  }, []);

  // Check if the error is an authentication error (401)
  const isAuthError = error?.status === 401 || error?.code === 'UNAUTHORIZED';

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
    isAuthError,
    
    // Methods
    request,
    reset,
    refresh,
    updateData,
    setError: setErrorManually,
  };
};

export default useApi;

/**
 * A higher-order function that creates a pre-configured useApi hook for a specific API call
 * @param {Function} apiCall - The API call function
 * @param {Object} defaultOptions - Default options for the hook
 * @returns {Function} A custom hook with the API call pre-configured
 */
useApi.create = (apiCall, defaultOptions = {}) => {
  return (options = {}) => {
    return useApi(apiCall, { ...defaultOptions, ...options });
  };
};

// Pre-configured hooks for common API patterns
export const useFetch = (apiCall, options = {}) => {
  return useApi(apiCall, { autoFetch: true, ...options });
};

export const useLazyFetch = (apiCall, options = {}) => {
  return useApi(apiCall, { autoFetch: false, ...options });
};

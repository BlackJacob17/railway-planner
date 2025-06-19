import { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import queryString from 'query-string';

/**
 * Custom hook for managing URL search parameters with type safety
 * @param {Object} options - Configuration options
 * @param {Object} options.initialParams - Initial parameter values
 * @param {boolean} [options.syncWithUrl=true] - Whether to sync with URL
 * @param {Function} [options.parse] - Function to parse URL values
 * @param {Function} [options.stringify] - Function to stringify values for URL
 * @returns {Object} Search parameters state and methods
 */
const useSearchParams = (options = {}) => {
  const {
    initialParams = {},
    syncWithUrl = true,
    parse = defaultParser,
    stringify = JSON.stringify,
  } = options;

  const location = useLocation();
  const navigate = useNavigate();
  const [params, setParams] = useState(initialParams);

  // Parse URL search params on mount and when URL changes
  useEffect(() => {
    if (!syncWithUrl) return;

    const queryParams = queryString.parse(location.search, { parseNumbers: true, parseBooleans: true });
    const parsedParams = {};
    
    // Only update params that exist in initialParams or have values in the URL
    Object.keys(initialParams).forEach(key => {
      if (queryParams[key] !== undefined) {
        try {
          parsedParams[key] = parse(queryParams[key]);
        } catch (e) {
          console.warn(`Failed to parse URL parameter "${key}":`, e);
          parsedParams[key] = initialParams[key];
        }
      } else if (initialParams[key] !== undefined) {
        parsedParams[key] = initialParams[key];
      }
    });
    
    setParams(parsedParams);
  }, [location.search, initialParams, syncWithUrl, parse]);

  // Update URL when params change
  const updateUrl = useCallback(
    (newParams) => {
      if (!syncWithUrl) return;

      const queryParams = queryString.parse(location.search, { parseNumbers: true, parseBooleans: true });
      let hasChanges = false;
      const updatedParams = { ...queryParams };

      // Update URL params based on new values
      Object.keys(newParams).forEach(key => {
        const value = newParams[key];
        const currentValue = queryParams[key];
        const defaultValue = initialParams[key];
        
        // Only update if value is different from current URL and different from default
        if (
          (value === null || value === undefined || value === '') && 
          (currentValue === undefined || currentValue === null || currentValue === '')
        ) {
          // Both values are empty, no change needed
          return;
        }
        
        // Check if value is different from current URL
        const isDifferent = JSON.stringify(value) !== JSON.stringify(currentValue);
        
        // Check if value is different from default
        const isDefault = JSON.stringify(value) === JSON.stringify(defaultValue);
        
        if (isDifferent) {
          hasChanges = true;
          
          if (isDefault) {
            // Remove param if it matches default value
            delete updatedParams[key];
          } else {
            // Update param with new value
            updatedParams[key] = value;
          }
        }
      });

      // Only update URL if there are actual changes
      if (hasChanges) {
        const search = queryString.stringify(updatedParams, { 
          skipNull: true, 
          skipEmptyString: true,
          encode: false,
        });

        navigate(
          {
            pathname: location.pathname,
            search: search ? `?${search}` : '',
          },
          { replace: true }
        );
      }
    },
    [location.pathname, location.search, navigate, initialParams, syncWithUrl]
  );

  /**
   * Update a single parameter
   * @param {string} key - Parameter key
   * @param {*} value - New value for the parameter
   */
  const setParam = useCallback((key, value) => {
    setParams(prev => {
      const newParams = { ...prev, [key]: value };
      updateUrl({ [key]: value });
      return newParams;
    });
  }, [updateUrl]);

  /**
   * Update multiple parameters at once
   * @param {Object} updates - Object with parameter updates
   */
  const setParamsBatch = useCallback((updates) => {
    setParams(prev => {
      const newParams = { ...prev, ...updates };
      updateUrl(updates);
      return newParams;
    });
  }, [updateUrl]);

  /**
   * Reset parameters to their initial values
   * @param {string[]} [keys] - Optional array of keys to reset (resets all if not provided)
   */
  const resetParams = useCallback((keys) => {
    setParams(prev => {
      const updates = {};
      const resetKeys = keys || Object.keys(initialParams);
      
      resetKeys.forEach(key => {
        if (initialParams.hasOwnProperty(key)) {
          updates[key] = initialParams[key];
        }
      });
      
      updateUrl(updates);
      return { ...prev, ...updates };
    });
  }, [initialParams, updateUrl]);

  /**
   * Get a memoized object with all current parameters
   */
  const getAllParams = useMemo(() => ({
    ...params,
    // Add any computed or derived parameters here
  }), [params]);

  return {
    // Current parameter values
    params: getAllParams,
    
    // Methods
    setParam,
    setParams: setParamsBatch,
    resetParams,
    
    // For convenience, expose individual param getters and setters
    getParam: useCallback((key) => params[key], [params]),
    
    // For form integration
    handleParamChange: useCallback((key) => (event) => {
      const value = event?.target?.value !== undefined ? event.target.value : event;
      setParam(key, value);
    }, [setParam]),
    
    // For checkboxes and switches
    handleCheckboxChange: useCallback((key) => (event) => {
      setParam(key, event.target.checked);
    }, [setParam]),
    
    // For select components
    handleSelectChange: useCallback((key) => (event) => {
      const value = event?.target?.value !== undefined ? event.target.value : event;
      setParam(key, value);
    }, [setParam]),
    
    // For date pickers
    handleDateChange: useCallback((key) => (date) => {
      setParam(key, date ? date.toISOString() : '');
    }, [setParam]),
  };
};

// Default parser for URL values
const defaultParser = (value) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (!isNaN(value) && value !== '') return Number(value);
  if (typeof value === 'string') {
    try {
      // Try to parse JSON strings
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
  return value;
};

export default useSearchParams;

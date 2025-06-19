import { useState, useEffect, useCallback } from 'react';
import { isClient } from '../utils/helpers';

/**
 * Custom hook for managing local storage with type safety and expiration support
 * @param {string} key - The key under which to store the value in local storage
 * @param {*} initialValue - The initial value to use if no value exists in local storage
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.sync=true] - Whether to sync the value across browser tabs
 * @param {number} [options.expireIn] - Time in milliseconds after which the value expires
 * @returns {[any, (value: any) => void, () => void]} The stored value, setter function, and remove function
 */
const useLocalStorage = (key, initialValue, { 
  sync = true,
  expireIn 
} = {}) => {
  // Get initial value from localStorage if it exists
  const getStoredValue = useCallback(() => {
    if (!isClient) return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      
      if (!item) return initialValue;
      
      const parsed = JSON.parse(item);
      
      // Check if the value has expired
      if (parsed?.expiresAt && new Date().getTime() > parsed.expiresAt) {
        window.localStorage.removeItem(key);
        return initialValue;
      }
      
      return parsed.value !== undefined ? parsed.value : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  // State to store our value
  const [storedValue, setStoredValue] = useState(getStoredValue);

  // Set a new value in localStorage and update state
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Update state
      setStoredValue(valueToStore);
      
      if (!isClient) return;
      
      // Prepare the value with optional expiration
      const valueWithExpiration = {
        value: valueToStore,
        ...(expireIn && { 
          expiresAt: new Date().getTime() + expireIn 
        })
      };
      
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueWithExpiration));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue, expireIn]);

  // Remove the value from localStorage and reset to initial value
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      
      if (!isClient) return;
      
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Handle storage events to sync across tabs
  useEffect(() => {
    if (!isClient || !sync) return;

    const handleStorageChange = (event) => {
      if (event.key === key && event.newValue !== event.oldValue) {
        try {
          const newValue = event.newValue ? JSON.parse(event.newValue) : initialValue;
          setStoredValue(newValue?.value || initialValue);
        } catch (error) {
          console.warn(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue, sync]);

  // Initialize with the value from localStorage on mount
  useEffect(() => {
    if (isClient) {
      setStoredValue(getStoredValue());
    }
  }, [getStoredValue]);

  return [storedValue, setValue, removeValue];
};

export default useLocalStorage;

/**
 * Pre-configured hook for storing and retrieving theme preference
 */
export const useThemePreference = (defaultTheme = 'light') => {
  return useLocalStorage('theme-preference', defaultTheme, { sync: true });
};

/**
 * Pre-configured hook for storing and retrieving user preferences
 */
export const useUserPreferences = (defaultPreferences = {}) => {
  return useLocalStorage('user-preferences', defaultPreferences, { sync: true });
};

/**
 * Pre-configured hook for storing and retrieving authentication tokens
 */
export const useAuthToken = () => {
  return useLocalStorage('auth-token', null, { 
    sync: false, // Don't sync auth tokens across tabs for security
    expireIn: 24 * 60 * 60 * 1000, // 24 hours
  });
};

/**
 * Pre-configured hook for storing and retrieving recent searches
 */
export const useRecentSearches = (maxItems = 5) => {
  const [searches, setSearches, clearSearches] = useLocalStorage('recent-searches', [], { sync: true });
  
  const addSearch = useCallback((searchTerm) => {
    if (!searchTerm?.trim()) return;
    
    setSearches((prevSearches = []) => {
      // Remove duplicate search terms
      const filtered = prevSearches.filter(item => 
        item.term.toLowerCase() !== searchTerm.toLowerCase()
      );
      
      // Add new search to the beginning of the array
      const newSearches = [
        { term: searchTerm, timestamp: new Date().toISOString() },
        ...filtered
      ];
      
      // Limit the number of stored searches
      return newSearches.slice(0, maxItems);
    });
  }, [maxItems, setSearches]);
  
  return [searches || [], addSearch, clearSearches];
};

/**
 * Pre-configured hook for storing and retrieving form drafts
 */
export const useFormDraft = (formId, initialValue = {}) => {
  const [draft, setDraft, clearDraft] = useLocalStorage(
    `form-draft-${formId}`, 
    initialValue, 
    { 
      sync: true,
      expireIn: 7 * 24 * 60 * 60 * 1000, // 1 week
    }
  );
  
  return [draft, setDraft, clearDraft];
};

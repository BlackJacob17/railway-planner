import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Simple notification hook for showing toast messages
 * @returns {Object} Notification methods and state
 */
const useNotification = () => {
  const [notification, setNotification] = useState(null);
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);

  // Close the current notification
  const handleClose = useCallback(() => {
    setOpen(false);
    // Clear any pending timeout
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    // Reset notification after animation
    setTimeout(() => setNotification(null), 300);
  }, []); 

  // Show a notification
  const showNotification = useCallback(({ message, type = 'info', duration = 5000, onClose } = {}) => {
    // Clear any existing timeout
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Set the new notification
    setNotification({ message, type });
    setOpen(true);

    // Auto-hide after duration if specified
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        handleClose();
        if (onClose) onClose();
      }, duration);
    }
  }, [handleClose]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Helper methods for different notification types
  const showSuccess = useCallback((message, options) => {
    showNotification({ message, type: 'success', ...options });
  }, [showNotification]);

  const showError = useCallback((error, options) => {
    const message = error?.message || error || 'An error occurred';
    showNotification({ message, type: 'error', ...options });
  }, [showNotification]);

  const showWarning = useCallback((message, options) => {
    showNotification({ message, type: 'warning', ...options });
  }, [showNotification]);

  const showInfo = useCallback((message, options) => {
    showNotification({ message, type: 'info', ...options });
  }, [showNotification]);

  return {
    notification: {
      ...notification,
      open,
      onClose: handleClose,
      severity: notification?.type || 'info',
    },
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeNotification: handleClose,
  };
};

export default useNotification;

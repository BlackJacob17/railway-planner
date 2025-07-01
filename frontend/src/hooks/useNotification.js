import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for managing notifications (toast messages)
 * @returns {Object} Notification methods and state
 */
const useNotification = () => {
  const [notification, setNotification] = useState(null);
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);

  /**
   * Close the currently open notification
   */
  const handleClose = useCallback((event, reason) => {
    if (reason === 'clickaway' && notification?.persist) {
      return;
    }
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    setOpen(false);
    
    if (notification?.onClose) {
      notification.onClose(event, reason);
    }
    
    // Reset notification after the close animation completes
    setTimeout(() => {
      setNotification(null);
    }, 300);
  }, [notification]);



  // Auto-hide the notification after a delay
  useEffect(() => {
    if (open && notification?.autoHideDuration !== false) {
      timerRef.current = setTimeout(() => {
        handleClose();
      }, notification?.autoHideDuration || 5000);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [open, notification, handleClose]);

  /**
   * Show a success notification
   * @param {string} message - The message to display
   * @param {Object} [options] - Additional options
   */
  const showSuccess = useCallback((message, options = {}) => {
    showNotification({
      message,
      severity: 'success',
      ...options,
    });
  }, [showNotification]);

  /**
   * Show an error notification
   * @param {string|Error} error - The error message or Error object
   * @param {Object} [options] - Additional options
   */
  const showError = useCallback((error, options = {}) => {
    const message = error?.message || error || 'An unknown error occurred';
    showNotification({
      message,
      severity: 'error',
      ...options,
    });
  }, [showNotification]);

  /**
   * Show a warning notification
   * @param {string} message - The message to display
   * @param {Object} [options] - Additional options
   */
  const showWarning = useCallback((message, options = {}) => {
    showNotification({
      message,
      severity: 'warning',
      ...options,
    });
  }, [showNotification]);

  /**
   * Show an info notification
   * @param {string} message - The message to display
   * @param {Object} [options] - Additional options
   */
  const showInfo = useCallback((message, options = {}) => {
    showNotification({
      message,
      severity: 'info',
      ...options,
    });
  }, [showNotification]);

  /**
   * Show a custom notification
   * @param {Object} options - Notification options
   * @param {string} options.message - The message to display
   * @param {'success'|'error'|'warning'|'info'} [options.severity='info'] - The severity of the notification
   * @param {number|false} [options.autoHideDuration=5000] - Duration in milliseconds before the notification auto-hides, or false to disable
   * @param {React.ReactNode} [options.action] - Action element to display
   * @param {string} [options.key] - Unique key to prevent duplicate notifications
   * @param {Function} [options.onClose] - Callback when the notification is closed
   * @param {Object} [options.anchorOrigin] - Position of the notification
   * @param {boolean} [options.persist] - Whether the notification should persist (not auto-hide)
   */
  const showNotification = useCallback(({
    message,
    severity = 'info',
    autoHideDuration = 5000,
    action,
    key,
    onClose,
    anchorOrigin = { vertical: 'top', horizontal: 'right' },
    persist = false,
    ...otherOptions
  } = {}) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setNotification({
      message,
      severity,
      autoHideDuration: persist ? false : autoHideDuration,
      action,
      key: key || Date.now(),
      onClose,
      anchorOrigin,
      persist,
      ...otherOptions,
    });
    
    setOpen(true);
  }, []);



  /**
   * Clear all pending notifications
   */
  const clearAll = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    setOpen(false);
    setNotification(null);
  }, []);

  return {
    // State
    notification,
    open,
    
    // Methods
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeNotification: handleClose,
    clearAll,
    
    // Props for MUI Snackbar component
    snackbarProps: {
      open,
      onClose: handleClose,
      autoHideDuration: notification?.autoHideDuration,
      anchorOrigin: notification?.anchorOrigin || { vertical: 'top', horizontal: 'right' },
      message: notification?.message,
      action: notification?.action,
      key: notification?.key,
      ...(notification?.otherProps || {}),
    },
    
    // Props for MUI Alert component
    alertProps: notification ? {
      severity: notification.severity,
      onClose: handleClose,
      sx: { width: '100%' },
      ...(notification.alertProps || {}),
    } : null,
  };
};

export default useNotification;

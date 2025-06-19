import { useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNotification } from './useNotification';

/**
 * Custom hook for handling form submissions with loading states, error handling, and notifications
 * @param {Object} options - Configuration options
 * @param {Function} options.submitFn - The function to call when the form is submitted
 * @param {string} [options.successMessage] - Success message to show on successful submission
 * @param {string} [options.errorMessage] - Error message to show on submission failure (default: "An error occurred")
 * @param {Function} [options.onSuccess] - Callback function called after successful submission
 * @param {Function} [options.onError] - Callback function called after submission error
 * @param {boolean} [options.showSuccess=true] - Whether to show success notifications
 * @param {boolean} [options.showError=true] - Whether to show error notifications
 * @returns {Object} Form submission handler and state
 */
const useFormSubmit = ({
  submitFn,
  successMessage = 'Operation completed successfully',
  errorMessage = 'An error occurred',
  onSuccess,
  onError,
  showSuccess = true,
  showError = true,
} = {}) => {
  const dispatch = useDispatch();
  const { showSuccess: showSuccessNotification, showError: showErrorNotification } = useNotification();
  const isMounted = useRef(true);
  
  // Set up cleanup on unmount
  const cleanup = useCallback(() => {
    isMounted.current = false;
  }, []);
  
  // Form submission handler
  const handleSubmit = useCallback(
    async (values, formikHelpers) => {
      if (!submitFn) {
        console.error('No submit function provided to useFormSubmit');
        return;
      }
      
      const { setSubmitting, setStatus, setErrors, resetForm } = formikHelpers || {};
      
      try {
        // Set form as submitting
        if (setSubmitting) setSubmitting(true);
        if (setStatus) setStatus({ isSubmitting: true });
        
        // Call the provided submit function
        const result = await submitFn(values, { dispatch });
        
        // Only update state if component is still mounted
        if (isMounted.current) {
          // Show success notification if enabled
          if (showSuccess && successMessage) {
            showSuccessNotification(successMessage);
          }
          
          // Call success callback if provided
          if (onSuccess) {
            onSuccess(result, { values, resetForm });
          }
          
          // Reset form if resetForm is available
          if (resetForm) {
            resetForm();
          }
          
          return { success: true, data: result };
        }
      } catch (error) {
        console.error('Form submission error:', error);
        
        // Only update state if component is still mounted
        if (isMounted.current) {
          // Show error notification if enabled
          if (showError) {
            const errorMsg = error?.response?.data?.message || errorMessage;
            showErrorNotification(errorMsg);
          }
          
          // Set form errors if available in the error response
          if (error?.response?.data?.errors && setErrors) {
            setErrors(error.response.data.errors);
          }
          
          // Call error callback if provided
          if (onError) {
            onError(error, { values });
          }
          
          return { success: false, error };
        }
      } finally {
        // Only update state if component is still mounted
        if (isMounted.current && setSubmitting) {
          setSubmitting(false);
        }
        if (isMounted.current && setStatus) {
          setStatus(prev => ({ ...prev, isSubmitting: false }));
        }
      }
    },
    [
      submitFn, 
      successMessage, 
      errorMessage, 
      showSuccess, 
      showError, 
      onSuccess, 
      onError, 
      dispatch, 
      showSuccessNotification, 
      showErrorNotification
    ]
  );
  
  // Return the form submission handler and any additional methods
  return {
    handleSubmit,
    cleanup,
  };
};

export default useFormSubmit;

/**
 * Higher-order function that creates a pre-configured useFormSubmit hook
 * @param {Object} defaultOptions - Default options for the hook
 * @returns {Function} A custom hook with the default options pre-configured
 */
useFormSubmit.create = (defaultOptions = {}) => {
  return (options = {}) => {
    return useFormSubmit({ ...defaultOptions, ...options });
  };
};

/**
 * Pre-configured hook for create operations
 */
export const useCreateSubmit = (options = {}) => {
  return useFormSubmit({
    successMessage: 'Successfully created!',
    errorMessage: 'Failed to create. Please try again.',
    ...options,
  });
};

/**
 * Pre-configured hook for update operations
 */
export const useUpdateSubmit = (options = {}) => {
  return useFormSubmit({
    successMessage: 'Successfully updated!',
    errorMessage: 'Failed to update. Please try again.',
    ...options,
  });
};

/**
 * Pre-configured hook for delete operations
 */
export const useDeleteSubmit = (options = {}) => {
  return useFormSubmit({
    successMessage: 'Successfully deleted!',
    errorMessage: 'Failed to delete. Please try again.',
    showSuccess: false, // Often handled by the parent component
    ...options,
  });
};

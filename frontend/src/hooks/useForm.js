import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { validationSchemas } from '../utils/validations';

/**
 * Custom hook for handling form state and validation
 * @param {Object} options - Form configuration options
 * @param {Object} options.initialValues - Initial form values
 * @param {Object|Function} options.validationSchema - Yup validation schema or a function that returns a schema
 * @param {Function} options.onSubmit - Form submission handler
 * @param {Function} [options.onSuccess] - Callback for successful form submission
 * @param {Function} [options.onError] - Callback for form submission error
 * @param {boolean} [options.enableReinitialize=false] - Whether to reinitialize the form when initialValues change
 * @param {boolean} [options.validateOnMount=false] - Whether to validate the form on mount
 * @returns {Object} Formik form object with additional helper methods
 */
const useForm = ({
  initialValues,
  validationSchema,
  onSubmit,
  onSuccess,
  onError,
  enableReinitialize = false,
  validateOnMount = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Resolve the validation schema (can be a function or object)
  const getValidationSchema = () => {
    if (!validationSchema) return undefined;
    
    if (typeof validationSchema === 'function') {
      return validationSchema(validationSchemas, Yup);
    }
    
    return validationSchema;
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      const result = await onSubmit(values, { setSubmitting, resetForm, setErrors });
      
      if (onSuccess) {
        onSuccess(result, { resetForm });
      }
      
      return result;
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Handle API validation errors (e.g., 422 Unprocessable Entity)
      if (error.errors) {
        // Convert array of errors to Formik format
        const formikErrors = error.errors.reduce((acc, err) => {
          acc[err.field] = err.message;
          return acc;
        }, {});
        setErrors(formikErrors);
      } else {
        // Handle other errors
        const errorMessage = error.message || 'An error occurred while submitting the form';
        setSubmitError(errorMessage);
        
        if (onError) {
          onError(error);
        }
      }
      
      throw error;
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  // Initialize Formik
  const formik = useFormik({
    initialValues,
    validationSchema: getValidationSchema(),
    onSubmit: handleSubmit,
    enableReinitialize,
    validateOnMount,
  });

  /**
   * Reset the form to its initial values
   */
  const resetForm = () => {
    formik.resetForm();
    setSubmitError(null);
  };

  /**
   * Set a form field value and optionally validate it
   * @param {string} field - Field name
   * @param {*} value - Field value
   * @param {boolean} [shouldValidate=true] - Whether to validate the field after setting the value
   */
  const setFieldValue = (field, value, shouldValidate = true) => {
    formik.setFieldValue(field, value, shouldValidate);
  };

  /**
   * Set multiple form field values
   * @param {Object} values - Object of field names and values
   * @param {boolean} [shouldValidate=true] - Whether to validate the form after setting the values
   */
  const setValues = (values, shouldValidate = true) => {
    formik.setValues(values, shouldValidate);
  };

  /**
   * Set a form field error
   * @param {string} field - Field name
   * @param {string} message - Error message
   */
  const setFieldError = (field, message) => {
    formik.setFieldError(field, message);
  };

  /**
   * Set multiple form field errors
   * @param {Object} errors - Object of field names and error messages
   */
  const setErrors = (errors) => {
    formik.setErrors(errors);
  };

  /**
   * Validate the entire form or specific fields
   * @param {string[]} [fields] - Optional array of field names to validate
   */
  const validateForm = (fields) => {
    return formik.validateForm(fields);
  };

  /**
   * Check if the form has any errors
   * @returns {boolean} Whether the form has any errors
   */
  const hasErrors = () => {
    return Object.keys(formik.errors).length > 0;
  };

  /**
   * Get the error message for a specific field
   * @param {string} field - Field name
   * @returns {string|undefined} Error message or undefined if no error
   */
  const getFieldError = (field) => {
    return formik.touched[field] && formik.errors[field];
  };

  /**
   * Check if a field has been touched and has an error
   * @param {string} field - Field name
   * @returns {boolean} Whether the field has an error and has been touched
   */
  const hasFieldError = (field) => {
    return !!(formik.touched[field] && formik.errors[field]);
  };

  // Enhanced formik object with additional helper methods
  return {
    ...formik,
    isSubmitting: isSubmitting || formik.isSubmitting,
    submitError,
    setFieldValue,
    setValues,
    setFieldError,
    setErrors,
    resetForm,
    validateForm,
    hasErrors,
    getFieldError,
    hasFieldError,
  };
};

export default useForm;

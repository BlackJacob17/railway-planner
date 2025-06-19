import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useCallback, useMemo } from 'react';
import { useNotification } from './useNotification';

/**
 * Custom hook for handling form validation with Yup and Formik
 * @param {Object} options - Form configuration options
 * @param {Object} options.initialValues - Initial form values
 * @param {Object|Function} options.validationSchema - Yup validation schema or a function that returns a schema
 * @param {Function} options.onSubmit - Form submission handler
 * @param {Function} [options.onSuccess] - Callback for successful form submission
 * @param {Function} [options.onError] - Callback for form submission error
 * @param {boolean} [options.enableReinitialize=false] - Whether to reinitialize the form when initialValues change
 * @param {boolean} [options.validateOnMount=false] - Whether to validate the form on mount
 * @param {Object} [options.formikOptions] - Additional Formik options
 * @returns {Object} Formik form object with additional helper methods
 */
const useFormValidation = ({
  initialValues,
  validationSchema,
  onSubmit,
  onSuccess,
  onError,
  enableReinitialize = false,
  validateOnMount = false,
  formikOptions = {},
}) => {
  const { showError } = useNotification();
  
  // Memoize the validation schema to prevent unnecessary recalculations
  const memoizedValidationSchema = useMemo(() => {
    if (!validationSchema) return undefined;
    
    if (typeof validationSchema === 'function') {
      return validationSchema(Yup);
    }
    
    return validationSchema;
  }, [validationSchema]);
  
  // Handle form submission
  const handleSubmit = useCallback(async (values, formikHelpers) => {
    try {
      const result = await onSubmit(values, formikHelpers);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result, { values, formikHelpers });
      }
      
      return result;
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Handle API validation errors (e.g., 422 Unprocessable Entity)
      if (error.response?.data?.errors) {
        // Convert array of errors to Formik format
        const formikErrors = error.response.data.errors.reduce((acc, err) => {
          acc[err.field] = err.message;
          return acc;
        }, {});
        
        formikHelpers.setErrors(formikErrors);
      } else {
        // Show generic error message
        showError(error.response?.data?.message || 'An error occurred while submitting the form');
      }
      
      // Call error callback if provided
      if (onError) {
        onError(error, { values, formikHelpers });
      }
      
      // Re-throw the error to allow the form to handle it
      throw error;
    }
  }, [onSubmit, onSuccess, onError, showError]);
  
  // Initialize Formik
  const formik = useFormik({
    initialValues,
    validationSchema: memoizedValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize,
    validateOnMount,
    ...formikOptions,
  });
  
  // Helper method to check if a field has an error and has been touched
  const hasError = useCallback((fieldName) => {
    return !!(formik.touched[fieldName] && formik.errors[fieldName]);
  }, [formik.touched, formik.errors]);
  
  // Helper method to get the error message for a field
  const getError = useCallback((fieldName) => {
    return hasError(fieldName) ? formik.errors[fieldName] : undefined;
  }, [hasError, formik.errors]);
  
  // Helper method to get field props for MUI components
  const getFieldProps = useCallback((fieldName) => ({
    name: fieldName,
    value: formik.values[fieldName] ?? '',
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: hasError(fieldName),
    helperText: getError(fieldName),
  }), [formik.values, formik.handleChange, formik.handleBlur, hasError, getError]);
  
  // Helper method to get checkbox props for MUI components
  const getCheckboxProps = useCallback((fieldName) => ({
    name: fieldName,
    checked: !!formik.values[fieldName],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  }), [formik.values, formik.handleChange, formik.handleBlur]);
  
  // Helper method to get radio group props for MUI components
  const getRadioGroupProps = useCallback((fieldName) => ({
    name: fieldName,
    value: formik.values[fieldName] ?? '',
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  }), [formik.values, formik.handleChange, formik.handleBlur]);
  
  // Helper method to get select props for MUI components
  const getSelectProps = useCallback((fieldName) => ({
    name: fieldName,
    value: formik.values[fieldName] ?? '',
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: hasError(fieldName),
    helperText: getError(fieldName),
  }), [formik.values, formik.handleChange, formik.handleBlur, hasError, getError]);
  
  // Helper method to manually set field value with validation
  const setFieldValue = useCallback((fieldName, value, shouldValidate = true) => {
    formik.setFieldValue(fieldName, value, shouldValidate);
  }, [formik.setFieldValue]);
  
  // Helper method to manually set field touched with validation
  const setFieldTouched = useCallback((fieldName, isTouched = true, shouldValidate = true) => {
    formik.setFieldTouched(fieldName, isTouched, shouldValidate);
  }, [formik.setFieldTouched]);
  
  // Helper method to manually set field error
  const setFieldError = useCallback((fieldName, message) => {
    formik.setFieldError(fieldName, message);
  }, [formik.setFieldError]);
  
  // Helper method to reset the form
  const resetForm = useCallback((values) => {
    formik.resetForm(values);
  }, [formik.resetForm]);
  
  // Return the formik object with additional helper methods
  return {
    // Formik props and methods
    ...formik,
    
    // Helper methods
    hasError,
    getError,
    getFieldProps,
    getCheckboxProps,
    getRadioGroupProps,
    getSelectProps,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    resetForm,
    
    // Alias for formik.values
    values: formik.values,
    
    // Alias for formik.errors
    errors: formik.errors,
    
    // Alias for formik.touched
    touched: formik.touched,
    
    // Alias for formik.isSubmitting
    isSubmitting: formik.isSubmitting,
    
    // Alias for formik.isValid
    isValid: formik.isValid,
    
    // Alias for formik.dirty
    isDirty: formik.dirty,
    
    // Alias for formik.handleSubmit
    submitForm: formik.handleSubmit,
    
    // Alias for formik.handleChange
    handleInputChange: formik.handleChange,
  };
};

export default useFormValidation;

/**
 * Creates a validation schema for a form field
 * @param {Object} field - Field configuration
 * @param {string} field.type - Field type ('text', 'email', 'password', 'number', 'url', 'date', 'time', 'datetime-local', 'tel')
 * @param {boolean} [field.required] - Whether the field is required
 * @param {number} [field.minLength] - Minimum length for text fields
 * @param {number} [field.maxLength] - Maximum length for text fields
 * @param {number} [field.min] - Minimum value for number fields
 * @param {number} [field.max] - Maximum value for number fields
 * @param {string} [field.pattern] - Regex pattern for validation
 * @param {string} [field.patternMessage] - Error message for pattern validation
 * @param {string} [field.emailMessage] - Custom email validation message
 * @param {string} [field.urlMessage] - Custom URL validation message
 * @param {string} [field.requiredMessage] - Custom required message
 * @param {Function} [field.validate] - Custom validation function
 * @returns {Yup.StringSchema|Yup.NumberSchema} Yup validation schema
 */
useFormValidation.createFieldSchema = (field) => {
  const {
    type = 'text',
    required = false,
    minLength,
    maxLength,
    min,
    max,
    pattern,
    patternMessage,
    emailMessage = 'Please enter a valid email address',
    urlMessage = 'Please enter a valid URL',
    requiredMessage = 'This field is required',
    validate,
  } = field;
  
  let schema;
  
  // Create base schema based on field type
  switch (type) {
    case 'email':
      schema = Yup.string().email(emailMessage);
      break;
      
    case 'url':
      schema = Yup.string().url(urlMessage);
      break;
      
    case 'number':
      schema = Yup.number();
      if (min !== undefined) schema = schema.min(min, `Must be at least ${min}`);
      if (max !== undefined) schema = schema.max(max, `Must be at most ${max}`);
      break;
      
    case 'date':
    case 'time':
    case 'datetime-local':
      schema = Yup.date();
      if (min) schema = schema.min(new Date(min), `Date must be after ${new Date(min).toLocaleDateString()}`);
      if (max) schema = schema.max(new Date(max), `Date must be before ${new Date(max).toLocaleDateString()}`);
      break;
      
    case 'tel':
      schema = Yup.string().matches(
        /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
        'Please enter a valid phone number'
      );
      break;
      
    default:
      schema = Yup.string();
  }
  
  // Add common validations
  if (required) {
    schema = schema.required(requiredMessage);
  }
  
  if (minLength !== undefined) {
    schema = schema.min(minLength, `Must be at least ${minLength} characters`);
  }
  
  if (maxLength !== undefined) {
    schema = schema.max(maxLength, `Must be at most ${maxLength} characters`);
  }
  
  if (pattern) {
    schema = schema.matches(
      new RegExp(pattern),
      patternMessage || 'Invalid format'
    );
  }
  
  // Add custom validation if provided
  if (typeof validate === 'function') {
    schema = schema.test('custom', 'Invalid value', validate);
  }
  
  return schema;
};

/**
 * Creates a validation schema for a form
 * @param {Object} fields - Object mapping field names to field configurations
 * @returns {Yup.ObjectSchema} Yup validation schema for the form
 */
useFormValidation.createSchema = (fields) => {
  const schema = {};
  
  Object.keys(fields).forEach((fieldName) => {
    const field = fields[fieldName];
    schema[fieldName] = useFormValidation.createFieldSchema(field);
  });
  
  return Yup.object().shape(schema);
};

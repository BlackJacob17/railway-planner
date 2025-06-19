import * as yup from 'yup';
import { isValidEmail, isValidPassword } from './helpers';

// Common validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  PASSWORD: 'Password must be at least 8 characters long and contain at least one letter and one number',
  CONFIRM_PASSWORD: 'Passwords must match',
  PHONE: 'Please enter a valid phone number',
  NUMBER: 'Must be a valid number',
  POSITIVE: 'Must be a positive number',
  INTEGER: 'Must be an integer',
  MIN_LENGTH: (min) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max) => `Must be ${max} characters or less`,
  MIN_VALUE: (min) => `Must be at least ${min}`,
  MAX_VALUE: (max) => `Must be ${max} or less`,
};

// Common validation schemas
export const commonSchemas = {
  email: yup
    .string()
    .required(VALIDATION_MESSAGES.REQUIRED)
    .test('is-email', VALIDATION_MESSAGES.EMAIL, (value) => 
      isValidEmail(value)
    ),
    
  password: yup
    .string()
    .required(VALIDATION_MESSAGES.REQUIRED)
    .test('is-valid-password', VALIDATION_MESSAGES.PASSWORD, (value) => 
      isValidPassword(value)
    ),
    
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], VALIDATION_MESSAGES.CONFIRM_PASSWORD)
    .required(VALIDATION_MESSAGES.REQUIRED),
    
  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required(VALIDATION_MESSAGES.REQUIRED),
    
  requiredString: (fieldName) =>
    yup.string().required(`${fieldName} is required`),
    
  requiredNumber: (fieldName) =>
    yup.number().required(`${fieldName} is required`).typeError('Must be a number'),
    
  positiveNumber: (fieldName) =>
    yup
      .number()
      .positive(`${fieldName} must be positive`)
      .required(`${fieldName} is required`)
      .typeError('Must be a number'),
      
  integer: (fieldName) =>
    yup
      .number()
      .integer(`${fieldName} must be an integer`)
      .required(`${fieldName} is required`)
      .typeError('Must be a number'),
};

// Form validation schemas
export const validationSchemas = {
  // Auth forms
  login: yup.object().shape({
    email: commonSchemas.email,
    password: yup.string().required(VALIDATION_MESSAGES.REQUIRED),
  }),
  
  register: yup.object().shape({
    name: yup.string().required('Name is required'),
    email: commonSchemas.email,
    password: commonSchemas.password,
    confirmPassword: commonSchemas.confirmPassword,
    phone: commonSchemas.phone,
  }),
  
  // Station forms
  station: yup.object().shape({
    code: yup
      .string()
      .required('Station code is required')
      .max(5, 'Station code must be 5 characters or less')
      .matches(/^[A-Z0-9]+$/, 'Only uppercase letters and numbers allowed'),
    name: yup.string().required('Station name is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    zone: yup.string().required('Zone is required'),
    latitude: yup
      .number()
      .required('Latitude is required')
      .min(-90, 'Latitude must be between -90 and 90')
      .max(90, 'Latitude must be between -90 and 90'),
    longitude: yup
      .number()
      .required('Longitude is required')
      .min(-180, 'Longitude must be between -180 and 180')
      .max(180, 'Longitude must be between -180 and 180'),
  }),
  
  // Train forms
  train: yup.object().shape({
    number: yup
      .string()
      .required('Train number is required')
      .matches(/^[0-9]+$/, 'Train number must contain only digits'),
    name: yup.string().required('Train name is required'),
    type: yup.string().required('Train type is required'),
    source: yup.string().required('Source station is required'),
    destination: yup.string().required('Destination station is required'),
    departureTime: yup.string().required('Departure time is required'),
    arrivalTime: yup.string().required('Arrival time is required'),
    duration: yup.number().required('Duration is required').positive('Duration must be positive'),
    distance: yup.number().required('Distance is required').positive('Distance must be positive'),
    classes: yup
      .array()
      .of(
        yup.object().shape({
          class: yup.string().required('Class is required'),
          fare: yup.number().required('Fare is required').min(0, 'Fare cannot be negative'),
          seats: yup.number().required('Seats are required').min(0, 'Seats cannot be negative'),
        })
      )
      .min(1, 'At least one class must be added'),
    runningDays: yup
      .array()
      .of(yup.boolean())
      .test('at-least-one-day', 'At least one day must be selected', (value) =>
        value.some((day) => day)
      ),
  }),
  
  // Booking forms
  passengerDetails: yup.object().shape({
    passengers: yup
      .array()
      .of(
        yup.object().shape({
          name: yup.string().required('Passenger name is required'),
          age: yup
            .number()
            .required('Age is required')
            .positive('Age must be positive')
            .integer('Age must be an integer')
            .max(120, 'Age must be 120 or less'),
          gender: yup.string().required('Gender is required'),
          berthPreference: yup.string().nullable(),
        })
      )
      .min(1, 'At least one passenger is required'),
    contactInfo: yup.object().shape({
      name: yup.string().required('Contact name is required'),
      email: commonSchemas.email,
      phone: commonSchemas.phone,
    }),
  }),
  
  // Review forms
  review: yup.object().shape({
    rating: yup
      .number()
      .required('Rating is required')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating cannot be more than 5'),
    title: yup.string().required('Title is required').max(100, 'Title is too long'),
    comment: yup.string().required('Comment is required').max(1000, 'Comment is too long'),
    journeyDate: yup.date().required('Journey date is required').max(new Date(), 'Journey date cannot be in the future'),
  }),
};

// Custom validation functions
export const validateFile = (file, options = {}) => {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png'] } = options;
  
  if (!file) return 'File is required';
  if (file.size > maxSize) return `File size must be less than ${maxSize / (1024 * 1024)}MB`;
  if (!allowedTypes.includes(file.type)) return `File type must be one of: ${allowedTypes.join(', ')}`;
  return null;
};

export const validateDateRange = (startDateField, endDateField) => {
  return function (this, value) {
    const startDate = this.parent[startDateField];
    const endDate = this.parent[endDateField];
    
    if (!startDate || !endDate) return true;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      return this.createError({
        path: endDateField,
        message: 'End date must be after start date',
      });
    }
    
    return true;
  };
};

export default {
  ...commonSchemas,
  ...validationSchemas,
  validateFile,
  validateDateRange,
  VALIDATION_MESSAGES,
};

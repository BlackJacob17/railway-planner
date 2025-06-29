/**
 * Application-wide constants
 */

// User roles with their IDs and names
// These should match the roles defined in the backend
const ROLES = {
  // Role IDs
  ADMIN: 'admin',
  USER: 'user',
  AGENT: 'agent',
  
  // Role names (for display)
  ROLE_NAMES: {
    admin: 'Administrator',
    user: 'Passenger',
    agent: 'Booking Agent',
  },
  
  // Role hierarchy (lower index = higher privilege)
  HIERARCHY: ['admin', 'agent', 'user'],
};

// API endpoints
const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/refresh-token',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    ME: '/api/auth/me',
  },
  USERS: {
    BASE: '/api/users',
    PROFILE: '/api/users/profile',
    CHANGE_PASSWORD: '/api/users/change-password',
  },
  TRAINS: {
    BASE: '/api/trains',
    SEARCH: '/api/trains/search',
    AVAILABILITY: '/api/trains/availability',
  },
  STATIONS: {
    BASE: '/api/stations',
  },
  BOOKINGS: {
    BASE: '/api/bookings',
    MY_BOOKINGS: '/api/bookings/my-bookings',
    CANCEL: (id) => `/api/bookings/${id}/cancel`,
  },
  REVIEWS: {
    BASE: '/api/reviews',
    TRAIN_REVIEWS: (trainId) => `/api/reviews/train/${trainId}`,
  },
};

// Local storage keys
const STORAGE_KEYS = {
  AUTH: 'railway_auth',
  THEME: 'railway_theme',
  REDIRECT_PATH: 'railway_redirect_path',
};

// Date and time formats
const DATE_FORMATS = {
  DATE: 'yyyy-MM-dd',
  TIME: 'HH:mm',
  DATETIME: 'yyyy-MM-dd HH:mm',
  DISPLAY_DATE: 'MMM d, yyyy',
  DISPLAY_TIME: 'h:mm a',
  DISPLAY_DATETIME: 'MMM d, yyyy h:mm a',
};

// Pagination defaults
const PAGINATION = {
  PAGE_SIZE: 10,
  PAGE_SIZES: [10, 25, 50, 100],
};

// Validation constants
const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 30,
    REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/,
    MESSAGE: 'Password must be 8-30 characters long, include uppercase, lowercase, number and special character',
  },
  EMAIL: {
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Please enter a valid email address',
  },
  PHONE: {
    REGEX: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,15}$/,
    MESSAGE: 'Please enter a valid phone number',
  },
};

// Seat types and classes
const SEAT_TYPES = {
  SL: { 
    code: 'SL', 
    name: 'Sleeper Class', 
    description: 'Basic sleeper class with berths',
    amenities: ['Bedding', 'Reading Light', 'Charging Point'],
  },
  '3A': { 
    code: '3A', 
    name: 'AC 3-Tier', 
    description: 'Air-conditioned 3-tier sleeper',
    amenities: ['AC', 'Bedding', 'Curtains', 'Reading Light', 'Charging Point'],
  },
  '2A': { 
    code: '2A', 
    name: 'AC 2-Tier', 
    description: 'Air-conditioned 2-tier sleeper',
    amenities: ['AC', 'Bedding', 'Curtains', 'Reading Light', 'Charging Point', 'Meals'],
  },
  '1A': { 
    code: '1A', 
    name: 'First Class AC', 
    description: 'First class air-conditioned',
    amenities: ['AC', 'Luxury Bedding', 'Personal Reading Light', 'Charging Point', 'Meals', 'Priority Service'],
  },
  CC: { 
    code: 'CC', 
    name: 'Chair Car', 
    description: 'Air-conditioned chair car',
    amenities: ['AC', 'Reclining Seats', 'Charging Point'],
  },
};

// Booking statuses
const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// Payment methods
const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  NET_BANKING: 'net_banking',
  UPI: 'upi',
  WALLET: 'wallet',
  CASH: 'cash',
};

// Theme settings
const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

export {
  ROLES,
  API_ENDPOINTS,
  STORAGE_KEYS,
  DATE_FORMATS,
  PAGINATION,
  VALIDATION,
  SEAT_TYPES,
  BOOKING_STATUS,
  PAYMENT_METHODS,
  THEME,
};

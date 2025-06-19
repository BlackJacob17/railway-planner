import axios from 'axios';
import { getAuthToken } from '../utils/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies, authorization headers with HTTPS
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for API calls
api.interceptors.request.use(
  async (config) => {
    const requestDetails = {
      method: config.method?.toUpperCase(),
      url: config.url,
      params: config.params,
      data: config.data,
      headers: {
        ...config.headers,
        // Don't log the full auth token for security
        Authorization: config.headers.Authorization ? 'Bearer [TOKEN]' : undefined
      }
    };
    
    console.log('[API] Request:', requestDetails);
    
    // Get token from storage
    const token = getAuthToken();
    
    // If token exists, add it to the headers
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    const { response } = error;
    const status = response?.status;
    const data = response?.data;

    // Log detailed error information
    const errorDetails = {
      message: error.message,
      status,
      statusText: response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      requestData: error.config?.data,
      response: data,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    };
    
    console.error('[API] Error:', errorDetails);
    
    // Handle 401 Unauthorized
    if (status === 401) {
      console.warn('[API] Unauthorized - clearing auth data');
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        console.log('[API] Redirecting to login page');
        window.location.href = '/login';
      }
    }
    
    // Create a more informative error
    const errorMessage = data?.message || error.message || 'An error occurred';
    const apiError = new Error(errorMessage);
    apiError.status = status;
    apiError.statusText = response?.statusText;
    apiError.response = data;
    apiError.config = error.config;
    
    return Promise.reject(apiError);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh-token'),
  logout: () => api.post('/auth/logout'),
};

// Stations API
export const stationsAPI = {
  getStations: (params) => api.get('/stations', { params }),
  getStation: (id) => api.get(`/stations/${id}`),
  getNearbyStations: (params) => api.get('/stations/nearby', { params }),
  createStation: (data) => api.post('/stations', data),
  updateStation: (id, data) => api.put(`/stations/${id}`, data),
  deleteStation: (id) => api.delete(`/stations/${id}`),
};

// Trains API
export const trainsAPI = {
  getTrains: (params) => api.get('/trains', { params }),
  getTrain: (id) => api.get(`/trains/${id}`),
  searchTrains: (params) => api.get('/trains/search', { params }),
  getAvailableSeats: (id, params) => api.get(`/trains/${id}/seats`, { params }),
  createTrain: (data) => api.post('/trains', data),
  updateTrain: (id, data) => api.put(`/trains/${id}`, data),
  deleteTrain: (id) => api.delete(`/trains/${id}`),
};

// Bookings API
export const bookingsAPI = {
  // Get all bookings for the current user
  getBookings: async () => {
    try {
      const response = await api.get('/bookings');
      console.log('Raw bookings response:', response);
      return response;
    } catch (error) {
      console.error('Error in getBookings:', error);
      throw error;
    }
  },
  // Get a specific booking by ID
  getBooking: (id) => api.get(`/bookings/${id}`),
  // Get booking by PNR
  getBookingByPNR: (pnr) => api.get(`/bookings/pnr/${pnr}`),
  // Create a new booking
  createBooking: (data) => api.post('/bookings', data),
  // Cancel a booking
  cancelBooking: (id) => api.put(`/bookings/${id}/cancel`),
  // Admin only - Get all bookings
  getAllBookings: (params) => api.get('/admin/bookings', { params }),
  // Get booking details with all related data
  getBookingDetails: (id) => api.get(`/bookings/${id}/details`),
  // Download booking ticket
  downloadTicket: (id) => api.get(`/bookings/${id}/ticket`, { responseType: 'blob' }),
};

// Reviews API
export const reviewsAPI = {
  getTrainReviews: (trainId, params) => api.get(`/reviews/train/${trainId}`, { params }),
  createReview: (data) => api.post('/reviews', data),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  toggleLike: (id) => api.put(`/reviews/${id}/like`),
  toggleDislike: (id) => api.put(`/reviews/${id}/dislike`),
  searchReviews: (keyword, params) => api.get('/reviews/search', { params: { keyword, ...params } }),
};

export default api;

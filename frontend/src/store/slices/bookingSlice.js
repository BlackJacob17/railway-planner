import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingsAPI, trainsAPI } from '../../services/api';

// Helper function to calculate duration between two times
const calculateDuration = (departure, arrival) => {
  const dep = new Date(departure);
  const arr = new Date(arrival);
  const diffMs = arr - dep;
  
  if (isNaN(diffMs)) return 'N/A';
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
};

// Async thunks
export const getTrainDetails = createAsyncThunk(
  'bookings/getTrainDetails',
  async (trainId, { rejectWithValue }) => {
    if (!trainId) {
      return rejectWithValue('No train ID provided');
    }
    
    try {
      console.log(`Fetching train details for ID: ${trainId}`);
      const response = await trainsAPI.getTrain(trainId);
      console.log('Train API response:', response);
      
      // Log the full response for debugging
      console.log('Full train API response:', response);
      
      // The response might be in response.data or response.data.data
      const trainData = response.data?.data || response.data;
      
      if (!trainData) {
        console.error('No train data in response:', response);
        throw new Error('No train data received');
      }
      
      // Ensure we have the required fields
      if (!trainData._id || !trainData.trainNumber) {
        console.error('Invalid train data format:', trainData);
        throw new Error('Invalid train data format received');
      }
      
      console.log('Processed train data:', trainData);
      return trainData;
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch train details';
      console.error('Error in getTrainDetails:', {
        error,
        response: error.response,
        message: errorMessage
      });
      return rejectWithValue(errorMessage);
    }
  }
);

export const getAvailableSeats = createAsyncThunk(
  'bookings/getAvailableSeats',
  async ({ trainId, date }, { rejectWithValue }) => {
    try {
      const response = await trainsAPI.getAvailableSeats(trainId, { date });
      // Handle both direct data and nested data structure
      const seatsData = response.data?.data || response.data;
      if (!seatsData) {
        throw new Error('No seats data received');
      }
      return seatsData;
    } catch (error) {
      console.error('Error in getAvailableSeats:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch available seats');
    }
  }
);

export const fetchBookings = createAsyncThunk(
  'bookings/fetchBookings',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!auth.user) {
        return rejectWithValue('User not authenticated');
      }
      
      const response = await bookingsAPI.getBookings();
      // The backend returns { success, data, count } format
      if (response.success) {
        return {
          data: response.data || [],
          count: response.count || 0,
          success: true
        };
      } else {
        return rejectWithValue(response.message || 'Failed to fetch bookings');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch bookings');
    }
  }
);

export const fetchBooking = createAsyncThunk(
  'bookings/fetchBooking',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookingsAPI.getBooking(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch booking');
    }
  }
);

export const fetchBookingByPNR = createAsyncThunk(
  'bookings/fetchBookingByPNR',
  async (pnr, { rejectWithValue }) => {
    try {
      const response = await bookingsAPI.getBookingByPNR(pnr);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch booking by PNR');
    }
  }
);

export const getBookingDetails = createAsyncThunk(
  'bookings/getBookingDetails',
  async (bookingId, { rejectWithValue }) => {
    try {
      console.log(`Fetching booking details for ID: ${bookingId}`);
      
      // First try the regular booking endpoint
      try {
        const response = await bookingsAPI.getBooking(bookingId);
        const bookingData = response.data?.data || response.data;
        
        if (bookingData) {
          console.log('Booking details:', bookingData);
          return bookingData;
        }
      } catch (firstError) {
        console.log('First attempt failed, trying details endpoint:', firstError);
        
        // If first attempt fails, try the details endpoint using the bookingsAPI
        try {
          const detailsResponse = await bookingsAPI.getBookingDetails(bookingId);
          const bookingData = detailsResponse.data?.data || detailsResponse.data;
          
          if (bookingData) {
            console.log('Booking details from details endpoint:', bookingData);
            return bookingData;
          }
        } catch (detailsError) {
          console.log('Details endpoint also failed:', detailsError);
          throw detailsError; // Re-throw to be caught by the outer catch
        }
      }
      
      throw new Error('No booking data received from any endpoint');
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch booking details';
      console.error('Error in getBookingDetails:', error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await bookingsAPI.createBooking(bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create booking');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancelBooking',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookingsAPI.cancelBooking(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to cancel booking');
    }
  }
);

// Admin only
export const fetchAllBookings = createAsyncThunk(
  'bookings/fetchAllBookings',
  async (params, { rejectWithValue }) => {
    try {
      const response = await bookingsAPI.getAllBookings(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch all bookings');
    }
  }
);

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    // Train details for booking
    train: null,
    trainLoading: false,
    trainError: null,
    
    // Available seats
    availableSeats: null,
    loadingSeats: false,
    errorSeats: null,
    
    // Booking related
    bookings: [],
    allBookings: [], // For admin
    currentBooking: null,
    loading: false,
    loadingAll: false,
    creating: false,
    error: null,
    total: 0,
    totalAll: 0,
    totalPages: 1,
    currentPage: 1,
  },
  reducers: {
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get Train Details
    builder.addCase(getTrainDetails.pending, (state) => {
      state.trainLoading = true;
      state.trainError = null;
    });
    builder.addCase(getTrainDetails.fulfilled, (state, action) => {
      state.trainLoading = false;
      console.log('Raw train data in reducer:', action.payload);
      
      try {
        // The payload should already be processed in the thunk
        const trainData = action.payload;
        
        if (!trainData) {
          console.error('No train data in action payload');
          state.trainError = 'No train data received';
          return;
        }
        
        // Ensure required fields exist
        if (!trainData._id || !trainData.trainNumber) {
          console.error('Invalid train data in payload:', trainData);
          state.trainError = 'Invalid train data format';
          return;
        }
        
        // Calculate duration if we have both times
        const duration = (trainData.departureTime && trainData.arrivalTime)
          ? calculateDuration(trainData.departureTime, trainData.arrivalTime)
          : 'N/A';
        
        state.train = {
          ...trainData,
          duration
        };
        
        console.log('Processed train data in reducer:', state.train);
        state.trainError = null; // Clear any previous errors
        
      } catch (error) {
        console.error('Error processing train data:', error);
        state.trainError = 'Failed to process train data';
        state.train = null;
      }
    });
    builder.addCase(getTrainDetails.rejected, (state, action) => {
      state.trainLoading = false;
      state.trainError = action.payload || 'Failed to load train details';
      console.error('Failed to load train details:', action.payload);
    });
    
    // Handle getBookingDetails
    builder.addCase(getBookingDetails.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.currentBooking = null;
    });
    
    builder.addCase(getBookingDetails.fulfilled, (state, action) => {
      state.loading = false;
      state.currentBooking = action.payload;
      state.error = null;
      console.log('Booking details loaded:', action.payload);
    });
    
    builder.addCase(getBookingDetails.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to load booking details';
      state.currentBooking = null;
      console.error('Failed to load booking details:', action.payload);
    });
    
    // Get Available Seats
    builder.addCase(getAvailableSeats.pending, (state) => {
      state.loadingSeats = true;
      state.errorSeats = null;
    });
    builder.addCase(getAvailableSeats.fulfilled, (state, action) => {
      state.loadingSeats = false;
      state.availableSeats = action.payload.availableSeats;
    });
    builder.addCase(getAvailableSeats.rejected, (state, action) => {
      state.loadingSeats = false;
      state.errorSeats = action.payload || 'Failed to check seat availability';
      state.availableSeats = 0;
    });
    
    // Other booking related reducers
    // Fetch User Bookings
    builder.addCase(fetchBookings.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.error = null;
    });
    builder.addCase(fetchBookings.fulfilled, (state, action) => {
      state.loading = false;
      // Handle both the new format (with data and count) and the old format (array)
      if (action.payload && typeof action.payload === 'object' && 'data' in action.payload) {
        state.bookings = action.payload.data || [];
        state.count = action.payload.count || 0;
      } else {
        // Fallback for old format (array)
        state.bookings = Array.isArray(action.payload) ? action.payload : [];
        state.count = state.bookings.length;
      }
      state.error = null;
      state.total = action.payload.total || 0;
      state.totalPages = action.payload.totalPages || 1;
      state.currentPage = action.payload.currentPage || 1;
    });
    builder.addCase(fetchBookings.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to fetch bookings';
      state.bookings = [];
      state.count = 0;
    });

    // Fetch Single Booking
    builder.addCase(fetchBooking.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchBooking.fulfilled, (state, action) => {
      state.loading = false;
      state.currentBooking = action.payload;
    });
    builder.addCase(fetchBooking.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch Booking by PNR
    builder.addCase(fetchBookingByPNR.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchBookingByPNR.fulfilled, (state, action) => {
      state.loading = false;
      state.currentBooking = action.payload;
    });
    builder.addCase(fetchBookingByPNR.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Create Booking
    builder.addCase(createBooking.pending, (state) => {
      state.creating = true;
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createBooking.fulfilled, (state, action) => {
      state.creating = false;
      state.loading = false;
      state.bookings.unshift(action.payload);
      state.total += 1;
    });
    builder.addCase(createBooking.rejected, (state, action) => {
      state.creating = false;
      state.loading = false;
      state.error = action.payload || 'Failed to create booking';
    });

    // Cancel Booking
    builder.addCase(cancelBooking.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(cancelBooking.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.bookings.findIndex(
        (booking) => booking._id === action.payload._id
      );
      if (index !== -1) {
        state.bookings[index] = action.payload;
      }
      if (state.currentBooking?._id === action.payload._id) {
        state.currentBooking = action.payload;
      }
    });
    builder.addCase(cancelBooking.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch All Bookings (Admin)
    builder.addCase(fetchAllBookings.pending, (state) => {
      state.loadingAll = true;
      state.error = null;
    });
    builder.addCase(fetchAllBookings.fulfilled, (state, action) => {
      state.loadingAll = false;
      state.allBookings = action.payload.data || [];
      state.totalAll = action.payload.total || 0;
    });
    builder.addCase(fetchAllBookings.rejected, (state, action) => {
      state.loadingAll = false;
      state.error = action.payload;
    });
  },
});

export const { clearCurrentBooking, clearError } = bookingSlice.actions;
export default bookingSlice.reducer;

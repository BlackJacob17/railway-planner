import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { bookingsAPI } from '../../services/api';

// Async thunk for fetching user's bookings
export const fetchUserBookings = createAsyncThunk(
  'bookings/fetchUserBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookingsAPI.getBookings();
      console.log('Bookings API Response:', response);
      
      // Check if the response has a data property with success flag
      if (response.data && response.data.success) {
        const { data, count, total, totalPages, currentPage } = response.data;
        return {
          data: data || [],
          count: count || 0,
          total: total || data?.length || 0,
          totalPages: totalPages || 1,
          currentPage: currentPage || 1
        };
      } else {
        return rejectWithValue(response.data?.message || 'Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch bookings. Please try again.'
      );
    }
  }
);

const initialState = {
  bookings: [],
  loading: false,
  error: null,
  count: 0,
  total: 0,
  totalPages: 1,
  currentPage: 1,
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearBookings: (state) => {
      state.bookings = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.data || [];
        state.count = action.payload.count || 0;
        state.total = action.payload.total || 0;
        state.totalPages = action.payload.totalPages || 1;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch bookings';
      });
  },
});

export const { clearBookings } = bookingsSlice.actions;
export default bookingsSlice.reducer;

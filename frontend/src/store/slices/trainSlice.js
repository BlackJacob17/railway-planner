import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { trainsAPI } from '../../services/api';

// Async thunks
export const fetchTrains = createAsyncThunk(
  'trains/fetchTrains',
  async (_, { rejectWithValue }) => {
    try {
      const response = await trainsAPI.getTrains();
      return response.data; // Return only data, not full response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch trains');
    }
  }
);

export const fetchTrain = createAsyncThunk(
  'trains/fetchTrain',
  async (id, { rejectWithValue }) => {
    try {
      const response = await trainsAPI.getTrain(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch train');
    }
  }
);

export const searchTrains = createAsyncThunk(
  'trains/searchTrains',
  async (params, { rejectWithValue }) => {
    try {
      const response = await trainsAPI.searchTrains(params);
      return response.data; // Return only data, not full response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to search trains');
    }
  }
);

export const fetchAvailableSeats = createAsyncThunk(
  'trains/fetchAvailableSeats',
  async ({ trainId, date }, { rejectWithValue }) => {
    try {
      const response = await trainsAPI.getAvailableSeats(trainId, date);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch available seats');
    }
  }
);

export const createTrain = createAsyncThunk(
  'trains/createTrain',
  async (trainData, { rejectWithValue }) => {
    try {
      const response = await trainsAPI.createTrain(trainData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create train');
    }
  }
);

export const updateTrain = createAsyncThunk(
  'trains/updateTrain',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await trainsAPI.updateTrain(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update train');
    }
  }
);

export const deleteTrain = createAsyncThunk(
  'trains/deleteTrain',
  async (id, { rejectWithValue }) => {
    try {
      await trainsAPI.deleteTrain(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete train');
    }
  }
);

const trainSlice = createSlice({
  name: 'trains',
  initialState: {
    trains: [],
    searchResults: [],
    currentTrain: null,
    availableSeats: null,
    loading: false,
    searching: false,
    error: null,
    total: 0,
    totalPages: 1,
    currentPage: 1,
  },
  reducers: {
    clearCurrentTrain: (state) => {
      state.currentTrain = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearAvailableSeats: (state) => {
      state.availableSeats = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Trains
    builder
      .addCase(fetchTrains.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrains.fulfilled, (state, action) => {
        state.loading = false;
        state.trains = action.payload?.data || [];
        state.total = action.payload?.total || 0;
        state.totalPages = action.payload?.totalPages || 1;
        state.currentPage = action.payload?.currentPage || 1;
      })
      .addCase(fetchTrains.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Train
      .addCase(createTrain.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTrain.fulfilled, (state, action) => {
        state.loading = false;
        state.trains.push(action.payload);
      })
      .addCase(createTrain.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Train
      .addCase(updateTrain.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTrain.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.trains.findIndex(train => train._id === action.payload._id);
        if (index !== -1) {
          state.trains[index] = action.payload;
        }
      })
      .addCase(updateTrain.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Train
      .addCase(deleteTrain.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTrain.fulfilled, (state, action) => {
        state.loading = false;
        state.trains = state.trains.filter(train => train._id !== action.payload);
      })
      .addCase(deleteTrain.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single Train
      .addCase(fetchTrain.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrain.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTrain = action.payload;
      })
      .addCase(fetchTrain.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Trains
      .addCase(searchTrains.pending, (state) => {
        state.searching = true;
        state.error = null;
      })
      .addCase(searchTrains.fulfilled, (state, action) => {
        state.searching = false;
        state.searchResults = action.payload?.data || [];
        state.total = action.payload?.total || 0;
        state.totalPages = action.payload?.totalPages || 1;
        state.currentPage = action.payload?.currentPage || 1;
      })
      .addCase(searchTrains.rejected, (state, action) => {
        state.searching = false;
        state.error = action.payload;
      })
      // Fetch Available Seats
      .addCase(fetchAvailableSeats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableSeats.fulfilled, (state, action) => {
        state.loading = false;
        state.availableSeats = action.payload;
      })
      .addCase(fetchAvailableSeats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Train
      .addCase(createTrain.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTrain.fulfilled, (state, action) => {
        state.loading = false;
        state.trains.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createTrain.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Train
      .addCase(updateTrain.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTrain.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.trains.findIndex(
          (train) => train._id === action.payload._id
        );
        if (index !== -1) {
          state.trains[index] = action.payload;
        }
        if (state.currentTrain?._id === action.payload._id) {
          state.currentTrain = action.payload;
        }
        // Also update in search results if exists
        const searchIndex = state.searchResults.findIndex(
          (train) => train._id === action.payload._id
        );
        if (searchIndex !== -1) {
          state.searchResults[searchIndex] = action.payload;
        }
      })
      .addCase(updateTrain.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Train
      .addCase(deleteTrain.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTrain.fulfilled, (state, action) => {
        state.loading = false;
        state.trains = state.trains.filter((train) => train._id !== action.payload);
        state.searchResults = state.searchResults.filter(
          (train) => train._id !== action.payload
        );
        state.total -= 1;
        if (state.currentTrain?._id === action.payload) {
          state.currentTrain = null;
        }
      })
      .addCase(deleteTrain.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearCurrentTrain,
  clearSearchResults,
  clearAvailableSeats,
  clearError,
} = trainSlice.actions;

export default trainSlice.reducer;

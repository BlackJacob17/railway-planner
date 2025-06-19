import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { stationsAPI } from '../../services/api';

// Async thunks
export const fetchStations = createAsyncThunk(
  'stations/fetchStations',
  async (params, { rejectWithValue }) => {
    try {
      const response = await stationsAPI.getStations(params);
      // Return only the data, not the full Axios response
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch stations');
    }
  }
);

export const fetchStation = createAsyncThunk(
  'stations/fetchStation',
  async (id, { rejectWithValue }) => {
    try {
      const response = await stationsAPI.getStation(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch station');
    }
  }
);

export const fetchNearbyStations = createAsyncThunk(
  'stations/fetchNearbyStations',
  async (params, { rejectWithValue }) => {
    try {
      const response = await stationsAPI.getNearbyStations(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch nearby stations');
    }
  }
);

export const createStation = createAsyncThunk(
  'stations/createStation',
  async (stationData, { rejectWithValue }) => {
    try {
      const response = await stationsAPI.createStation(stationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create station');
    }
  }
);

export const updateStation = createAsyncThunk(
  'stations/updateStation',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await stationsAPI.updateStation(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update station');
    }
  }
);

export const deleteStation = createAsyncThunk(
  'stations/deleteStation',
  async (id, { rejectWithValue }) => {
    try {
      await stationsAPI.deleteStation(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete station');
    }
  }
);

const stationSlice = createSlice({
  name: 'stations',
  initialState: {
    stations: [],
    currentStation: [],
    nearbyStations: [],
    loading: false,
    error: null,
    total: 0,
    totalPages: 1,
    currentPage: 1,
  },
  reducers: {
    clearCurrentStation: (state) => {
      state.currentStation = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Stations
    builder.addCase(fetchStations.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchStations.fulfilled, (state, action) => {
      state.loading = false;
      // action.payload is now the data directly, not the full response
      state.stations = action.payload?.data || [];
      state.total = action.payload?.total || 0;
      state.totalPages = action.payload?.totalPages || 1;
      state.currentPage = action.payload?.currentPage || 1;
    });
    builder.addCase(fetchStations.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch Single Station
    builder.addCase(fetchStation.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchStation.fulfilled, (state, action) => {
      state.loading = false;
      state.currentStation = action.payload;
    });
    builder.addCase(fetchStation.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch Nearby Stations
    builder.addCase(fetchNearbyStations.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchNearbyStations.fulfilled, (state, action) => {
      state.loading = false;
      state.nearbyStations = action.payload;
    });
    builder.addCase(fetchNearbyStations.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Create Station
    builder.addCase(createStation.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createStation.fulfilled, (state, action) => {
      state.loading = false;
      state.stations.unshift(action.payload);
      state.total += 1;
    });
    builder.addCase(createStation.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Update Station
    builder.addCase(updateStation.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateStation.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.stations.findIndex(
        (station) => station._id === action.payload._id
      );
      if (index !== -1) {
        state.stations[index] = action.payload;
      }
      if (state.currentStation?._id === action.payload._id) {
        state.currentStation = action.payload;
      }
    });
    builder.addCase(updateStation.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Delete Station
    builder.addCase(deleteStation.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteStation.fulfilled, (state, action) => {
      state.loading = false;
      state.stations = state.stations.filter(
        (station) => station._id !== action.payload
      );
      state.total -= 1;
      if (state.currentStation?._id === action.payload) {
        state.currentStation = null;
      }
    });
    builder.addCase(deleteStation.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { clearCurrentStation, clearError } = stationSlice.actions;
export default stationSlice.reducer;

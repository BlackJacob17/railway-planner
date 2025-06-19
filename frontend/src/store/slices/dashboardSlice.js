import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock data for the dashboard
const mockDashboardData = {
  stats: {
    totalUsers: 1245,
    activeTrains: 42,
    totalBookings: 8765,
    pendingRequests: 23
  },
  monthlyData: [
    { month: 'Jan', users: 4000, bookings: 2400, revenue: 2400 },
    { month: 'Feb', users: 3000, bookings: 1398, revenue: 2210 },
    { month: 'Mar', users: 2000, bookings: 9800, revenue: 2290 },
    { month: 'Apr', users: 2780, bookings: 3908, revenue: 2000 },
    { month: 'May', users: 1890, bookings: 4800, revenue: 2181 },
    { month: 'Jun', users: 2390, bookings: 3800, revenue: 2500 },
  ],
  recentActivities: [
    { id: 1, user: 'John Doe', action: 'created a new booking', time: '5 minutes ago', icon: 'booking' },
    { id: 2, user: 'Jane Smith', action: 'updated train schedule', time: '1 hour ago', icon: 'train' },
    { id: 3, user: 'Admin', action: 'added a new user', time: '2 hours ago', icon: 'user' },
    { id: 4, user: 'System', action: 'completed maintenance', time: '5 hours ago', icon: 'system' },
  ]
};

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // const response = await api.get('/api/dashboard/stats');
      // return response.data;
      
      // For now, return mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockDashboardData);
        }, 500); // Simulate network delay
      });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    stats: null,
    monthlyData: [],
    recentActivities: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Add any synchronous reducers here if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.monthlyData = action.payload.monthlyData;
        state.recentActivities = action.payload.recentActivities;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load dashboard data';
      });
  },
});

export default dashboardSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock data for users
const mockUsers = [
  {
    _id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2023-01-15T10:30:00Z',
    avatar: '',
  },
  {
    _id: '2',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'user',
    status: 'active',
    createdAt: '2023-02-20T14:25:00Z',
    avatar: '',
  },
  {
    _id: '3',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'agent',
    status: 'inactive',
    createdAt: '2023-03-10T09:15:00Z',
    avatar: '',
  },
];

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // const response = await api.get('/api/users');
      // return response.data;
      
      // For now, return mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockUsers);
        }, 500); // Simulate network delay
      });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const createUser = createAsyncThunk(
  'users/create',
  async (userData, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // const response = await api.post('/api/users', userData);
      // return response.data;
      
      // For now, return mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          const newUser = {
            ...userData,
            _id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            status: userData.status || 'active',
          };
          mockUsers.unshift(newUser);
          resolve(newUser);
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // const response = await api.put(`/api/users/${id}`, userData);
      // return response.data;
      
      // For now, update mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          const index = mockUsers.findIndex(user => user._id === id);
          if (index !== -1) {
            const updatedUser = { ...mockUsers[index], ...userData };
            mockUsers[index] = updatedUser;
            resolve(updatedUser);
          } else {
            rejectWithValue('User not found');
          }
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // await api.delete(`/api/users/${id}`);
      
      // For now, update mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          const index = mockUsers.findIndex(user => user._id === id);
          if (index !== -1) {
            mockUsers.splice(index, 1);
            resolve(id);
          } else {
            rejectWithValue('User not found');
          }
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'users/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // const response = await api.patch(`/api/users/${id}/status`, { status });
      // return response.data;
      
      // For now, update mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          const index = mockUsers.findIndex(user => user._id === id);
          if (index !== -1) {
            const updatedUser = { ...mockUsers[index], status };
            mockUsers[index] = updatedUser;
            resolve(updatedUser);
          } else {
            rejectWithValue('User not found');
          }
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user status');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Add any synchronous reducers here if needed
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Users
    builder.addCase(fetchUsers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.loading = false;
      state.users = action.payload;
    });
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Create User
    builder.addCase(createUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createUser.fulfilled, (state, action) => {
      state.loading = false;
      state.users.unshift(action.payload);
    });
    builder.addCase(createUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Update User
    builder.addCase(updateUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateUser.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.users.findIndex(user => user._id === action.payload._id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    });
    builder.addCase(updateUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Delete User
    builder.addCase(deleteUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteUser.fulfilled, (state, action) => {
      state.loading = false;
      state.users = state.users.filter(user => user._id !== action.payload);
    });
    builder.addCase(deleteUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Update User Status
    builder.addCase(updateUserStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateUserStatus.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.users.findIndex(user => user._id === action.payload._id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    });
    builder.addCase(updateUserStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;

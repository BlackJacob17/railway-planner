import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

import authReducer from './slices/authSlice';
import trainReducer from './slices/trainSlice';
import stationReducer from './slices/stationSlice';
import bookingReducer from './slices/bookingSlice';
import bookingsReducer from './slices/bookingsSlice';
import reviewReducer from './slices/reviewSlice';
import dashboardReducer from './slices/dashboardSlice';
import userReducer from './slices/userSlice';

// Configuration for redux-persist
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist the auth slice
};

const rootReducer = combineReducers({
  auth: authReducer,
  trains: trainReducer,
  stations: stationReducer,
  bookings: bookingsReducer, // New bookings slice
  booking: bookingReducer,   // Old bookings slice for backward compatibility
  reviews: reviewReducer,
  dashboard: dashboardReducer,
  user: userReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the store with the persisted reducer
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types and field paths in all actions
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in the state
        ignoredPaths: ['register', 'rehydrate'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create the persistor
const persistor = persistStore(store);

export { store, persistor };

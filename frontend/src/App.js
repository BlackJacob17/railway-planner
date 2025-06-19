import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, CircularProgress, Box } from '@mui/material';
import { SnackbarProvider } from 'notistack';

// --- Theme ---
import theme from './theme/theme';

// --- Layouts ---
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// --- Guards ---
import AuthGuard from './components/auth/AuthGuard';
import RoleBasedGuard from './components/auth/RoleBasedGuard';

// --- Page Components (Lazy Loaded) ---
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const PlanJourneyPage = lazy(() => import('./pages/journey/PlanJourneyPage'));
const TrainsPage = lazy(() => import('./pages/trains/TrainsPage'));
const StationsPage = lazy(() => import('./pages/stations/StationsPage'));
const BookingsPage = lazy(() => import('./pages/bookings/BookingsPage'));
const CreateBookingPage = lazy(() => import('./pages/bookings/CreateBookingPage'));
const BookingConfirmationPage = lazy(() => import('./pages/bookings/BookingConfirmationPage'));
const ReviewsPage = lazy(() => import('./pages/reviews/ReviewsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const UsersPage = lazy(() => import('./pages/admin/users/UsersPage'));
const AdminTrainsPage = lazy(() => import('./pages/admin/trains/AdminTrainsPage'));
const AdminStationsPage = lazy(() => import('./pages/admin/stations/AdminStationsPage'));
const AdminBookingsPage = lazy(() => import('./pages/admin/bookings/AdminBookingsPage'));
const AdminReportsPage = lazy(() => import('./pages/admin/reports/AdminReportsPage'));
const NotFoundPage = lazy(() => import('./pages/errors/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('./pages/errors/UnauthorizedPage'));

const AppRoutes = () => {
  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      {/* --- Protected Routes --- */}
      <Route element={<AuthGuard><MainLayout /></AuthGuard>}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="journey-planner" element={<PlanJourneyPage />} />
        <Route path="plan-journey" element={<PlanJourneyPage />} />
        <Route path="trains" element={<TrainsPage />} />
        <Route path="stations" element={<StationsPage />} />
        <Route path="bookings">
          <Route index element={<BookingsPage />} />
          <Route path="new/:trainId" element={<CreateBookingPage />} />
          <Route path="confirmation/:bookingId" element={<BookingConfirmationPage />} />
        </Route>
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* --- Admin Routes --- */}
        <Route path="admin" element={<RoleBasedGuard><Outlet /></RoleBasedGuard>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="trains" element={<AdminTrainsPage />} />
          <Route path="stations" element={<AdminStationsPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
        </Route>
      </Route>

      {/* --- Error Routes --- */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider 
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        autoHideDuration={3000}
      >
        <Router>
          <Suspense
            fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
              </Box>
            }
          >
            <AppRoutes />
          </Suspense>
        </Router>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;

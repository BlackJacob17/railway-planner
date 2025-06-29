import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Paper, 
  Button, 
  Divider,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Skeleton,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { format } from 'date-fns';
import {
  Train as TrainIcon,
  Search as SearchIcon,
  Explore as ExploreIcon,
  LocalOffer as LocalOfferIcon,
  Assessment as AssessmentIcon,
  AirplanemodeActive as AirplaneTicketIcon,
  Receipt as ReceiptIcon,
  Loyalty as LoyaltyIcon,
  AccountBalanceWallet as SavingsIcon,
  History as HistoryIcon,
  ListAlt as ListAltIcon,
  HelpOutline as HelpOutlineIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { bookingsAPI } from '../services/api';

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100%',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  },
}));

const QuickActionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: theme.shadows[4],
  },
}));

const ActivityItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

export default function DashboardPage() {
  console.log('DashboardPage rendering...');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useSelector((state) => state.auth);
  console.log('User from Redux:', user);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingTrips: 0,
    loyaltyPoints: 0,
    savedAmount: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await bookingsAPI.getBookings({ 
          limit: 3,
          sort: '-createdAt'
        });
        
        // Ensure response.data is an array before using .filter()
        const bookings = Array.isArray(response?.data) ? response.data : [];
        
        setRecentBookings(bookings);
        
        // Calculate upcoming trips safely
        const upcomingTrips = bookings.filter(booking => {
          try {
            return booking?.journeyDate && new Date(booking.journeyDate) > new Date();
          } catch (e) {
            console.warn('Error processing booking date:', e);
            return false;
          }
        }).length;
        
        setStats({
          totalBookings: response?.total || bookings.length,
          upcomingTrips,
          loyaltyPoints: user?.loyaltyPoints || 0,
          savedAmount: user?.savedAmount || 0
        });
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
        // Set default/empty state on error
        setRecentBookings([]);
        setStats({
          totalBookings: 0,
          upcomingTrips: 0,
          loyaltyPoints: user?.loyaltyPoints || 0,
          savedAmount: user?.savedAmount || 0
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);
  
  const StatItem = ({ icon, title, value, loading }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box sx={{ mr: 2, color: 'primary.main' }}>{icon}</Box>
      <Box>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
        {loading ? (
          <Skeleton variant="text" width={60} />
        ) : (
          <Typography variant="h6" fontWeight="bold">{value}</Typography>
        )}
      </Box>
    </Box>
  );
  
  const BookingItem = ({ booking }) => (
    <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center' }}>
      <TrainIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {booking.train?.name || 'Train Booking'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {booking.fromStation?.name} to {booking.toStation?.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {format(new Date(booking.journeyDate), 'MMM d, yyyy')} • {booking.pnr}
        </Typography>
      </Box>
      <Chip 
        label={booking.status || 'Confirmed'} 
        color={booking.status === 'cancelled' ? 'error' : 'success'}
        size="small"
      />
    </Paper>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 3, borderRadius: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 3, md: 4 },
          mb: 4,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e9edf2 100%)',
          borderRadius: 2,
          borderLeft: '4px solid',
          borderColor: 'primary.main'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center' }}>
          <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' }, mb: { xs: 3, md: 0 } }}>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Welcome back, {user?.username || 'Explorer'}! 🚄
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              {recentBookings.length === 0 
                ? "Ready for your next adventure? Let's get started!" 
                : "Here's what's happening with your account today."}
            </Typography>
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Button 
                variant="contained" 
                color="primary" 
                component={Link}
                to="/trains"
                startIcon={<SearchIcon />}
                size="large"
                sx={{ borderRadius: 2, px: 4, py: 1.5 }}
              >
                Search Trains
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                component={Link}
                to="/trains"
                startIcon={<ExploreIcon />}
                size="large"
                sx={{ borderRadius: 2, px: 4, py: 1.5 }}
              >
                Explore Routes
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ width: { xs: '100%', md: '40%' }, maxWidth: 400, mt: { xs: 3, md: 0 } }}>
            <img 
              src="https://cdn.dribbble.com/users/469578/screenshots/2592856/railway_illustration.png" 
              alt="Start your journey" 
              style={{ width: '100%', height: 'auto', borderRadius: 8 }}
            />
          </Box>
        </Box>
      </Paper>
      
      <Grid container spacing={3}>
        {/* Stats Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AssessmentIcon color="primary" sx={{ mr: 1 }} /> Your Stats
            </Typography>
            <Divider sx={{ my: 2 }} />
            <StatItem 
              icon={<ReceiptIcon />} 
              title="Total Bookings"
              value={stats.totalBookings}
              loading={loading}
            />
            <StatItem 
              icon={<LoyaltyIcon sx={{ color: '#ff9800' }} />} 
              title="Loyalty Points"
              value={stats.loyaltyPoints}
              loading={loading}
            />
            <StatItem 
              icon={<SavingsIcon sx={{ color: '#4caf50' }} />} 
              title="Total Saved"
              value={`₹${stats.savedAmount.toLocaleString()}`}
              loading={loading}
            />
            
            {recentBookings.length === 0 && (
              <Button 
                variant="outlined" 
                color="primary" 
                fullWidth 
                sx={{ mt: 2 }}
                component={Link}
                to="/offers"
                startIcon={<LocalOfferIcon />}
              >
                View Special Offers
              </Button>
            )}
          </Paper>
        </Grid>

        {/* Recent Bookings */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={2}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              height: '100%',
              minHeight: 400
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <HistoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography component="h3" variant="h6" color="text.primary">
                  Recent Bookings
                </Typography>
              </Box>
              {recentBookings.length > 0 && (
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  component={Link}
                  to="/bookings"
                  startIcon={<ListAltIcon />}
                >
                  View All
                </Button>
              )}
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : recentBookings.length > 0 ? (
              <Box sx={{ flex: 1 }}>
                {recentBookings.map((booking) => (
                  <BookingItem key={booking._id || booking.id} booking={booking} />
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', p: 4, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box 
                  sx={{ 
                    width: 200, 
                    height: 200, 
                    margin: '0 auto 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    mb: 3
                  }}
                >
                  <TrainIcon sx={{ fontSize: 80, opacity: 0.8 }} />
                </Box>
                <Typography variant="h6" color="text.primary" gutterBottom fontWeight="medium">
                  No Bookings Yet
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Your upcoming train journeys will appear here. Ready to plan your next trip?
                </Typography>
                <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    component={Link}
                    to="/trains"
                    startIcon={<SearchIcon />}
                    size="large"
                    sx={{ borderRadius: 2, px: 4, minWidth: 200 }}
                  >
                    Search Trains
                  </Button>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Chip 
                      icon={<LocalOfferIcon />} 
                      label="Special Offers" 
                      variant="outlined" 
                      onClick={() => navigate('/offers')}
                      clickable
                      sx={{ borderRadius: 1 }}
                    />
                    <Chip 
                      icon={<HelpOutlineIcon />} 
                      label="Need Help?" 
                      variant="outlined"
                      onClick={() => navigate('/help')}
                      clickable
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

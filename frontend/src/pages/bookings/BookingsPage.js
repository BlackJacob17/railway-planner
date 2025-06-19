import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { fetchUserBookings } from '../../store/slices/bookingsSlice';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useTheme,
} from '@mui/material';
import {
  Train as TrainIcon,
  ConfirmationNumber as TicketIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Paid as PaidIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';

const BookingsContainer = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
}));

const BookingCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const StatusChip = ({ status }) => {
  const theme = useTheme();
  
  const statusColors = {
    Confirmed: theme.palette.success.main,
    Cancelled: theme.palette.error.main,
    Pending: theme.palette.warning.main,
    RAC: theme.palette.info.main,
  };

  return (
    <Chip
      label={status}
      size="small"
      sx={{
        backgroundColor: statusColors[status] || theme.palette.grey[500],
        color: theme.palette.getContrastText(statusColors[status] || theme.palette.grey[500]),
        fontWeight: 'bold',
      }}
    />
  );
};

const BookingItem = ({ booking }) => {
  console.log('Rendering booking:', booking);
  
  // Format the date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'N/A';
    }
  };

  return (
    <BookingCard variant="outlined">
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" component="div">
              {booking.train?.name || 'Train'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Train No: {booking.train?.number || 'N/A'}
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="caption" color="text.secondary" display="block">
              PNR: {booking.pnr || 'N/A'}
            </Typography>
            <StatusChip status={booking.bookingStatus || 'Pending'} />
          </Box>
        </Box>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Box display="flex" alignItems="center" mb={1}>
            <LocationIcon color="action" fontSize="small" sx={{ mr: 1 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                From
              </Typography>
              <Typography variant="body1">
                {booking.from?.name || 'N/A'}
                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({booking.from?.code || 'N/A'})
                </Typography>
              </Typography>
            </Box>
          </Box>
          
          <Box display="flex" alignItems="center" mb={1}>
            <EventIcon color="action" fontSize="small" sx={{ mr: 1 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Journey Date
              </Typography>
              <Typography variant="body1">
                {formatDate(booking.journeyDate)}
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Box display="flex" alignItems="center" mb={1}>
            <LocationIcon color="action" fontSize="small" sx={{ mr: 1 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                To
              </Typography>
              <Typography variant="body1">
                {booking.to?.name || 'N/A'}
                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({booking.to?.code || 'N/A'})
                </Typography>
              </Typography>
            </Box>
          </Box>
          
          <Box display="flex" alignItems="center" mb={1}>
            <PaidIcon color="action" fontSize="small" sx={{ mr: 1 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Fare
              </Typography>
              <Typography variant="body1">
                ₹{booking.totalFare?.toFixed(2) || '0.00'}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box display="flex" alignItems="center" mb={1}>
            <EventIcon color="action" fontSize="small" sx={{ mr: 1 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">Journey Date</Typography>
              <Typography>
                {format(new Date(booking.journeyDate), 'MMM dd, yyyy')}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {booking.passengers?.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Passengers ({booking.passengers?.length || 0})
          </Typography>
          
          <List dense>
            {booking.passengers?.map((passenger, index) => (
              <ListItem key={index} disableGutters>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={passenger.name}
                  secondary={
                    <>
                      {passenger.age} yrs • {passenger.gender}
                      {passenger.seatNumber && (
                        <>
                          {' • '}Seat: {passenger.coach}-{passenger.seatNumber}
                        </>
                      )}
                    </>
                  }
                />
                <Chip
                  label={passenger.status || 'Confirmed'}
                  size="small"
                  color={
                    passenger.status === 'Cancelled' ? 'error' :
                    passenger.status === 'RAC' ? 'warning' : 'success'
                  }
                  variant="outlined"
                />
              </ListItem>
            ))}
          </List>
        </>
      )}

      <Divider sx={{ my: 2 }} />

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center">
          <PaidIcon color="action" sx={{ mr: 1 }} />
          <Typography variant="h6">
            ₹{booking.totalFare?.toLocaleString()}
          </Typography>
        </Box>
        
        <Box>
          <Button 
            component={RouterLink} 
            to={`/bookings/${booking._id}`}
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
          >
            View Details
          </Button>
          {booking.bookingStatus === 'Confirmed' && (
            <Button 
              variant="outlined" 
              color="error" 
              size="small"
            >
              Cancel
            </Button>
          )}
        </Box>
      </Box>
    </CardContent>
  </BookingCard>
  );
};

export default function BookingsPage() {
  const dispatch = useDispatch();
  const { 
    bookings = [], 
    loading, 
    error,
    count = 0,
    total = 0,
    totalPages = 1,
    currentPage = 1 
  } = useSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(fetchUserBookings());
  }, [dispatch]);
  
  // Log the bookings data for debugging
  useEffect(() => {
    if (bookings && bookings.length > 0) {
      console.log('Bookings data:', bookings);
    }
  }, [bookings]);

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 2, mb: 3 }}>
          {typeof error === 'string' ? error : 'Failed to load bookings. Please try again.'}
        </Alert>
      );
    }

    if (!bookings || bookings.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <TicketIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Bookings Found
          </Typography>
          <Typography color="text.secondary" paragraph>
            You haven't made any bookings yet. Plan your journey now!
          </Typography>
          <Button 
            component={RouterLink} 
            to="/" 
            variant="contained" 
            color="primary"
            startIcon={<TrainIcon />}
            sx={{ mt: 2 }}
          >
            Book a Train
          </Button>
        </Box>
      );
    }

    return (
      <Box>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Showing {count} {count === 1 ? 'booking' : 'bookings'} of {total}
        </Typography>
        
        {bookings.map((booking) => (
          <BookingItem key={booking._id} booking={booking} />
        ))}
      </Box>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <BookingsContainer elevation={0} variant="outlined">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold' }}>
            My Bookings
          </Typography>
          <Button 
            component={RouterLink} 
            to="/" 
            variant="outlined" 
            startIcon={<TrainIcon />}
          >
            Book New Journey
          </Button>
        </Box>
        
        {renderContent()}
      </BookingsContainer>
    </Container>
  );
}


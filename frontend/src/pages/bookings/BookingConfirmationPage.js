import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Button, 
  Divider, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon, 
  Train as TrainIcon, 
  Person as PersonIcon,
  Event as EventIcon,
  ConfirmationNumber as TicketIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { getBookingDetails } from '../../store/slices/bookingSlice';
import { useSnackbar } from 'notistack';

const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  
  const { currentBooking: booking, loading, error } = useSelector((state) => state.booking);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) {
      enqueueSnackbar('No booking ID provided', { variant: 'error' });
      navigate('/bookings');
      return;
    }

    console.log('Fetching booking details for ID:', bookingId);
    
    const fetchBooking = async () => {
      try {
        setIsLoading(true);
        const resultAction = await dispatch(getBookingDetails(bookingId));
        
        if (getBookingDetails.fulfilled.match(resultAction)) {
          console.log('Booking details loaded successfully:', resultAction.payload);
        } else {
          throw new Error(resultAction.error.message || 'Failed to load booking');
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
        enqueueSnackbar(
          error.message || 'Failed to load booking details', 
          { variant: 'error' }
        );
        navigate('/bookings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, dispatch, enqueueSnackbar, navigate]);

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !booking) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Booking not found'}
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/bookings')}
          sx={{ mr: 2 }}
        >
          Back to My Bookings
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
        >
          Go to Home
        </Button>
      </Container>
    );
  }

  // Format date and time
  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'PPP');
    } catch (e) {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      return format(date, 'h:mm a');
    } catch (e) {
      return timeString;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Booking Confirmed!
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Your booking is confirmed with PNR: <strong>{booking.pnr}</strong>
          </Typography>
          <Chip 
            label={booking.status === 'confirmed' ? 'Confirmed' : booking.status}
            color={booking.status === 'confirmed' ? 'success' : 'default'}
            sx={{ mt: 2, px: 2, py: 1, fontSize: '1rem' }}
          />
        </Box>

        <Divider sx={{ my: 4 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <TrainIcon />
                  </Avatar>
                }
                title={booking.train?.trainNumber ? `Train ${booking.train.trainNumber}` : 'Train Details'}
                subheader={`${booking.train?.name || ''} (${booking.train?.type || ''})`}
              />
              <CardContent>
                <List dense>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <EventIcon color="action" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Journey Date" 
                      secondary={formatDate(booking.journeyDate)} 
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <TicketIcon color="action" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Booking ID" 
                      secondary={booking._id} 
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader
                title="Journey Details"
                subheader={`${booking.fromStation?.name} to ${booking.toStation?.name}`}
              />
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="h6">{booking.fromStation?.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatTime(booking.train?.departureTime)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6">{booking.toStation?.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatTime(booking.train?.arrivalTime)}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Duration: {booking.train?.duration || 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined">
              <CardHeader
                title="Passenger Details"
                avatar={
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <PersonIcon />
                  </Avatar>
                }
              />
              <CardContent>
                <Grid container spacing={2}>
                  {booking.passengers?.map((passenger, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle1">
                          {passenger.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Age: {passenger.age} | {passenger.gender === 'M' ? 'Male' : passenger.gender === 'F' ? 'Female' : 'Other'}
                        </Typography>
                        {passenger.seatNumber && (
                          <Typography variant="body2" color="primary">
                            Seat: {passenger.seatNumber} ({passenger.coach} - {passenger.berthType})
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => window.print()}
            startIcon={<TicketIcon />}
          >
            Print Ticket
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            size="large"
            component={Link}
            to="/bookings"
            startIcon={<ArrowBackIcon />}
          >
            View All Bookings
          </Button>
          <Button 
            variant="outlined" 
            color="secondary" 
            size="large"
            component={Link}
            to="/"
            startIcon={<HomeIcon />}
          >
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default BookingConfirmationPage;

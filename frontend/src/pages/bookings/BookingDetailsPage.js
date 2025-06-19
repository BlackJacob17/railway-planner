import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { fetchBooking } from '../../store/slices/bookingSlice';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Train, Person, Event, AttachMoney, ConfirmationNumber } from '@mui/icons-material';

const DetailsContainer = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
}));

export default function BookingDetailsPage() {
  const dispatch = useDispatch();
  const { bookingId } = useParams();
  const { selectedBooking: booking, loading, error } = useSelector((state) => state.booking);

  useEffect(() => {
    if (bookingId) {
      dispatch(fetchBooking(bookingId));
    }
  }, [dispatch, bookingId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  }

  if (!booking) {
    return (
      <Container maxWidth="md">
        <Alert severity="info" sx={{ mt: 4 }}>No booking details found.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <DetailsContainer elevation={3}>
        <Typography component="h1" variant="h4" gutterBottom>
          Booking Details
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Booking ID: {booking._id}
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <SectionTitle variant="h6">
              <Train />
              Journey Details
            </SectionTitle>
            <List dense>
              <ListItem><ListItemText primary="Train" secondary={`${booking.train.name} (#${booking.train.trainNumber})`} /></ListItem>
              <ListItem><ListItemText primary="From" secondary={booking.fromStation.name} /></ListItem>
              <ListItem><ListItemText primary="To" secondary={booking.toStation.name} /></ListItem>
              <ListItem><ListItemText primary="Date of Journey" secondary={new Date(booking.journeyDate).toLocaleDateString()} /></ListItem>
            </List>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <SectionTitle variant="h6">
              <ConfirmationNumber />
              Booking Info
            </SectionTitle>
            <List dense>
              <ListItem><ListItemText primary="Status" secondary={booking.status} /></ListItem>
              <ListItem><ListItemText primary="Seats Booked" secondary={booking.passengers.length} /></ListItem>
              <ListItem><ListItemText primary="Total Fare" secondary={`₹${booking.totalFare.toFixed(2)}`} /></ListItem>
              <ListItem><ListItemText primary="Booked On" secondary={new Date(booking.createdAt).toLocaleString()} /></ListItem>
            </List>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <SectionTitle variant="h6">
              <Person />
              Passenger Details
            </SectionTitle>
            <List>
              {booking.passengers.map((p, index) => (
                <ListItem key={index}>
                  <ListItemText primary={p.name} secondary={`Age: ${p.age}, Gender: ${p.gender}, Seat: ${p.seatNumber || 'N/A'}`} />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button component={RouterLink} to="/bookings" variant="outlined">
            Back to My Bookings
          </Button>
        </Box>
      </DetailsContainer>
    </Container>
  );
}


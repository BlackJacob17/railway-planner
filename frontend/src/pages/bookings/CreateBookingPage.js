import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  TextField, 
  Grid, 
  Divider, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import { 
  getTrainDetails,
  getAvailableSeats,
  createBooking as createBookingAction,
  clearCurrentBooking
} from '../../store/slices/bookingSlice';
import { fetchStations } from '../../store/slices/stationSlice';
import { useSnackbar } from 'notistack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const steps = ['Train Details', 'Passenger Details', 'Payment'];

const CreateBookingPage = () => {
  const { trainId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  
  // Get data from Redux store
  const { 
    train: trainFromState, 
    trainLoading, 
    trainError, 
    availableSeats, 
    loadingSeats, 
    errorSeats,
    creating,
    error: bookingError,
  } = useSelector((state) => state.booking || {});  // Changed from state.bookings to state.booking
  
  // Debug: Log Redux state and train data
  const reduxState = useSelector((state) => state);
  useEffect(() => {
    console.log('Redux state:', reduxState);
    console.log('Train data from Redux:', { 
      train: trainFromState, 
      trainLoading, 
      trainError 
    });
  }, [trainFromState, trainLoading, trainError, reduxState]);
  
  // Use the train from state
  const train = trainFromState;
  // Debug logs
  useEffect(() => {
    console.log('Train from Redux:', {
      trainFromState,
      trainLoading,
      trainError,
      hasTrainData: !!trainFromState
    });
  }, [trainFromState, trainLoading, trainError]);
  
  const { stations } = useSelector((state) => ({
    stations: state.stations.stations || []
  }));
  const { user, isAuthenticated } = useSelector((state) => ({
    user: state.auth.user,
    isAuthenticated: state.auth.isAuthenticated
  }));
  
  console.log('Auth state:', { isAuthenticated, user });
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login', { state: { from: `/bookings/new/${trainId}` } });
    }
  }, [isAuthenticated, navigate, trainId]);
  
  // Local state
  const [activeStep, setActiveStep] = useState(0);
  const [passengers, setPassengers] = useState([{ name: '', age: '', gender: 'M', berthPreference: 'LB' }]);
  const [journeyDate, setJourneyDate] = useState(new Date());
  const [formErrors, setFormErrors] = useState({});
  
  // Helper function to get the next available dates for the train
  const getNextAvailableDates = () => {
    if (!train?.daysOfOperation?.length) return '';
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const nextDates = [];
    
    // Check next 14 days
    for (let i = 0; i < 14 && nextDates.length < 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = days[date.getDay()];
      
      if (train.daysOfOperation.includes(dayName)) {
        nextDates.push({
          date,
          dayName
        });
      }
    }
    
    if (nextDates.length === 0) return 'No upcoming available dates';
    
    return `Next available: ${nextDates.map(d => 
      `${d.date.toLocaleDateString()} (${d.dayName})`
    ).join(', ')}`;
  };

  // Fetch train and station data
  useEffect(() => {
    if (!trainId) {
      console.error('No trainId provided in URL');
      enqueueSnackbar('No train selected. Please select a train first.', { variant: 'error' });
      navigate('/plan-journey');
      return;
    }

    console.log('Fetching train details for ID:', trainId);
    
    // Reset any previous train data
    dispatch(clearCurrentBooking());
    
    // Fetch train details
    dispatch(getTrainDetails(trainId))
      .unwrap()
      .then(data => {
        console.log('Train details fetched successfully:', data);
        // Fetch stations after train details are loaded
        return dispatch(fetchStations()).unwrap();
      })
      .then(() => {
        console.log('Stations fetched successfully');
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        enqueueSnackbar(
          err.message || 'Failed to load train details. Please try again.',
          { variant: 'error' }
        );
        // Redirect back to journey planner if train not found
        if (err.message?.includes('not found') || err.message?.includes('No train data')) {
          navigate('/plan-journey');
        }
      });
  }, [dispatch, trainId, navigate, enqueueSnackbar]);
  
  // Log train data when it's available
  useEffect(() => {
    if (train && !trainLoading && !trainError) {
      console.log('Train data loaded successfully:', {
        id: train._id,
        name: train.name,
        number: train.trainNumber,
        source: train.source,
        destination: train.destination,
        departure: train.departureTime,
        arrival: train.arrivalTime
      });
    }
  }, [train, trainLoading, trainError]);
  
  // Fetch available seats when journey date changes
  useEffect(() => {
    if (trainId && journeyDate) {
      dispatch(getAvailableSeats({ trainId, date: journeyDate }));
    }
  }, [dispatch, trainId, journeyDate]);
  
  // Handle form input changes
  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value
    };
    setPassengers(updatedPassengers);
  };
  
  const addPassenger = () => {
    if (passengers.length < 6) { // Limit to 6 passengers per booking
      setPassengers([...passengers, { name: '', age: '', gender: 'M', berthPreference: 'LB' }]);
    }
  };
  
  const removePassenger = (index) => {
    if (passengers.length > 1) {
      const updatedPassengers = passengers.filter((_, i) => i !== index);
      setPassengers(updatedPassengers);
    }
  };
  
  // Form validation
  const validateForm = () => {
    const errors = {};
    
    // Only validate journey date for step 0
    if (activeStep === 0) {
      if (!journeyDate) {
        errors.journeyDate = 'Journey date is required';
      } else if (new Date(journeyDate) < new Date().setHours(0, 0, 0, 0)) {
        errors.journeyDate = 'Journey date cannot be in the past';
      }
    }
    
    // Validate passenger details for step 1
    if (activeStep === 1) {
      const passengerErrors = [];
      let hasErrors = false;
      
      passengers.forEach((passenger, index) => {
        const passengerError = {};
        
        if (!passenger.name?.trim()) {
          passengerError.name = 'Name is required';
          hasErrors = true;
        }
        
        if (!passenger.age) {
          passengerError.age = 'Age is required';
          hasErrors = true;
        } else if (isNaN(Number(passenger.age)) || Number(passenger.age) < 1 || Number(passenger.age) > 120) {
          passengerError.age = 'Please enter a valid age (1-120)';
          hasErrors = true;
        }
        
        if (Object.keys(passengerError).length > 0) {
          passengerErrors[index] = passengerError;
        }
      });
      
      if (hasErrors) {
        errors.passengers = passengerErrors;
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle next step
  const handleNext = () => {
    // Validate current step
    if (!validateForm()) {
      console.log('Validation failed', formErrors);
      return;
    }
    
    // If on last step, submit the form
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      // Otherwise, go to next step
      setActiveStep((prevStep) => {
        const nextStep = prevStep + 1;
        console.log(`Moving to step ${nextStep}`);
        return nextStep;
      });
    }
  };
  
  // Handle previous step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    // Ensure we have the train details
    if (!train) {
      enqueueSnackbar('Train information is missing', { variant: 'error' });
      return;
    }
    
    console.log('Train object:', train);
    console.log('Source station:', train.source);
    console.log('Destination station:', train.destination);
    
    // Ensure we have the correct station IDs
    const sourceStationId = train.source?._id || train.source;
    const destinationStationId = train.destination?._id || train.destination;
    
    if (!sourceStationId || !destinationStationId) {
      console.error('Missing station IDs:', { source: train.source, destination: train.destination });
      enqueueSnackbar('Invalid station information', { variant: 'error' });
      return;
    }
    
    // Convert to UTC to avoid timezone issues
    const utcDate = new Date(Date.UTC(
      journeyDate.getFullYear(),
      journeyDate.getMonth(),
      journeyDate.getDate()
    ));
    
    const bookingData = {
      train: trainId,
      fromStation: sourceStationId,
      toStation: destinationStationId,
      journeyDate: utcDate.toISOString().split('T')[0], // Format as YYYY-MM-DD in UTC
      passengers: passengers.map(p => ({
        name: p.name.trim(),
        age: parseInt(p.age, 10),
        gender: p.gender,
        berthPreference: p.berthPreference
      })),
      paymentMethod: 'credit_card' // Default payment method as expected by backend
    };
    
    console.log('Submitting booking data:', bookingData);
    
    try {
      const resultAction = await dispatch(createBookingAction(bookingData));
      
      if (createBookingAction.fulfilled.match(resultAction)) {
        const bookingId = resultAction.payload._id;
        enqueueSnackbar('Booking created successfully!', { variant: 'success' });
        // Redirect to the booking confirmation page
        navigate(`/bookings/confirmation/${bookingId}`);
      } else {
        throw new Error(bookingError || 'Failed to create booking');
      }
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to create booking', { variant: 'error' });
    }
  };
  
  // Render step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Train Details
            </Typography>
            {trainLoading ? (
              <CircularProgress />
            ) : trainError ? (
              <Alert severity="error">{trainError}</Alert>
            ) : train ? (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Typography variant="h6">
                        {train.trainNumber} - {train.trainName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {train.trainType}
                      </Typography>
                      <Box mt={2}>
                        <Typography variant="body1">
                          {getStationName(train.source)} to {getStationName(train.destination)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Departure: {train.departureTime ? format(
                            typeof train.departureTime === 'string' ? parseISO(train.departureTime) : new Date(train.departureTime), 
                            'PPp'
                          ) : 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Arrival: {train.arrivalTime ? format(
                            typeof train.arrivalTime === 'string' ? parseISO(train.arrivalTime) : new Date(train.arrivalTime),
                            'PPp'
                          ) : 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Duration: {calculateDuration(train.departureTime, train.arrivalTime)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="h6" color="primary" align="right">
                        ₹{train.fare}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" align="right">
                        per passenger
                      </Typography>
                      {availableSeats !== null && (
                        <Typography variant="body2" color={availableSeats > 0 ? 'success.main' : 'error'} align="right">
                          {availableSeats} seats available
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ) : null}
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Journey Date"
                value={journeyDate}
                onChange={(date) => {
                  setJourneyDate(date);
                  // Clear any previous date errors
                  if (formErrors.journeyDate) {
                    setFormErrors(prev => ({ ...prev, journeyDate: '' }));
                  }
                }}
                minDate={new Date()}
                shouldDisableDate={(date) => {
                  if (!train || !train.daysOfOperation) return true; // Disable all if no train data
                  const jsDayToStr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                  const dayStr = jsDayToStr[date.getDay()];
                  return !train.daysOfOperation.includes(dayStr);
                }}
                renderInput={(params) => (
                  <Box>
                    <TextField
                      {...params}
                      fullWidth
                      margin="normal"
                      error={!!formErrors.journeyDate}
                      helperText={
                        formErrors.journeyDate || 
                        (train?.daysOfOperation?.length ? 
                          `Available on: ${train.daysOfOperation.join(", ")}` : 
                          'Select a train first')
                      }
                      required
                    />
                    {train?.daysOfOperation?.length > 0 && (
                      <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                        {getNextAvailableDates()}
                      </Typography>
                    )}
                  </Box>
                )}
              />
            </LocalizationProvider>
            
            {loadingSeats ? (
              <Box display="flex" alignItems="center" mt={2}>
                <CircularProgress size={20} />
                <Box ml={2}>Checking seat availability...</Box>
              </Box>
            ) : errorSeats ? (
              <Alert severity="error" sx={{ mt: 2 }}>{errorSeats}</Alert>
            ) : availableSeats !== null && availableSeats <= 0 ? (
              <Alert severity="warning" sx={{ mt: 2 }}>
                No seats available for the selected date. Please choose another date.
              </Alert>
            ) : null}
          </Box>
        );
        
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Passenger Details
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Please enter details for each passenger
            </Typography>
            
            {passengers.map((passenger, index) => (
              <Card key={index} sx={{ mb: 3, p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1">
                    Passenger {index + 1}
                  </Typography>
                  {passengers.length > 1 && (
                    <Button 
                      color="error" 
                      size="small"
                      onClick={() => removePassenger(index)}
                      disabled={passengers.length <= 1}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={passenger.name}
                      onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                      error={formErrors.passengers?.[index]?.name}
                      helperText={formErrors.passengers?.[index]?.name}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Age"
                      type="number"
                      value={passenger.age}
                      onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                      error={formErrors.passengers?.[index]?.age}
                      helperText={formErrors.passengers?.[index]?.age}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth margin="normal" error={formErrors.passengers?.[index]?.gender}>
                      <InputLabel>Gender</InputLabel>
                      <Select
                        value={passenger.gender}
                        onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                        label="Gender"
                      >
                        <MenuItem value="M">Male</MenuItem>
                        <MenuItem value="F">Female</MenuItem>
                        <MenuItem value="O">Other</MenuItem>
                      </Select>
                      {formErrors.passengers?.[index]?.gender && (
                        <FormHelperText>{formErrors.passengers[index].gender}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Berth Preference</InputLabel>
                      <Select
                        value={passenger.berthPreference}
                        onChange={(e) => handlePassengerChange(index, 'berthPreference', e.target.value)}
                        label="Berth Preference"
                      >
                        <MenuItem value="LB">Lower Berth</MenuItem>
                        <MenuItem value="MB">Middle Berth</MenuItem>
                        <MenuItem value="UB">Upper Berth</MenuItem>
                        <MenuItem value="SL">Side Lower</MenuItem>
                        <MenuItem value="SU">Side Upper</MenuItem>
                        <MenuItem value="NA">No Preference</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Card>
            ))}
            
            <Button 
              variant="outlined" 
              onClick={addPassenger}
              disabled={passengers.length >= 6}
              sx={{ mt: 1 }}
            >
              + Add Passenger (Max 6)
            </Button>
          </Box>
        );
        
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Payment
            </Typography>
            <Typography variant="body1" paragraph>
              Total Amount: <strong>₹{train ? (train.fare * passengers.length).toFixed(2) : '0.00'}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              You will be redirected to a secure payment gateway to complete your booking.
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              This is a demo. No actual payment will be processed.
            </Alert>
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle2" gutterBottom>
                Terms & Conditions:
              </Typography>
              <ul>
                <li>Cancellation charges apply as per railway rules.</li>
                <li>Please carry a valid ID proof of all passengers during the journey.</li>
                <li>E-ticket will be sent to your registered email and mobile number.</li>
              </ul>
            </Box>
          </Box>
        );
        
      default:
        return 'Unknown step';
    }
  };
  
  // Helper functions
  const getStationName = (stationId) => {
    if (!Array.isArray(stations)) {
      console.warn('Stations data is not loaded yet');
      return 'Loading...';
    }
    
    // Handle case where stationId might be an object with _id property
    const id = stationId?._id || stationId;
    
    if (!id) {
      console.warn('Invalid station ID:', stationId);
      return 'Unknown Station';
    }
    
    const station = stations.find(s => s._id === id);
    return station ? `${station.name} (${station.code})` : 'Unknown Station';
  };
  
  const calculateDuration = (departure, arrival) => {
    if (!departure || !arrival) return 'N/A';
    
    try {
      // Handle both string and Date objects
      const dep = departure instanceof Date ? departure : 
                typeof departure === 'string' ? new Date(departure) : null;
      const arr = arrival instanceof Date ? arrival : 
                typeof arrival === 'string' ? new Date(arrival) : null;
      
      if (!dep || !arr || isNaN(dep) || isNaN(arr)) return 'N/A';
      
      const diffMs = arr - dep;
      if (isNaN(diffMs)) return 'N/A';
      
      const hours = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60));
      const minutes = Math.floor((Math.abs(diffMs) % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${hours}h ${minutes}m`;
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 'N/A';
    }
  };
  
  if (trainLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box textAlign="center">
          <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
          <Typography variant="h6" color="textSecondary">Loading train details...</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Train ID: {trainId}
          </Typography>
        </Box>
      </Container>
    );
  }
  
  // Check if train data is available
  if (trainLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading train details...</Typography>
      </Container>
    );
  }
  
  if (trainError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="error">
          <Typography variant="h6">Error Loading Train</Typography>
          <Typography>{trainError}</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/plan-journey')}
            sx={{ mt: 2 }}
          >
            Back to Journey Planner
          </Button>
        </Alert>
      </Container>
    );
  }

  // Show train not found if no train data
  if (!train) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="error">
          <Typography variant="h6">Train not found</Typography>
          <Typography>We couldn't find the train you're looking for.</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/plan-journey')}
            sx={{ mt: 2 }}
          >
            Back to Journey Planner
          </Button>
        </Alert>
      </Container>
    );
  }
  
  if (trainError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          <Typography variant="h6">Error Loading Train Details</Typography>
          <Typography>{trainError}</Typography>
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/plan-journey')}
          sx={{ mt: 2 }}
        >
          Back to Journey Planner
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={3} display="flex" alignItems="center">
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Book Train
        </Typography>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ mt: 2, mb: 4 }}>
          {renderStepContent(activeStep)}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={
                creating || 
                (activeStep === 0 && (!journeyDate || availableSeats <= 0)) ||
                (activeStep === 1 && passengers.some(p => !p.name?.trim() || !p.age))
              }
            >
              {activeStep === steps.length - 1 ? 'Confirm & Pay' : 'Next'}
              {creating && <CircularProgress size={24} sx={{ ml: 1 }} />}
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {bookingError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {bookingError}
        </Alert>
      )}
    </Container>
  );
};

export default CreateBookingPage;

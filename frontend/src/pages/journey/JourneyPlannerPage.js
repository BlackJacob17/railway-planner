import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { searchTrains } from '../../store/slices/trainSlice';
import { fetchStations } from '../../store/slices/stationSlice';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Autocomplete,
  Card,
  CardContent,
  CardActions,
  Divider
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { styled } from '@mui/material/styles';

const SearchContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
}));

const ResultsContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

export default function JourneyPlannerPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Get stations data from Redux store
  const stationsState = useSelector((state) => state.stations || {});
  const stations = Array.isArray(stationsState?.stations) ? stationsState.stations : [];
  const stationsLoading = stationsState.loading || false;
  
  // Ensure stations is always an array
  const safeStations = Array.isArray(stations) ? stations : [];
  
  // Get journeys data from Redux store
  const trainsState = useSelector((state) => state.trains || {});
  const journeys = Array.isArray(trainsState.searchResults) ? trainsState.searchResults : [];
  const journeysLoading = trainsState.loading || false;
  const error = trainsState.error || null;

  const [fromStation, setFromStation] = useState(null);
  const [toStation, setToStation] = useState(null);
  const [journeyDate, setJourneyDate] = useState(new Date());

  useEffect(() => {
    dispatch(fetchStations());
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (fromStation && toStation && journeyDate) {
      dispatch(searchTrains({
        from: fromStation._id,
        to: toStation._id,
        date: journeyDate.toISOString(),
      }));
    }
  };

  const handleBooking = (journey) => {
    // Navigate to a booking confirmation page, passing journey details
    navigate('/booking/confirm', { state: { journey } });
  };

  return (
    <Container maxWidth="lg">
      <SearchContainer elevation={3}>
        <Typography component="h1" variant="h4" gutterBottom>
          Plan Your Journey
        </Typography>
        <Box component="form" onSubmit={handleSearch}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={safeStations}
                getOptionLabel={(option) => option?.name || ''}
                value={fromStation}
                onChange={(event, newValue) => {
                  setFromStation(newValue);
                }}
                loading={stationsLoading}
                renderInput={(params) => <TextField {...params} label="From Station" required />}
                isOptionEqualToValue={(option, value) => option?._id === value?._id}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={safeStations}
                getOptionLabel={(option) => option?.name || ''}
                value={toStation}
                onChange={(event, newValue) => {
                  setToStation(newValue);
                }}
                loading={stationsLoading}
                renderInput={(params) => <TextField {...params} label="To Station" required />}
                isOptionEqualToValue={(option, value) => option?._id === value?._id}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Journey Date"
                  value={journeyDate}
                  onChange={(newValue) => {
                    setJourneyDate(newValue);
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={1}>
              <Button type="submit" variant="contained" fullWidth sx={{ height: '56px' }} disabled={journeysLoading}>
                Search
              </Button>
            </Grid>
          </Grid>
        </Box>
      </SearchContainer>

      <ResultsContainer>
        {journeysLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {journeys && journeys.length > 0 && (
          <Box>
            <Typography variant="h5" gutterBottom>Available Journeys</Typography>
            {journeys.map((journey) => (
              <Card key={journey.trainId} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">{journey.trainName}</Typography>
                  <Typography color="text.secondary">#{journey.trainNumber}</Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6} sm={3}>
                      <Typography><strong>Departs:</strong> {new Date(journey.departureTime).toLocaleTimeString()}</Typography>
                      <Typography variant="body2">{fromStation.name}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography><strong>Arrives:</strong> {new Date(journey.arrivalTime).toLocaleTimeString()}</Typography>
                      <Typography variant="body2">{toStation.name}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography><strong>Duration:</strong> {journey.duration}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography><strong>Fare:</strong> ₹{journey.fare.toFixed(2)}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button variant="contained" color="primary" onClick={() => handleBooking(journey)}>
                    Book Now
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
        {journeys && journeys.length === 0 && !journeysLoading && (
           <Alert severity="info">No journeys found for the selected route and date.</Alert>
        )}
      </ResultsContainer>
    </Container>
  );
}


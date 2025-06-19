import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { format, addDays, parseISO } from 'date-fns';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SearchIcon from '@mui/icons-material/Search';
import TrainIcon from '@mui/icons-material/Train';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { searchTrains } from '../../store/slices/trainSlice';
import { fetchStations } from '../../store/slices/stationSlice';

// Custom quicksort implementation for sorting trains
const quickSort = (arr, compareFn, depth = 0) => {
  // Add input validation
  if (!Array.isArray(arr)) {
    console.error('quickSort called with non-array input:', arr);
    return [];
  }

  // Create a copy of the array to avoid mutating the original
  const array = [...arr];
  
  // Base case: arrays with 0 or 1 element are already sorted
  if (array.length <= 1) {
    return array;
  }
  
  // Choose pivot (middle element for better performance with nearly sorted arrays)
  const pivotIndex = Math.floor(array.length / 2);
  const pivot = array[pivotIndex];
  
  if (!pivot) {
    console.error('Invalid pivot element at index', pivotIndex, 'in array:', array);
    return array; // Return unsorted array if pivot is invalid
  }
  
  // Create left and right arrays
  const left = [];
  const right = [];
  
  // Partition the array
  for (let i = 0; i < array.length; i++) {
    // Skip the pivot element
    if (i === pivotIndex) continue;
    
    const current = array[i];
    if (!current) {
      console.warn('Undefined element at index', i, 'in array:', array);
      continue;
    }
    
    try {
      // Compare elements using the provided compare function
      const comparison = compareFn(current, pivot);
      if (comparison <= 0) {
        left.push(current);
      } else {
        right.push(current);
      }
    } catch (error) {
      console.error('Error comparing elements:', {
        error: error.message,
        current,
        pivot,
        array: array
      });
      // In case of error, push to left to maintain some order
      left.push(current);
    }
  }
  
  // Recursively sort the subarrays with depth check to prevent stack overflow
  try {
    const sortedLeft = left.length > 0 ? quickSort(left, compareFn, depth + 1) : [];
    const sortedRight = right.length > 0 ? quickSort(right, compareFn, depth + 1) : [];
    
    // Combine the sorted subarrays with the pivot
    return [...sortedLeft, pivot, ...sortedRight];
  } catch (error) {
    console.error('Error during sorting:', error);
    return array; // Return unsorted array if sorting fails
  }
};

const PlanJourneyPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Fetch stations when the component mounts
  useEffect(() => {
    dispatch(fetchStations());
  }, [dispatch]);
  
  // Get data from Redux store
  const { stations = [], loading: stationsLoading } = useSelector((state) => state.stations);
  const stationList = Array.isArray(stations) ? stations : [];
  const { searchResults = [], loading: trainsLoading, error } = useSelector((state) => state.trains);

  // Form state
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: addDays(new Date(), 1),
    class: 'SL',
    quota: 'GN',
    sortBy: 'departure' // 'departure' or 'arrival'
  });

  const [errors, setErrors] = useState({});
  const [isSearching, setIsSearching] = useState(false);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSearching(true);
    const formattedDate = format(formData.date, 'yyyy-MM-dd');
    dispatch(searchTrains({
      from: formData.from,
      to: formData.to,
      date: formattedDate,
      class: formData.class,
      quota: formData.quota
    })).finally(() => {
      setIsSearching(false);
    });
  };

  // Format duration between two dates
  const formatDuration = (start, end) => {
    if (!start || !end) return '';
    const diffInMs = new Date(end) - new Date(start);
    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Get station name by ID or station object
  const getStationName = (stationOrId) => {
    if (!stationOrId) return 'Unknown Station';
    if (typeof stationOrId === 'object' && stationOrId !== null) {
      return `${stationOrId.name} (${stationOrId.code})`;
    }
    const station = stations.find(s => s._id === stationOrId);
    return station ? `${station.name} (${station.code})` : 'Unknown Station';
  };

  // Format time
  const formatTime = (dateTime) => {
    if (!dateTime) return '';
    return format(parseISO(dateTime), 'HH:mm');
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    return format(parseISO(date), 'EEE, d MMM yyyy');
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setFormData(prev => ({ ...prev, sortBy: e.target.value }));
  };

  // Sort trains based on selected criteria
  const sortedTrains = useMemo(() => {
    if (!searchResults || searchResults.length === 0) {
      return [];
    }
    try {
      const trains = JSON.parse(JSON.stringify(searchResults));
      const compareFn = (a, b) => {
        try {
          const timeA = formData.sortBy === 'arrival' 
            ? new Date(a.arrivalTime || a.arrival || 0).getTime() 
            : new Date(a.departureTime || a.departure || 0).getTime();
          const timeB = formData.sortBy === 'arrival'
            ? new Date(b.arrivalTime || b.arrival || 0).getTime()
            : new Date(b.departureTime || b.departure || 0).getTime();
          if (isNaN(timeA) || isNaN(timeB)) {
            return 0;
          }
          return timeA - timeB;
        } catch (error) {
          console.error('Error in comparison function:', error);
          return 0;
        }
      };
      return quickSort(trains, compareFn);
    } catch (error) {
      console.error('Error during sorting:', error);
      return searchResults;
    }
  }, [searchResults, formData.sortBy]);




  // Fetch stations on component mount
  useEffect(() => {
    if (stations.length === 0) {
      dispatch(fetchStations());
    }
  }, [dispatch, stations.length]);

  // Handle date change
  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      date: date || addDays(new Date(), 1)
    }));
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Swap from and to stations
  const swapStations = () => {
    setFormData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.from) newErrors.from = 'Please select origin station';
    if (!formData.to) newErrors.to = 'Please select destination station';
    if (formData.from && formData.to && formData.from === formData.to) {
      newErrors.to = 'Destination must be different from origin';
    }
    if (!formData.date) newErrors.date = 'Please select a date';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Plan Your Journey
      </Typography>
      
      {/* Search Form */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth error={!!errors.from}>
                <InputLabel id="from-label">From</InputLabel>
                <Select
                  labelId="from-label"
                  name="from"
                  value={formData.from}
                  onChange={handleChange}
                  label="From"
                  startAdornment={
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  }
                >
                  {stationList.map((station) => (
                    <MenuItem key={station._id} value={station._id}>
                      {station.name} ({station.code})
                    </MenuItem>
                  ))}
                </Select>
                {errors.from && <FormHelperText>{errors.from}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={swapStations}
                sx={{ minWidth: 'auto' }}
                title="Swap stations"
              >
                ⇄
              </Button>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth error={!!errors.to}>
                <InputLabel id="to-label">To</InputLabel>
                <Select
                  labelId="to-label"
                  name="to"
                  value={formData.to}
                  onChange={handleChange}
                  label="To"
                  startAdornment={
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  }
                >
                  {stationList.map((station) => (
                    <MenuItem key={station._id} value={station._id}>
                      {station.name} ({station.code})
                    </MenuItem>
                  ))}
                </Select>
                {errors.to && <FormHelperText>{errors.to}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Journey Date"
                  value={formData.date}
                  onChange={handleDateChange}
                  minDate={new Date()}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <EventAvailableIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  label="Class"
                >
                  <MenuItem value="SL">Sleeper Class (SL)</MenuItem>
                  <MenuItem value="3A">AC 3-Tier (3A)</MenuItem>
                  <MenuItem value="2A">AC 2-Tier (2A)</MenuItem>
                  <MenuItem value="1A">First Class (1A)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Quota</InputLabel>
                <Select
                  name="quota"
                  value={formData.quota}
                  onChange={handleChange}
                  label="Quota"
                >
                  <MenuItem value="GN">General</MenuItem>
                  <MenuItem value="LD">Ladies</MenuItem>
                  <MenuItem value="TQ">Tatkal</MenuItem>
                  <MenuItem value="PT">Premium Tatkal</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                type="submit"
                startIcon={<SearchIcon />}
                disabled={isSearching || trainsLoading}
                sx={{ height: '56px' }}
              >
                {isSearching || trainsLoading ? 'Searching...' : 'Search Trains'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {/* Search Results */}
      {trainsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || 'Failed to load trains. Please try again.'}
        </Alert>
      ) : searchResults.length > 0 ? (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {sortedTrains.length} trains found from {getStationName(formData.from)} to {getStationName(formData.to)}
            </Typography>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={formData.sortBy}
                onChange={handleSortChange}
                label="Sort by"
              >
                <MenuItem value="departure">Departure Time</MenuItem>
                <MenuItem value="arrival">Arrival Time</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {sortedTrains.map((train) => (
            <Card key={train._id} sx={{ mb: 3, '&:hover': { boxShadow: 3 } }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TrainIcon color="primary" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="h6" component="div">
                          {train.trainNumber} - {train.trainName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {train.trainType}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTimeIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {formatDuration(train.departureTime, train.arrivalTime)} journey time
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${train.availableSeats} seats available`} 
                      color={train.availableSeats > 50 ? 'success' : 'warning'}
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
                      <Box>
                        <Typography variant="h6" color="primary">
                          {formatTime(train.departureTime)}
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(train.departureTime)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {getStationName(train.source)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ textAlign: 'center', px: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatDuration(train.departureTime, train.arrivalTime)}
                        </Typography>
                        <Box sx={{ width: 100, height: 1, bgcolor: 'divider', my: 1, mx: 'auto' }} />
                        <Typography variant="caption" color="text.secondary">
                          {train.route?.length - 2 || 0} stops
                        </Typography>
                      </Box>
                      
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" color="primary">
                          {formatTime(train.arrivalTime)}
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(train.arrivalTime)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {getStationName(train.destination)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', height: '100%' }}>
                      <Typography variant="h6" color="primary" gutterBottom>
                        ₹{train.fare}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        per person
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => navigate(`/bookings/new/${train._id}`)}
                        fullWidth
                        sx={{ mt: 'auto' }}
                      >
                        Book Now
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </>
      ) : searchResults.length === 0 && formData.from && formData.to ? (
        <Alert severity="info">
          No trains found for the selected route and date. Please try different search criteria.
        </Alert>
      ) : null}
    </Container>
  );
};

export default PlanJourneyPage;

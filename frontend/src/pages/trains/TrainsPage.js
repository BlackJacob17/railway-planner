import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { searchInObject } from '../../utils/stringSearch';
import api from '../../services/api';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Tooltip,
  CircularProgress,
  Alert,
  useTheme,
  Divider,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Train as TrainIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { 
  fetchTrains, 
  deleteTrain, 
  createTrain, 
  updateTrain 
} from '../../store/slices/trainSlice';


const TrainsPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  
  // Selectors
  const { trains = [], loading, error } = useSelector((state) => ({
    trains: state.trains?.trains || [],
    loading: state.trains?.loading || false,
    error: state.trains?.error || null
  }));
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    trainNumber: '',
    trainType: 'Express',
    source: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    totalSeats: 0,
    fare: 0,
    daysOfOperation: []
  });
  
  const [stations, setStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(true);

  // Sample stations with valid MongoDB ObjectId format (24-character hex string)
  const sampleStations = [
    { _id: '60d5ecb858787c1b9c8d9a4a', name: 'Mumbai Central', code: 'MMCT' },
    { _id: '60d5ecc258787c1b9c8d9a4b', name: 'Delhi', code: 'NDLS' },
    { _id: '60d5eccb58787c1b9c8d9a4c', name: 'Chennai Central', code: 'MAS' },
    { _id: '60d5ecd458787c1b9c8d9a4d', name: 'Howrah', code: 'HWH' },
    { _id: '60d5ecdd58787c1b9c8d9a4e', name: 'Bengaluru City', code: 'SBC' },
    { _id: '60d5ece658787c1b9c8d9a4f', name: 'Ahmedabad', code: 'ADI' },
  ];

  // Fetch stations on component mount
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoadingStations(true);
        const response = await api.get('/stations');
        console.log('Fetched stations:', response.data);
        
        // Use API stations if available, otherwise use sample data
        const validStations = response.data?.length > 0 ? response.data : sampleStations;
        
        console.log('Setting stations:', validStations);
        setStations(validStations);
      } catch (error) {
        console.error('Error fetching stations:', error);
        console.log('Using sample stations:', sampleStations);
        setStations(sampleStations);
      } finally {
        setLoadingStations(false);
      }
    };

    fetchStations();
  }, []);

  // Fetch trains on component mount
  useEffect(() => {
    dispatch(fetchTrains());
  }, [dispatch]);

  // Update form data when selectedTrain changes
  useEffect(() => {
    if (selectedTrain) {
      setFormData({
        name: selectedTrain.name || '',
        trainNumber: selectedTrain.trainNumber || '',
        trainType: selectedTrain.trainType || 'Express',
        source: selectedTrain.source || '',
        destination: selectedTrain.destination || '',
        departureTime: selectedTrain.departureTime || '',
        arrivalTime: selectedTrain.arrivalTime || '',
        totalSeats: selectedTrain.totalSeats || 0,
        fare: selectedTrain.fare || 0,
        daysOfOperation: selectedTrain.daysOfOperation || []
      });
    } else {
      setFormData({
        name: '',
        trainNumber: '',
        trainType: 'Express',
        source: '',
        destination: '',
        departureTime: '',
        arrivalTime: '',
        totalSeats: 0,
        fare: 0,
        daysOfOperation: []
      });
    }
  }, [selectedTrain]);

  // Handle dialog open/close
  const handleOpenDialog = (train = null) => {
    setSelectedTrain(train);
    if (train) {
      setFormData({
        name: train.name || '',
        trainNumber: train.trainNumber || '',
        trainType: train.trainType || 'Express',
        source: train.source || '',
        destination: train.destination || '',
        departureTime: train.departureTime || '',
        arrivalTime: train.arrivalTime || '',
        totalSeats: train.totalSeats || 0,
        fare: train.fare || 0,
        daysOfOperation: train.daysOfOperation || []
      });
    } else {
      setFormData({
        name: '',
        trainNumber: '',
        trainType: 'Express',
        source: '',
        destination: '',
        departureTime: '',
        arrivalTime: '',
        totalSeats: 0,
        fare: 0,
        daysOfOperation: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTrain(null);
    setFormData({
      name: '',
      trainNumber: '',
      trainType: 'Express',
      source: '',
      destination: '',
      departureTime: '',
      arrivalTime: '',
      totalSeats: 0,
      fare: 0,
      daysOfOperation: []
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle different input types
    const newValue = type === 'checkbox' 
      ? checked 
      : type === 'number' 
        ? parseFloat(value) || 0 
        : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      console.log('Form data:', formData);
      console.log('Available stations:', stations);
      
      // Basic validation
      if (!formData.name || !formData.trainNumber || !formData.source || !formData.destination || 
          !formData.departureTime || !formData.arrivalTime) {
        const missingFields = [];
        if (!formData.name) missingFields.push('name');
        if (!formData.trainNumber) missingFields.push('trainNumber');
        if (!formData.source) missingFields.push('source');
        if (!formData.destination) missingFields.push('destination');
        if (!formData.departureTime) missingFields.push('departureTime');
        if (!formData.arrivalTime) missingFields.push('arrivalTime');
        
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Get the selected stations
      const sourceStation = stations.find(s => s._id === formData.source);
      const destinationStation = stations.find(s => s._id === formData.destination);

      console.log('Selected source station:', sourceStation);
      console.log('Selected destination station:', destinationStation);

      if (!sourceStation) {
        throw new Error(`Source station not found. Selected ID: ${formData.source}`);
      }
      
      if (!destinationStation) {
        throw new Error(`Destination station not found. Selected ID: ${formData.destination}`);
      }

      const trainData = {
        name: formData.name,
        trainNumber: formData.trainNumber,
        source: sourceStation._id,
        destination: destinationStation._id,
        departureTime: new Date(formData.departureTime).toISOString(),
        arrivalTime: new Date(formData.arrivalTime).toISOString(),
        totalSeats: parseInt(formData.totalSeats, 10) || 100,
        availableSeats: parseInt(formData.availableSeats, 10) || (parseInt(formData.totalSeats, 10) || 100),
        fare: parseFloat(formData.fare) || 0,
        trainType: formData.trainType || 'Express',
        daysOfOperation: formData.daysOfOperation || [],
        route: formData.route || []
      };

      console.log('Prepared train data for submission:', JSON.stringify(trainData, null, 2));
      
      try {
        // Make the API call
        const response = await api.post('/trains', trainData);
        console.log('API Response:', response);
        
        // Handle success
        enqueueSnackbar('Train created successfully', { variant: 'success' });
        
        // Refresh the trains list
        dispatch(fetchTrains());
        
        // Close the dialog
        handleCloseDialog();
      } catch (apiError) {
        console.error('API Error:', apiError);
        console.error('API Error Response:', apiError.response?.data);
        throw new Error(apiError.response?.data?.message || 'Failed to create train. Please try again.');
      }
      
    } catch (error) {
      console.error('Error creating train:', error);
      
      // Extract detailed error information
      let errorMessage = 'Failed to create train';
      let errorDetails = [];
      
      if (error.response?.data) {
        console.log('Full error response:', error.response.data);
        
        // Handle validation errors
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          errorDetails = error.response.data.errors.map(e => `${e.param || 'field'} ${e.msg || 'is invalid'}`);
          errorMessage = 'Validation errors:\n' + errorDetails.join('\n');
        } 
        // Handle custom error message
        else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } 
      // Handle network or other errors
      else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('Error details:', errorDetails);
      
      // Show detailed error in snackbar
      enqueueSnackbar(errorMessage, { 
        variant: 'error',
        autoHideDuration: 10000, // Show for 10 seconds
        style: { whiteSpace: 'pre-line' } // Allow line breaks
      });
      
      // Log the full error for debugging
      console.error('Full error object:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        request: error.request,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete train
  const handleDeleteTrain = async (id) => {
    if (window.confirm('Are you sure you want to delete this train?')) {
      try {
        await dispatch(deleteTrain(id)).unwrap();
        enqueueSnackbar('Train deleted successfully', { variant: 'success' });
        // Refresh trains list
        dispatch(fetchTrains());
      } catch (error) {
        enqueueSnackbar(error.message || 'Failed to delete train', { variant: 'error' });
      }
    }
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter trains based on search term using KMP algorithm
  const filteredTrains = useMemo(() => {
    if (!Array.isArray(trains)) return [];
    if (!searchTerm.trim()) return [...trains];
    
    // Search in multiple fields for better matching
    return trains.filter(train => 
      searchInObject(train, ['name', 'trainNumber', 'source.name', 'destination.name'], searchTerm)
    );
  }, [trains, searchTerm]);

  // Pagination
  const paginatedTrains = filteredTrains.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrainIcon color="primary" sx={{ fontSize: 40, mr: 1 }} />
            <Typography variant="h4" component="h1">
              Trains Management
            </Typography>
          </Box>
          {isAdmin && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
            >
              Add New Train
            </Button>
          )}
        </Box>

        <Card elevation={3} sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search trains..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                  endAdornment: searchTerm && (
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
                sx={{ width: 300 }}
              />
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Train Number</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Source</TableCell>
                        <TableCell>Destination</TableCell>
                        <TableCell>Departure</TableCell>
                        <TableCell>Arrival</TableCell>
                        <TableCell>Seats</TableCell>
                        <TableCell>Fare (INR)</TableCell>
                        <TableCell>Days</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedTrains.length > 0 ? (
                        paginatedTrains.map((train) => (
                          <TableRow key={train._id} hover>
                            <TableCell>{train.trainNumber}</TableCell>
                            <TableCell>{train.name}</TableCell>
                            <TableCell>{train.trainType}</TableCell>
                            <TableCell>
                              {stations.find((s) => s._id === train.source)?.name || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {stations.find((s) => s._id === train.destination)?.name || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {new Date(train.departureTime).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {new Date(train.arrivalTime).toLocaleString()}
                            </TableCell>
                            <TableCell>{train.totalSeats}</TableCell>
                            <TableCell>₹{train.fare}</TableCell>
                            <TableCell>
                              {Array.isArray(train.daysOfOperation)
                                ? train.daysOfOperation.join(', ')
                                : 'N/A'}
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDialog(train)}
                                  color="primary"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteTrain(train._id)}
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                            <Typography color="textSecondary">
                              {searchTerm ? 'No matching trains found' : 'No trains available'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredTrains.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Train Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {selectedTrain ? `Edit Train ${selectedTrain.trainNumber}` : 'Add New Train'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="trainNumber"
                      label="Train Number"
                      name="trainNumber"
                      value={formData.trainNumber}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="name"
                      label="Train Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal" required>
                      <InputLabel id="train-type-label">Train Type</InputLabel>
                      <Select
                        labelId="train-type-label"
                        id="trainType"
                        name="trainType"
                        value={formData.trainType}
                        label="Train Type"
                        onChange={handleInputChange}
                      >
                        <MenuItem value="Rajdhani">Rajdhani</MenuItem>
                        <MenuItem value="Shatabdi">Shatabdi</MenuItem>
                        <MenuItem value="Duronto">Duronto</MenuItem>
                        <MenuItem value="Express">Express</MenuItem>
                        <MenuItem value="Passenger">Passenger</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal" required>
                      <InputLabel id="source-label">Source Station</InputLabel>
                      <Select
                        labelId="source-label"
                        id="source"
                        name="source"
                        value={formData.source}
                        onChange={handleInputChange}
                        renderValue={(selected) => {
                          if (!selected) {
                            return <em>Select source station</em>;
                          }
                          const station = stations.find(s => s._id === selected);
                          return station ? `${station.name} (${station.code})` : '';
                        }}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300,
                            },
                          },
                        }}
                      >
                        <MenuItem disabled value="">
                          <em>Select source station</em>
                        </MenuItem>
                        {stations.map((station) => (
                          <MenuItem key={station._id} value={station._id}>
                            {station.name} ({station.code || station._id})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal" required>
                      <InputLabel id="destination-label">Destination Station</InputLabel>
                      <Select
                        labelId="destination-label"
                        id="destination"
                        name="destination"
                        value={formData.destination}
                        onChange={handleInputChange}
                        renderValue={(selected) => {
                          if (!selected) {
                            return <em>Select destination station</em>;
                          }
                          const station = stations.find(s => s._id === selected);
                          return station ? `${station.name} (${station.code})` : '';
                        }}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300,
                            },
                          },
                        }}
                      >
                        <MenuItem disabled value="">
                          <em>Select destination station</em>
                        </MenuItem>
                        {stations.map((station) => (
                          <MenuItem key={station._id} value={station._id}>
                            {station.name} ({station.code || station._id})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="departureTime"
                      label="Departure Time"
                      type="datetime-local"
                      id="departureTime"
                      value={formData.departureTime}
                      onChange={handleInputChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="arrivalTime"
                      label="Arrival Time"
                      type="datetime-local"
                      id="arrivalTime"
                      value={formData.arrivalTime}
                      onChange={handleInputChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="totalSeats"
                      label="Total Seats"
                      type="number"
                      id="totalSeats"
                      value={formData.totalSeats}
                      onChange={handleInputChange}
                      inputProps={{ min: 1 }}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="fare"
                      label="Fare (INR)"
                      type="number"
                      id="fare"
                      value={formData.fare}
                      onChange={handleInputChange}
                      inputProps={{ min: 0, step: 1 }}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl component="fieldset" sx={{ mt: 2, width: '100%' }}>
                      <FormLabel component="legend">Days of Operation</FormLabel>
                      <FormGroup row>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                          <FormControlLabel
                            key={day}
                            control={
                              <Checkbox
                                checked={formData.daysOfOperation.includes(day)}
                                onChange={(e) => {
                                  const newDays = e.target.checked
                                    ? [...formData.daysOfOperation, day]
                                    : formData.daysOfOperation.filter((d) => d !== day);
                                  setFormData({ ...formData, daysOfOperation: newDays });
                                }}
                                name={day}
                              />
                            }
                            label={day}
                          />
                        ))}
                      </FormGroup>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleCloseDialog} color="secondary">
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                disabled={
                  !formData.trainNumber ||
                  !formData.name ||
                  !formData.source ||
                  !formData.destination ||
                  !formData.departureTime ||
                  !formData.arrivalTime ||
                  !formData.totalSeats ||
                  !formData.fare ||
                  formData.daysOfOperation.length === 0
                }
              >
                {selectedTrain ? 'Update Train' : 'Add Train'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default TrainsPage;

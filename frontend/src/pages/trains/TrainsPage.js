import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { highlightPattern, containsPattern } from '../../utils/searchUtils';
import priceUtils from '../../utils/priceBST';
import PriceRangeFilter from '../../components/PriceRangeFilter';
import api from '../../services/api';
import { fetchTrains, deleteTrain, createTrain, updateTrain } from '../../store/slices/trainSlice';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
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
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Train as TrainIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const { createPriceBST } = priceUtils;


const TrainsPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  
  // Selectors
  const { trains = [], loading, error } = useSelector((state) => ({
    trains: state.trains?.trains || [],
    loading: state.trains?.loading || false,
    error: state.trains?.error || null
  }));
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  
  // State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [submitting, setSubmitting] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: null, max: null });
  const [priceBST, setPriceBST] = useState(null);
  const [stations, setStations] = useState([]);

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
    daysOfOperation: [],
    route: []
  });

  // Fetch trains and stations on component mount
  useEffect(() => {
    dispatch(fetchTrains());
    // Fetch stations if needed
    // dispatch(fetchStations());
  }, [dispatch]);


  // Initialize BST when trains data changes
  useEffect(() => {
    if (trains.length > 0) {
      const bst = createPriceBST(trains);
      setPriceBST(bst);
      
      // Set initial price range
      const minPrice = bst.getMinPrice();
      const maxPrice = bst.getMaxPrice();
      setPriceRange({ min: minPrice, max: maxPrice });
    }
  }, [trains]);

  // Filter trains based on search term using KMP algorithm and price range
  const filteredTrains = useMemo(() => {
    if (!Array.isArray(trains)) return [];
    
    let result = [...trains];
    
    // Apply search term filter if exists
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(train => {
        // Check direct train properties
        if (containsPattern(train.name, searchLower) || 
            containsPattern(train.trainNumber, searchLower) ||
            containsPattern(train.trainType, searchLower)) {
          return true;
        }
        
        // Check station names if stations are loaded
        if (stations.length > 0) {
          const sourceStation = stations.find(s => s._id === train.source);
          const destStation = stations.find(s => s._id === train.destination);
          
          if ((sourceStation && (containsPattern(sourceStation.name, searchLower) || 
                                containsPattern(sourceStation.code, searchLower))) ||
              (destStation && (containsPattern(destStation.name, searchLower) || 
                             containsPattern(destStation.code, searchLower)))) {
            return true;
          }
        }
        
        return false;
      });
    }
    
    // Apply price range filter
    if (priceRange.min !== null && priceRange.max !== null) {
      result = result.filter(train => 
        train.fare >= priceRange.min && train.fare <= priceRange.max
      );
    }
    
    return result;
  }, [trains, searchTerm, stations, priceRange]);

  // Pagination
  const paginatedTrains = filteredTrains.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle opening the add train dialog
  const handleOpenDialog = () => {
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
      daysOfOperation: [],
      route: []
    });
    setOpenDialog(true);
  };

  // Handle editing a train
  const handleEditTrain = (train) => {
    setSelectedTrain(train);
    setFormData({
      name: train.name,
      trainNumber: train.trainNumber,
      trainType: train.trainType,
      source: train.source,
      destination: train.destination,
      departureTime: train.departureTime,
      arrivalTime: train.arrivalTime,
      totalSeats: train.totalSeats,
      fare: train.fare,
      daysOfOperation: train.daysOfOperation || [],
      route: train.route || []
    });
    setOpenDialog(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (selectedTrain) {
        // Update existing train
        await dispatch(updateTrain({ id: selectedTrain._id, data: formData })).unwrap();
        setSnackbar({
          open: true,
          message: 'Train updated successfully',
          severity: 'success'
        });
      } else {
        // Create new train
        await dispatch(createTrain(formData)).unwrap();
        setSnackbar({
          open: true,
          message: 'Train created successfully',
          severity: 'success'
        });
      }
      setOpenDialog(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'An error occurred',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (trainId) => {
    if (window.confirm('Are you sure you want to delete this train?')) {
      handleDeleteTrain(trainId);
    }
  };

  // Handle train deletion
  const handleDeleteTrain = async (trainId) => {
    try {
      await dispatch(deleteTrain(trainId)).unwrap();
      setSnackbar({
        open: true,
        message: 'Train deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete train',
        severity: 'error'
      });
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrainIcon color="primary" sx={{ fontSize: 40, mr: 1 }} />
              <Typography variant="h4" component="h1">
                Trains Management
              </Typography>
            </Box>
            <Chip 
              label="Search via KMP Algo" 
              color="primary" 
              variant="outlined"
              size="small"
              sx={{ 
                height: '24px',
                fontSize: '0.75rem',
                fontWeight: 500 
              }}
            />
          </Stack>
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

        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} md={9}>
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
                        {paginatedTrains.map((train) => (
                          <TableRow key={train._id} hover>
                            <TableCell>
                              {searchTerm ? highlightPattern(train.trainNumber, searchTerm) : train.trainNumber}
                            </TableCell>
                            <TableCell>
                              {searchTerm ? highlightPattern(train.name, searchTerm) : train.name}
                            </TableCell>
                            <TableCell>
                              {searchTerm ? highlightPattern(train.trainType, searchTerm) : train.trainType}
                            </TableCell>
                            <TableCell>
                              {(() => {
                                const station = stations.find(s => s._id === train.source);
                                return station 
                                  ? (searchTerm ? highlightPattern(station.name, searchTerm) : station.name)
                                  : 'N/A';
                              })()}
                            </TableCell>
                            <TableCell>
                              {(() => {
                                const station = stations.find(s => s._id === train.destination);
                                return station 
                                  ? (searchTerm ? highlightPattern(station.name, searchTerm) : station.name)
                                  : 'N/A';
                              })()}
                            </TableCell>
                            <TableCell>
                              {new Date(train.departureTime).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {new Date(train.arrivalTime).toLocaleString()}
                            </TableCell>
                            <TableCell>{train.totalSeats}</TableCell>
                            <TableCell>₹{train.fare?.toLocaleString()}</TableCell>
                            <TableCell>
                              {train.daysOfOperation?.join(', ') || 'Daily'}
                            </TableCell>
                            <TableCell align="right">
                              {isAdmin && (
                                <>
                                  <IconButton onClick={() => handleEditTrain(train)} size="small">
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton 
                                    onClick={() => handleDeleteClick(train._id)} 
                                    size="small"
                                    color="error"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <TablePagination
                      rowsPerPageOptions={[10, 25, 50, 100]}
                      component="div"
                      count={filteredTrains.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Price Range Filter */}
          <Grid item xs={12} md={3}>
            <PriceRangeFilter 
              tickets={trains}
              onPriceRangeChange={setPriceRange}
              initialMin={priceRange.min}
              initialMax={priceRange.max}
            />
          </Grid>
        </Grid>

        {/* Add/Edit Train Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {selectedTrain ? 'Edit Train' : 'Add New Train'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Train Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Train Number"
                    name="trainNumber"
                    value={formData.trainNumber}
                    onChange={handleInputChange}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Train Type</InputLabel>
                    <Select
                      name="trainType"
                      value={formData.trainType}
                      onChange={handleInputChange}
                      label="Train Type"
                      required
                    >
                      <MenuItem value="Express">Express</MenuItem>
                      <MenuItem value="Superfast">Superfast</MenuItem>
                      <MenuItem value="Rajdhani">Rajdhani</MenuItem>
                      <MenuItem value="Shatabdi">Shatabdi</MenuItem>
                      <MenuItem value="Duronto">Duronto</MenuItem>
                      <MenuItem value="Vande Bharat">Vande Bharat</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Source Station"
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Destination Station"
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Departure Time"
                    name="departureTime"
                    type="datetime-local"
                    value={formData.departureTime}
                    onChange={handleInputChange}
                    margin="normal"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Arrival Time"
                    name="arrivalTime"
                    type="datetime-local"
                    value={formData.arrivalTime}
                    onChange={handleInputChange}
                    margin="normal"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Total Seats"
                    name="totalSeats"
                    type="number"
                    value={formData.totalSeats}
                    onChange={handleInputChange}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Fare (INR)"
                    name="fare"
                    type="number"
                    value={formData.fare}
                    onChange={handleInputChange}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl component="fieldset" margin="normal">
                    <FormLabel component="legend">Days of Operation</FormLabel>
                    <FormGroup row>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                        <FormControlLabel
                          key={day}
                          control={
                            <Checkbox
                              checked={formData.daysOfOperation.includes(day)}
                              onChange={(e) => {
                                const newDays = e.target.checked
                                  ? [...formData.daysOfOperation, day]
                                  : formData.daysOfOperation.filter(d => d !== day);
                                setFormData(prev => ({
                                  ...prev,
                                  daysOfOperation: newDays
                                }));
                              }}
                              name={day}
                            />
                          }
                          label={day.slice(0, 3)}
                        />
                      ))}
                    </FormGroup>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
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

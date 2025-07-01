import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, IconButton, Tooltip, Alert, CircularProgress,
  TextField, MenuItem, Select, InputLabel, FormControl, Chip
} from '@mui/material';
import { Search as SearchIcon, Visibility, Receipt } from '@mui/icons-material';
import { bookingsAPI } from '../../../services/api';
import { format } from 'date-fns';

const statusColors = {
  confirmed: 'success',
  pending: 'warning',
  cancelled: 'error',
  completed: 'info'
};

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (statusFilter !== 'all') params.status = statusFilter;
        
        const { data } = await bookingsAPI.getBookings(params);
        setBookings(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [searchTerm, statusFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleView = (id) => {
    navigate(`/admin/bookings/${id}`);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'PPpp');
  };

  if (loading && !searchTerm) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Box mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Manage Bookings
          </Typography>
          <Typography variant="body1" color="textSecondary">
            View and manage all bookings in the system
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <Box flex={1} minWidth={300}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Box>
          <Box width={200}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Paper elevation={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>PNR</TableCell>
                  <TableCell>Train</TableCell>
                  <TableCell>Passenger</TableCell>
                  <TableCell>Journey Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.length > 0 ? (
                  bookings
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((booking) => (
                      <TableRow key={booking._id} hover>
                        <TableCell>{booking.pnr}</TableCell>
                        <TableCell>
                          {booking.train?.trainNumber} - {booking.train?.name}
                        </TableCell>
                        <TableCell>
                          {booking.passengerDetails?.name}
                        </TableCell>
                        <TableCell>{formatDate(booking.journeyDate)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={booking.status}
                            color={statusColors[booking.status] || 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>₹{booking.totalFare?.toFixed(2)}</TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton onClick={() => handleView(booking._id)} size="small">
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Ticket">
                            <IconButton size="small" onClick={() => navigate(`/bookings/${booking._id}/ticket`)}>
                              <Receipt fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'No matching bookings found' 
                        : 'No bookings available'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={bookings.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminBookingsPage;

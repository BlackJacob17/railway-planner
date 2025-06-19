import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, IconButton, Tooltip, Alert, CircularProgress
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { trainsAPI } from '../../../services/api';

const AdminTrainsPage = () => {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        setLoading(true);
        const { data } = await trainsAPI.getTrains();
        setTrains(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch trains');
      } finally {
        setLoading(false);
      }
    };

    fetchTrains();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (id) => {
    navigate(`/admin/trains/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this train?')) {
      try {
        await trainsAPI.deleteTrain(id);
        setTrains(trains.filter(train => train._id !== id));
      } catch (err) {
        setError(err.message || 'Failed to delete train');
      }
    }
  };

  const handleView = (id) => {
    navigate(`/trains/${id}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">Manage Trains</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => navigate('/admin/trains/new')}
          >
            Add New Train
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Train Number</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Destination</TableCell>
                  <TableCell>Departure</TableCell>
                  <TableCell>Arrival</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trains
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((train) => (
                    <TableRow key={train._id} hover>
                      <TableCell>{train.trainNumber}</TableCell>
                      <TableCell>{train.name}</TableCell>
                      <TableCell>{train.source?.name || train.source}</TableCell>
                      <TableCell>{train.destination?.name || train.destination}</TableCell>
                      <TableCell>{new Date(train.departureTime).toLocaleTimeString()}</TableCell>
                      <TableCell>{new Date(train.arrivalTime).toLocaleTimeString()}</TableCell>
                      <TableCell>
                        <Tooltip title="View">
                          <IconButton onClick={() => handleView(train._id)} size="small">
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEdit(train._id)} size="small">
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => handleDelete(train._id)} size="small" color="error">
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={trains.length}
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

export default AdminTrainsPage;

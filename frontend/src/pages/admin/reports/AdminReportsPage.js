import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Paper, Grid, Card, CardContent,
  CircularProgress, Alert, Tabs, Tab, FormControl, InputLabel,
  Select, MenuItem, Button, TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, LineChart, 
  Line, PieChart, Pie, Cell 
} from 'recharts';
import { format, subDays } from 'date-fns';

// Import statements for API services are kept for future use
// import { bookingsAPI, trainsAPI, stationsAPI } from '../../../services/api';

// Icons
import ReceiptIcon from '@mui/icons-material/Receipt';
import PeopleIcon from '@mui/icons-material/People';
import ScheduleIcon from '@mui/icons-material/Schedule';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 30),
    endDate: new Date()
  });
  const [reportType, setReportType] = useState('daily');
  const [reportData, setReportData] = useState({
    bookings: [],
    revenue: [],
    trains: [],
    stations: []
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange, reportType, fetchReportData]);

  // Mock data generation functions
  const generateMockBookings = useCallback(() => {
    const data = [];
    
    for (let i = 0; i < 7; i++) {
      data.push({
        date: format(subDays(new Date(), 6 - i), 'MMM dd'),
        confirmed: Math.floor(Math.random() * 100) + 50,
        cancelled: Math.floor(Math.random() * 30) + 10,
        pending: Math.floor(Math.random() * 20) + 5
      });
    }
    return data;
  }, []);

  const generateMockRevenue = useCallback(() => {
    const data = [];
    for (let i = 0; i < 12; i++) {
      data.push({
        month: format(new Date(2023, i, 1), 'MMM'),
        revenue: Math.floor(Math.random() * 50000) + 10000,
        bookings: Math.floor(Math.random() * 500) + 200
      });
    }
    return data;
  }, []);

  const generateMockTrains = useCallback(() => {
    const trains = ['Rajdhani Express', 'Shatabdi', 'Duronto', 'Garib Rath', 'Vande Bharat'];
    return trains.map(train => ({
      name: train,
      bookings: Math.floor(Math.random() * 1000) + 100,
      revenue: Math.floor(Math.random() * 500000) + 100000
    }));
  }, []);

  const generateMockStations = useCallback(() => {
    const stations = ['New Delhi', 'Mumbai', 'Chennai', 'Kolkata', 'Bengaluru', 'Hyderabad'];
    return stations.map(station => ({
      name: station,
      value: Math.floor(Math.random() * 1000) + 100
    }));
  }, []);

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real app, you would make API calls to fetch report data
      // For now, we'll use mock data
      const mockBookings = generateMockBookings();
      const mockRevenue = generateMockRevenue();
      const mockTrains = generateMockTrains();
      const mockStations = generateMockStations();

      setReportData({
        bookings: mockBookings,
        revenue: mockRevenue,
        trains: mockTrains,
        stations: mockStations
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  }, [generateMockBookings, generateMockRevenue, generateMockTrains, generateMockStations]);



  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDateChange = (field) => (date) => {
    setDateRange(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleReportTypeChange = (event) => {
    setReportType(event.target.value);
  };

  const handleDownloadReport = () => {
    // In a real app, this would generate and download a report
    alert('Downloading report...');
  };

  const renderBookingStats = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Bookings Overview</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.bookings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="confirmed" fill="#4caf50" name="Confirmed" />
                <Bar dataKey="cancelled" fill="#f44336" name="Cancelled" />
                <Bar dataKey="pending" fill="#ff9800" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Revenue Trend</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue (₹)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTrainStats = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Top Trains by Bookings</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.trains}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {reportData.trains.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Top Stations</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                layout="vertical"
                data={reportData.stations}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Reports & Analytics
            </Typography>
            <Typography variant="body1" color="textSecondary">
              View and analyze system performance and statistics
            </Typography>
          </Box>
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleDownloadReport}
            >
              Export Report
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
            <FormControl sx={{ minWidth: 150 }} size="small">
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                onChange={handleReportTypeChange}
                label="Report Type"
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={dateRange.startDate}
                onChange={handleDateChange('startDate')}
                renderInput={(params) => <TextField {...params} size="small" />}
              />
              <DatePicker
                label="End Date"
                value={dateRange.endDate}
                onChange={handleDateChange('endDate')}
                renderInput={(params) => <TextField {...params} size="small" />}
              />
            </LocalizationProvider>
            <Button
              variant="contained"
              onClick={fetchReportData}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Apply'}
            </Button>
          </Box>
        </Paper>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ mb: 3 }}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Booking Analytics" />
          <Tab label="Train Performance" />
          <Tab label="Revenue Reports" />
          <Tab label="User Activity" />
        </Tabs>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {activeTab === 0 && renderBookingStats()}
            {activeTab === 1 && renderTrainStats()}
            {activeTab === 2 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Revenue Reports</Typography>
                  <Typography>Revenue reports will be displayed here</Typography>
                </CardContent>
              </Card>
            )}
            {activeTab === 3 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>User Activity</Typography>
                  <Typography>User activity reports will be displayed here</Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ReportsPage;

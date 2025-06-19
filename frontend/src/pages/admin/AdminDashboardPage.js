import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  useTheme,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  Chip,
  Alert
} from '@mui/material';
import {
  People as PeopleIcon,
  Train as TrainIcon,
  Receipt as ReceiptIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { fetchDashboardStats } from '../../store/slices/dashboardSlice';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <Card sx={{ height: '100%', borderLeft: `4px solid ${color}` }}>
    <CardContent>
      <Box display="flex" alignItems="center" mb={2}>
        <Avatar sx={{ bgcolor: `${color}20`, color: color, mr: 2 }}>
          <Icon />
        </Avatar>
        <Box>
          <Typography variant="subtitle2" color="textSecondary">
            {title}
          </Typography>
          <Typography variant="h5">
            {value}
          </Typography>
        </Box>
      </Box>
      {trend && (
        <Chip 
          size="small" 
          label={trend.value} 
          color={trend.positive ? 'success' : 'error'}
          icon={trend.positive ? <TrendingUpIcon /> : <WarningIcon />}
          sx={{ mt: 1 }}
        />
      )}
    </CardContent>
  </Card>
);

const RecentActivity = ({ activities = [] }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Recent Activities
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <List>
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <React.Fragment key={index}>
              <ListItem 
                secondaryAction={
                  <IconButton edge="end" size="small">
                    <ArrowForwardIcon />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                    {activity.icon}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={activity.title}
                  secondary={activity.description}
                  primaryTypographyProps={{ variant: 'subtitle2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
              {index < activities.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 2 }}>
            No recent activities
          </Typography>
        )}
      </List>
    </CardContent>
  </Card>
);

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { stats, loading, error } = useSelector((state) => state.dashboard || {});

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  // Mock data for the chart
  const chartData = [
    { name: 'Jan', users: 4000, bookings: 2400, revenue: 2400 },
    { name: 'Feb', users: 3000, bookings: 1398, revenue: 2210 },
    { name: 'Mar', users: 2000, bookings: 9800, revenue: 2290 },
    { name: 'Apr', users: 2780, bookings: 3908, revenue: 2000 },
    { name: 'May', users: 1890, bookings: 4800, revenue: 2181 },
    { name: 'Jun', users: 2390, bookings: 3800, revenue: 2500 },
  ];

  // Mock recent activities
  const recentActivities = [
    { 
      title: 'New booking received', 
      description: 'Booking #1234 for Delhi to Mumbai',
      icon: <ReceiptIcon fontSize="small" />
    },
    { 
      title: 'New user registered', 
      description: 'John Doe (john@example.com)',
      icon: <PeopleIcon fontSize="small" />
    },
    { 
      title: 'Train schedule updated', 
      description: 'Rajdhani Express timings changed',
      icon: <ScheduleIcon fontSize="small" />
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Users" 
            value={stats?.totalUsers || '0'} 
            icon={PeopleIcon} 
            color={theme.palette.primary.main}
            trend={{ value: '+12%', positive: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Trains" 
            value={stats?.activeTrains || '0'} 
            icon={TrainIcon} 
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Today's Bookings" 
            value={stats?.todayBookings || '0'} 
            icon={ReceiptIcon} 
            color={theme.palette.warning.main}
            trend={{ value: '+5%', positive: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Pending Requests" 
            value={stats?.pendingRequests || '0'} 
            icon={NotificationsIcon} 
            color={theme.palette.error.main}
            trend={{ value: '3 new', positive: false }}
          />
        </Grid>
      </Grid>

      {/* Charts and Recent Activities */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Overview
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      name="Users" 
                      stroke={theme.palette.primary.main} 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="bookings" 
                      name="Bookings" 
                      stroke={theme.palette.success.main} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      name="Revenue (₹)" 
                      stroke={theme.palette.warning.main} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <RecentActivity activities={recentActivities} />
        </Grid>
      </Grid>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="primary">
                      {stats?.totalBookings || '0'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Bookings
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="success.main">
                      {stats?.activeTrains || '0'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Active Trains
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="warning.main">
                      {stats?.totalRevenue || '₹0'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Revenue
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="secondary">
                      {stats?.avgRating || '0.0'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Avg. Rating
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboardPage;

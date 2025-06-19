import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchStation } from '../../store/slices/stationSlice';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import TrainIcon from '@mui/icons-material/Train';
import { styled } from '@mui/material/styles';

const DetailsContainer = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
}));

const Section = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

export default function StationDetailsPage() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { currentStation, loading, error } = useSelector((state) => state.station);

  useEffect(() => {
    if (id) {
      dispatch(fetchStation(id));
    }
  }, [dispatch, id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
  }

  if (!currentStation) {
    return <Alert severity="info" sx={{ m: 4 }}>Station not found.</Alert>;
  }

  return (
    <Container maxWidth="md">
      <DetailsContainer elevation={3}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Typography component="h1" variant="h4">
              {currentStation.name}
            </Typography>
          </Grid>
          <Grid item>
            <Chip label={`Code: ${currentStation.code}`} color="primary" />
          </Grid>
        </Grid>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {currentStation.location}
        </Typography>
        
        <Divider sx={{ my: 3 }} />

        <Section>
          <Typography variant="h5" gutterBottom>
            Trains Serving This Station
          </Typography>
          {currentStation.trains && currentStation.trains.length > 0 ? (
            <List>
              {currentStation.trains.map((train) => (
                <ListItem key={train._id} divider>
                  <ListItemText
                    primary={`${train.name} (#${train.trainNumber})`}
                    secondary={`Runs on: ${train.daysOfOperation.join(', ')}`}
                  />
                  <TrainIcon color="action" />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No trains currently scheduled for this station.</Typography>
          )}
        </Section>
      </DetailsContainer>
    </Container>
  );
}


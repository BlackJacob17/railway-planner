import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrainReviews, createReview, searchReviews } from '../../store/slices/reviewSlice';
import { fetchTrains } from '../../store/slices/trainSlice';
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
  Rating,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Autocomplete
} from '@mui/material';
import { styled } from '@mui/material/styles';

const ReviewsContainer = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
}));

const ReviewFormContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

export default function ReviewsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { reviews = {}, loading, error, message, searchResults = [] } = useSelector((state) => state.reviews || {});
  const { trains: trainsState = {} } = useSelector((state) => state.trains || {});
  const trains = Array.isArray(trainsState.trains) ? trainsState.trains : [];
  const trainsLoading = trainsState.loading || false;
  
  // Get all reviews as a flat array
  const allReviews = Object.values(reviews).flat();

  const [selectedTrain, setSelectedTrain] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    if (selectedTrain) {
      dispatch(fetchTrainReviews({ trainId: selectedTrain }));
    } else {
      dispatch(fetchTrainReviews());
    }
    dispatch(fetchTrains());
  }, [dispatch, selectedTrain]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'comment') {
      setComment(value);
    } else if (name === 'rating') {
      setRating(value);
    }
  };

  const handleTrainChange = (event, newValue) => {
    setSelectedTrain(newValue);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTrain || !user) return;
    
    dispatch(createReview({
      train: selectedTrain,
      rating,
      comment,
      user: user._id
    })).then(() => {
      // Refresh reviews after submission
      if (selectedTrain) {
        dispatch(fetchTrainReviews({ trainId: selectedTrain }));
      }
      setComment('');
      setRating(5);
    });
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      dispatch(searchReviews({ keyword: searchQuery }));
    }
  };
  
  // Get reviews for the selected train or all reviews
  const currentReviews = selectedTrain ? (reviews[selectedTrain] || []) : allReviews;

  return (
    <Container maxWidth="md">
      <ReviewsContainer elevation={3}>
        <Typography component="h1" variant="h4" gutterBottom>
          Train Reviews
        </Typography>

        {user ? (
          <ReviewFormContainer component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" gutterBottom>Leave a Review</Typography>
            {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
            {message && <Alert severity="success" sx={{ my: 2 }}>{message}</Alert>}
            
            <Autocomplete
              options={trains}
              getOptionLabel={(option) => `${option.name} (${option.trainNumber})`}
              value={Array.isArray(trains) ? (trains.find(t => t._id === selectedTrain) || null) : null}
              onChange={(_, newValue) => setSelectedTrain(newValue?._id)}
              loading={trainsLoading}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Select a Train" 
                  margin="normal" 
                  required 
                />
              )}
              fullWidth
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ mb: 2 }}>
              <Typography component="legend">Rating</Typography>
              <Rating
                name="rating"
                value={rating}
                onChange={(_, newValue) => setRating(newValue)}
                precision={0.5}
              />
            </Box>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Your Comment"
              name="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              margin="normal"
              required
            />
            
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              sx={{ mt: 2 }}
              disabled={loading || !selectedTrain}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Review'}
            </Button>
          </ReviewFormContainer>
        ) : (
          <Alert severity="info">Please log in to leave a review.</Alert>
        )}

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 3 }}>
          <form onSubmit={handleSearch}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                endAdornment: (
                  <Button type="submit" color="primary">
                    Search
                  </Button>
                ),
              }}
            />
          </form>
        </Box>

        <Typography variant="h6" gutterBottom>
          {selectedTrain 
            ? `Reviews for ${(Array.isArray(trains) ? trains.find(t => t._id === selectedTrain) : null)?.name || 'Selected Train'}`
            : 'All Reviews'}
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : currentReviews.length === 0 ? (
          <Alert severity="info">No reviews found.</Alert>
        ) : (
          <List>
            {currentReviews.map((review) => (
              <React.Fragment key={review._id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>{review.user?.firstName?.charAt(0) || 'U'}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Rating value={review.rating} readOnly />}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {`${review.user?.firstName || 'User'} ${review.user?.lastName || ''} on ${review.train?.name || 'Train'}`}
                        </Typography>
                        {` — ${review.comment}`}
                      </>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </ReviewsContainer>
    </Container>
  );
}


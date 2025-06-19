import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewsAPI } from '../../services/api';

// Async thunks
export const fetchTrainReviews = createAsyncThunk(
  'reviews/fetchTrainReviews',
  async ({ trainId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await reviewsAPI.getTrainReviews(trainId, params);
      return { ...response, trainId };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch train reviews');
    }
  }
);

export const createReview = createAsyncThunk(
  'reviews/createReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const response = await reviewsAPI.createReview(reviewData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create review');
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await reviewsAPI.updateReview(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update review');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (id, { rejectWithValue }) => {
    try {
      await reviewsAPI.deleteReview(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete review');
    }
  }
);

export const toggleLikeReview = createAsyncThunk(
  'reviews/toggleLikeReview',
  async (id, { rejectWithValue, getState }) => {
    try {
      const response = await reviewsAPI.toggleLike(id);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to like review');
    }
  }
);

export const toggleDislikeReview = createAsyncThunk(
  'reviews/toggleDislikeReview',
  async (id, { rejectWithValue, getState }) => {
    try {
      const response = await reviewsAPI.toggleDislike(id);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to dislike review');
    }
  }
);

export const searchReviews = createAsyncThunk(
  'reviews/searchReviews',
  async ({ keyword, params = {} }, { rejectWithValue }) => {
    try {
      const response = await reviewsAPI.searchReviews(keyword, params);
      return { ...response, keyword };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to search reviews');
    }
  }
);

const reviewSlice = createSlice({
  name: 'reviews',
  initialState: {
    reviews: {},
    searchResults: [],
    loading: false,
    searching: false,
    error: null,
    total: 0,
    totalPages: 1,
    currentPage: 1,
    averageRating: 0,
  },
  reducers: {
    clearReviews: (state) => {
      state.reviews = {};
      state.searchResults = [];
      state.loading = false;
      state.searching = false;
      state.error = null;
      state.total = 0;
      state.totalPages = 1;
      state.currentPage = 1;
      state.averageRating = 0;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searching = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Train Reviews
    builder.addCase(fetchTrainReviews.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTrainReviews.fulfilled, (state, action) => {
      state.loading = false;
      const { trainId, data, total, totalPages, currentPage, averageRating } = action.payload;
      state.reviews = {
        ...state.reviews,
        [trainId]: data || [],
      };
      state.total = total || 0;
      state.totalPages = totalPages || 1;
      state.currentPage = currentPage || 1;
      state.averageRating = averageRating || 0;
    });
    builder.addCase(fetchTrainReviews.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Create Review
    builder.addCase(createReview.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createReview.fulfilled, (state, action) => {
      state.loading = false;
      const { train } = action.payload;
      if (state.reviews[train]) {
        state.reviews[train].unshift(action.payload);
        state.total += 1;
        // Recalculate average rating
        const totalRating = state.reviews[train].reduce(
          (sum, review) => sum + review.rating,
          0
        );
        state.averageRating = totalRating / state.reviews[train].length;
      }
    });
    builder.addCase(createReview.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Update Review
    builder.addCase(updateReview.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateReview.fulfilled, (state, action) => {
      state.loading = false;
      const { _id, train } = action.payload;
      
      // Update in train reviews
      if (state.reviews[train]) {
        const index = state.reviews[train].findIndex(
          (review) => review._id === _id
        );
        if (index !== -1) {
          state.reviews[train][index] = action.payload;
          // Recalculate average rating
          const totalRating = state.reviews[train].reduce(
            (sum, review) => sum + review.rating,
            0
          );
          state.averageRating = totalRating / state.reviews[train].length;
        }
      }
      
      // Update in search results
      const searchIndex = state.searchResults.findIndex(
        (review) => review._id === _id
      );
      if (searchIndex !== -1) {
        state.searchResults[searchIndex] = action.payload;
      }
    });
    builder.addCase(updateReview.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Delete Review
    builder.addCase(deleteReview.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteReview.fulfilled, (state, action) => {
      state.loading = false;
      const { trainId, reviewId } = action.meta.arg;
      
      // Remove from train reviews
      if (state.reviews[trainId]) {
        state.reviews[trainId] = state.reviews[trainId].filter(
          (review) => review._id !== reviewId
        );
        state.total -= 1;
        // Recalculate average rating if there are reviews left
        if (state.reviews[trainId].length > 0) {
          const totalRating = state.reviews[trainId].reduce(
            (sum, review) => sum + review.rating,
            0
          );
          state.averageRating = totalRating / state.reviews[trainId].length;
        } else {
          state.averageRating = 0;
        }
      }
      
      // Remove from search results
      state.searchResults = state.searchResults.filter(
        (review) => review._id !== reviewId
      );
    });
    builder.addCase(deleteReview.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Toggle Like Review
    builder.addCase(toggleLikeReview.fulfilled, (state, action) => {
      const { id, likes, dislikes, userLiked, userDisliked } = action.payload;
      
      // Update in train reviews
      Object.keys(state.reviews).forEach((trainId) => {
        const index = state.reviews[trainId].findIndex(
          (review) => review._id === id
        );
        if (index !== -1) {
          state.reviews[trainId][index].likes = likes;
          state.reviews[trainId][index].dislikes = dislikes;
          state.reviews[trainId][index].userLiked = userLiked;
          state.reviews[trainId][index].userDisliked = userDisliked;
        }
      });
      
      // Update in search results
      const searchIndex = state.searchResults.findIndex(
        (review) => review._id === id
      );
      if (searchIndex !== -1) {
        state.searchResults[searchIndex].likes = likes;
        state.searchResults[searchIndex].dislikes = dislikes;
        state.searchResults[searchIndex].userLiked = userLiked;
        state.searchResults[searchIndex].userDisliked = userDisliked;
      }
    });

    // Toggle Dislike Review
    builder.addCase(toggleDislikeReview.fulfilled, (state, action) => {
      const { id, likes, dislikes, userLiked, userDisliked } = action.payload;
      
      // Update in train reviews
      Object.keys(state.reviews).forEach((trainId) => {
        const index = state.reviews[trainId].findIndex(
          (review) => review._id === id
        );
        if (index !== -1) {
          state.reviews[trainId][index].likes = likes;
          state.reviews[trainId][index].dislikes = dislikes;
          state.reviews[trainId][index].userLiked = userLiked;
          state.reviews[trainId][index].userDisliked = userDisliked;
        }
      });
      
      // Update in search results
      const searchIndex = state.searchResults.findIndex(
        (review) => review._id === id
      );
      if (searchIndex !== -1) {
        state.searchResults[searchIndex].likes = likes;
        state.searchResults[searchIndex].dislikes = dislikes;
        state.searchResults[searchIndex].userLiked = userLiked;
        state.searchResults[searchIndex].userDisliked = userDisliked;
      }
    });

    // Search Reviews
    builder.addCase(searchReviews.pending, (state) => {
      state.searching = true;
      state.error = null;
    });
    builder.addCase(searchReviews.fulfilled, (state, action) => {
      state.searching = false;
      state.searchResults = action.payload.data || [];
      state.total = action.payload.total || 0;
      state.totalPages = action.payload.totalPages || 1;
      state.currentPage = action.payload.currentPage || 1;
    });
    builder.addCase(searchReviews.rejected, (state, action) => {
      state.searching = false;
      state.error = action.payload;
    });
  },
});

export const { clearReviews, clearSearchResults, clearError } = reviewSlice.actions;
export default reviewSlice.reducer;

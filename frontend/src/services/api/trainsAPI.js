import api from '../api';

const trainsAPI = {
  // Get all trains without pagination
  getTrains: async () => {
    try {
      const response = await api.get('/api/trains');
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching trains:', error);
      throw error;
    }
  },

  // Create a new train
  createTrain: async (trainData) => {
    try {
      const response = await api.post('/api/trains', trainData);
      return response.data;
    } catch (error) {
      console.error('Error creating train:', error);
      throw error;
    }
  },

  // Update a train
  updateTrain: async (id, trainData) => {
    try {
      const response = await api.put(`/api/trains/${id}`, trainData);
      return response.data;
    } catch (error) {
      console.error('Error updating train:', error);
      throw error;
    }
  },

  // Delete a train
  deleteTrain: async (id) => {
    try {
      const response = await api.delete(`/api/trains/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting train:', error);
      throw error;
    }
  },

  // Get a single train by ID
  getTrain: async (id) => {
    try {
      const response = await api.get(`/api/trains/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching train:', error);
      throw error;
    }
  },
  // Search trains based on filters
  searchTrains: async (queryParams) => {
    try {
      const response = await api.get(`/api/trains/search?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error searching trains:', error);
      throw error;
    }
  },

  // Get train details by ID
  getTrainById: async (trainId) => {
    try {
      const response = await api.get(`/api/trains/${trainId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching train details:', error);
      throw error;
    }
  },

  // Get seat availability
  checkAvailability: async (trainId, { date, class: classType }) => {
    try {
      const response = await api.get(
        `/api/trains/${trainId}/availability?date=${date}&class=${classType}`
      );
      return response.data;
    } catch (error) {
      console.error('Error checking seat availability:', error);
      throw error;
    }
  },

  // Get fare details
  getFare: async (trainId, { from, to, class: classType, date }) => {
    try {
      const response = await api.get(
        `/api/trains/${trainId}/fare?from=${from}&to=${to}&class=${classType}&date=${date}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching fare details:', error);
      throw error;
    }
  },

  // Get running status
  getRunningStatus: async (trainNumber, date) => {
    try {
      const response = await api.get(
        `/api/trains/status/${trainNumber}?date=${date}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching running status:', error);
      throw error;
    }
  },

  // Get live train status
  getLiveStatus: async (trainNumber) => {
    try {
      const response = await api.get(`/api/trains/live-status/${trainNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching live status:', error);
      throw error;
    }
  },

  // Get train schedule
  getTrainSchedule: async (trainNumber) => {
    try {
      const response = await api.get(`/api/trains/schedule/${trainNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching train schedule:', error);
      throw error;
    }
  },

  // Get station autocomplete suggestions
  getStationSuggestions: async (query) => {
    try {
      const response = await api.get(`/api/stations/suggest?q=${query}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching station suggestions:', error);
      throw error;
    }
  },

  // Get popular routes
  getPopularRoutes: async () => {
    try {
      const response = await api.get('/api/routes/popular');
      return response.data;
    } catch (error) {
      console.error('Error fetching popular routes:', error);
      throw error;
    }
  },

  // Get train between stations
  getTrainsBetweenStations: async (from, to) => {
    try {
      const response = await api.get(`/api/trains/between-stations?from=${from}&to=${to}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trains between stations:', error);
      throw error;
    }
  },

  // Get train fare chart
  getFareChart: async (trainNumber, from, to) => {
    try {
      const response = await api.get(
        `/api/trains/fare-chart/${trainNumber}?from=${from}&to=${to}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching fare chart:', error);
      throw error;
    }
  },
};

export default trainsAPI;

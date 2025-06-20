const express = require('express');
const router = express.Router();
const pathfindingService = require('../services/PathfindingService');
const KMPSearch = require('../utils/KMPSearch');
const Trie = require('../utils/Trie');
const QuickSort = require('../utils/QuickSort');
const Train = require('../models/Train');
const Review = require('../models/Review');
const Station = require('../models/Station');

// Initialize pathfinding service with data from database
const initializePathfinding = async () => {
  try {
    const stations = await Station.find({});
    const trains = await Train.find().populate('route.station');
    
    // Create routes from train routes
    const routes = [];
    
    trains.forEach(train => {
      // Sort route by sequence if needed (assuming route is already in order)
      const route = [...train.route].sort((a, b) => {
        // If sequence is available, use it, otherwise use array order
        if (a.sequence !== undefined && b.sequence !== undefined) {
          return a.sequence - b.sequence;
        }
        return 0;
      });
      
      for (let i = 0; i < route.length - 1; i++) {
        routes.push({
          source: route[i].station._id.toString(),
          destination: route[i + 1].station._id.toString(),
          distance: route[i + 1].distance - route[i].distance,
          trains: [{
            trainId: train._id,
            trainNumber: train.trainNumber,
            trainName: train.name, // Using name instead of trainName to match the model
            departureTime: route[i].departureTime,
            arrivalTime: route[i + 1].arrivalTime
          }]
        });
      }
    });
    
    pathfindingService.initializeGraph(stations, routes);
    console.log('Pathfinding service initialized');
  } catch (error) {
    console.error('Error initializing pathfinding service:', error);
  }
};

// Initialize on server start
initializePathfinding();

// Find all paths between stations with a limit
router.get('/search-path', async (req, res) => {
  try {
    const { from, to, limit = 5 } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide both source and destination stations' 
      });
    }
    
    const paths = pathfindingService.findAllPaths(from, to, parseInt(limit));
    
    if (!paths || paths.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'No paths found between the specified stations' 
      });
    }
    
    res.json({ 
      success: true,
      count: paths.length,
      data: paths 
    });
  } catch (error) {
    console.error('Error finding paths:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error finding paths',
      error: error.message 
    });
  }
});

// Get shortest path between stations
router.get('/shortest-path', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide both source and destination stations' 
      });
    }
    
    const path = await pathfindingService.findShortestPath(from, to);
    
    if (!path) {
      return res.status(404).json({ 
        success: false,
        message: 'No path found between the specified stations' 
      });
    }
    
    res.json({ 
      success: true,
      data: path 
    });
  } catch (error) {
    console.error('Error finding shortest path:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error finding shortest path',
      error: error.message 
    });
  }
});

// Search reviews using KMP algorithm
router.get('/reviews/search', async (req, res) => {
  try {
    const { query, trainId, stationId, limit = 10 } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ 
        success: false,
        message: 'Search query must be at least 2 characters long' 
      });
    }
    
    const filter = {};
    if (trainId) filter.train = trainId;
    if (stationId) filter.station = stationId;
    
    const reviews = await Review.find(filter)
      .populate('user', 'name')
      .populate('train', 'trainNumber trainName')
      .limit(parseInt(limit));
    
    const results = reviews
      .map(review => {
        const positions = KMPSearch.search(review.comment.toLowerCase(), query.toLowerCase());
        if (positions.length > 0) {
          return {
            ...review.toObject(),
            matches: positions.length,
            highlightedText: KMPSearch.highlightText(review.comment, query, 'highlight')
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b.matches - a.matches);
    
    res.json({ 
      success: true,
      count: results.length,
      data: results 
    });
  } catch (error) {
    console.error('Error searching reviews:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error searching reviews',
      error: error.message 
    });
  }
});

// Autocomplete for reviews using Trie
router.get('/reviews/autocomplete', async (req, res) => {
  try {
    const { prefix, limit = 10 } = req.query;
    
    if (!prefix || prefix.length < 2) {
      return res.status(400).json({ 
        success: false,
        message: 'Prefix must be at least 2 characters long' 
      });
    }
    
    // In production, consider caching the trie or using a more scalable solution
    const reviews = await Review.find({}, 'comment');
    const trie = new Trie();
    
    // Add all words from reviews to trie with popularity
    const wordPopularity = new Map();
    
    reviews.forEach(review => {
      const commentWords = review.comment.toLowerCase().match(/\b[\w']+\b/g) || [];
      
      commentWords.forEach(word => {
        if (word.length > 2) { // Only include words longer than 2 characters
          wordPopularity.set(word, (wordPopularity.get(word) || 0) + 1);
        }
      });
    });
    
    // Add words to trie with their popularity
    wordPopularity.forEach((popularity, word) => {
      trie.insert(word, popularity);
    });
    
    const suggestions = trie.search(prefix.toLowerCase()).slice(0, parseInt(limit));
    
    res.json({ 
      success: true,
      count: suggestions.length,
      data: suggestions 
    });
  } catch (error) {
    console.error('Error in autocomplete:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error in autocomplete',
      error: error.message 
    });
  }
});

// Sort journeys using QuickSort
router.post('/journeys/sort', (req, res) => {
  try {
    const { 
      journeys, 
      sortBy = 'departureTime', 
      order = 'asc',
      limit 
    } = req.body;
    
    if (!Array.isArray(journeys)) {
      return res.status(400).json({ 
        success: false,
        message: 'Journeys must be an array' 
      });
    }
    
    // Create a copy to avoid mutating the original array
    const journeysCopy = JSON.parse(JSON.stringify(journeys));
    
    // Define sort criteria based on input
    let sortCriteria = [];
    
    if (sortBy === 'departureTime') {
      sortCriteria.push({
        prop: 'departureTime',
        ascending: order === 'asc',
        type: 'date'
      });
    } else if (sortBy === 'arrivalTime') {
      sortCriteria.push({
        prop: 'arrivalTime',
        ascending: order === 'asc',
        type: 'date'
      });
    } else if (sortBy === 'duration') {
      sortCriteria.push({
        prop: 'duration',
        ascending: order === 'asc',
        type: 'number'
      });
    } else if (sortBy === 'price') {
      sortCriteria.push({
        prop: 'fare',
        ascending: order === 'asc',
        type: 'number'
      });
    } else if (Array.isArray(sortBy)) {
      // Handle multiple sort criteria
      sortCriteria = sortBy.map(criteria => ({
        prop: criteria.field,
        ascending: criteria.order === 'asc',
        type: criteria.type || 'string'
      }));
    }
    
    // Create compare function
    const compareFn = (a, b) => {
      for (const criteria of sortCriteria) {
        const { prop, ascending, type } = criteria;
        let comparison = 0;
        
        if (type === 'date') {
          const dateA = new Date(a[prop]);
          const dateB = new Date(b[prop]);
          comparison = dateA - dateB;
        } else if (type === 'number') {
          comparison = a[prop] - b[prop];
        } else {
          // String comparison
          const valA = String(a[prop] || '').toLowerCase();
          const valB = String(b[prop] || '').toLowerCase();
          comparison = valA.localeCompare(valB);
        }
        
        if (comparison !== 0) {
          return ascending ? comparison : -comparison;
        }
      }
      return 0;
    };
    
    // Sort the journeys
    const sortedJourneys = QuickSort.inPlaceSort(journeysCopy, compareFn);
    
    // Apply limit if specified
    const result = limit ? sortedJourneys.slice(0, parseInt(limit)) : sortedJourneys;
    
    res.json({ 
      success: true,
      count: result.length,
      data: result 
    });
  } catch (error) {
    console.error('Error sorting journeys:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error sorting journeys',
      error: error.message 
    });
  }
});

module.exports = router;
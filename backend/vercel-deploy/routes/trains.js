const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { protect, admin } = require('../middleware/auth');
const {
    getTrains,
    getTrain,
    createTrain,
    updateTrain,
    deleteTrain,
    searchTrains,
    getAvailableSeats
} = require('../controllers/trainController');

// Validation middleware
const validateTrain = [
    body('trainNumber', 'Train number is required').not().isEmpty(),
    body('name', 'Train name is required').not().isEmpty(),
    body('trainType', 'Train type is required').isIn(['Rajdhani', 'Shatabdi', 'Duronto', 'Express', 'Passenger', 'Other']),
    body('source', 'Source station ID is required').isMongoId(),
    body('destination', 'Destination station ID is required').isMongoId(),
    body('departureTime', 'Valid departure time is required').isISO8601(),
    body('arrivalTime', 'Valid arrival time is required').isISO8601(),
    body('totalSeats', 'Total seats must be a positive number').isInt({ min: 1 }),
    body('fare', 'Fare must be a positive number').isFloat({ min: 0 }),
    body('daysOfOperation', 'Days of operation are required').isArray({ min: 1 }),
    body('daysOfOperation.*', 'Invalid day of operation').isIn(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
];

// Public routes
router.get('/', getTrains);
router.get('/search', searchTrains);
router.get(
    '/:id',
    [param('id', 'Valid train ID is required').isMongoId()],
    getTrain
);
router.get(
    '/:id/seats',
    [
        param('id', 'Valid train ID is required').isMongoId(),
        query('date', 'Valid date is required').isISO8601()
    ],
    getAvailableSeats
);

// Protected routes (require authentication and admin role)
router.post('/', [protect, admin, ...validateTrain], createTrain);
router.put(
    '/:id',
    [
        protect,
        admin,
        param('id', 'Valid train ID is required').isMongoId(),
        ...validateTrain
    ],
    updateTrain
);
router.delete(
    '/:id',
    [protect, admin, param('id', 'Valid train ID is required').isMongoId()],
    deleteTrain
);

module.exports = router;

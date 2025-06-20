const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { protect, admin } = require('../middleware/auth');
const {
    createBooking,
    getUserBookings,
    getBookingByPNR,
    cancelBooking,
    getAllBookings
} = require('../controllers/bookingController');

// Validation middleware
const validateCreateBooking = [
    body('train', 'Train ID is required').isMongoId(),
    body('journeyDate', 'Journey date is required').isISO8601(),
    body('fromStation', 'Source station ID is required').isMongoId(),
    body('toStation', 'Destination station ID is required').isMongoId(),
    body('passengers', 'Passengers array is required').isArray({ min: 1 }),
    body('passengers.*.name', 'Passenger name is required').not().isEmpty(),
    body('passengers.*.age', 'Valid passenger age is required').isInt({ min: 1, max: 120 }),
    body('passengers.*.gender', 'Valid gender is required (M/F/O)').isIn(['M', 'F', 'O'])
];

// Protected routes (require authentication)
router.post('/', [protect, ...validateCreateBooking], createBooking);
router.get('/', [protect], getUserBookings);
router.get(
    '/pnr/:pnr',
    [protect, param('pnr', 'Valid PNR is required').isLength({ min: 6, max: 10 })],
    getBookingByPNR
);
router.put(
    '/:id/cancel',
    [protect, param('id', 'Valid booking ID is required').isMongoId()],
    cancelBooking
);

// Admin routes
router.get(
    '/all',
    [protect, admin],
    getAllBookings
);

module.exports = router;

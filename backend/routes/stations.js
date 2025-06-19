const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { protect, admin } = require('../middleware/auth');
const {
    getStations,
    getStation,
    createStation,
    updateStation,
    deleteStation,
    getNearbyStations
} = require('../controllers/stationController');

// Validation middleware
const validateStation = [
    body('code', 'Station code is required').not().isEmpty(),
    body('name', 'Station name is required').not().isEmpty(),
    body('city', 'City is required').not().isEmpty(),
    body('state', 'State is required').not().isEmpty(),
    body('latitude', 'Valid latitude is required').isFloat({ min: -90, max: 90 }),
    body('longitude', 'Valid longitude is required').isFloat({ min: -180, max: 180 })
];

// Public routes
router.get('/', getStations);
router.get('/nearby', getNearbyStations);
router.get(
    '/:id',
    [param('id', 'Valid station ID is required').isMongoId()],
    getStation
);

// Protected routes (require authentication and admin role)
router.post('/', [protect, admin, validateStation], createStation);
router.put(
    '/:id',
    [
        protect,
        admin,
        param('id', 'Valid station ID is required').isMongoId(),
        ...validateStation
    ],
    updateStation
);
router.delete(
    '/:id',
    [protect, admin, param('id', 'Valid station ID is required').isMongoId()],
    deleteStation
);

module.exports = router;

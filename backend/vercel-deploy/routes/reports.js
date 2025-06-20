const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const { admin } = require('../middleware/auth');
const {
    getBookingAnalytics,
    getRevenueAnalytics,
    getTrainPerformance,
    getStationPerformance,
    getSystemSummary
} = require('../controllers/reportController');

// Validation middleware
const validateDateRange = [
    query('startDate').optional().isISO8601().withMessage('Invalid start date format. Use YYYY-MM-DD'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date format. Use YYYY-MM-DD'),
    query('groupBy').optional().isIn(['day', 'week', 'month']).withMessage('Group by must be day, week, or month')
];

// Protected routes (admin only)
router.get('/bookings', [admin, ...validateDateRange], getBookingAnalytics);
router.get('/revenue', [admin, ...validateDateRange], getRevenueAnalytics);
router.get('/trains', admin, getTrainPerformance);
router.get('/stations', admin, getStationPerformance);
router.get('/summary', admin, getSystemSummary);

module.exports = router;

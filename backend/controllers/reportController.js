const Booking = require('../models/Booking');
const Train = require('../models/Train');
const Station = require('../models/Station');
const { validationResult } = require('express-validator');

// @desc    Get booking analytics
// @route   GET /api/reports/bookings
// @access  Private/Admin
exports.getBookingAnalytics = async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;
        
        // Set default date range if not provided
        const defaultEndDate = new Date();
        const defaultStartDate = new Date();
        defaultStartDate.setMonth(defaultEndDate.getMonth() - 1);
        
        const start = startDate ? new Date(startDate) : defaultStartDate;
        const end = endDate ? new Date(endDate) : defaultEndDate;
        
        // Validate date range
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Please use YYYY-MM-DD'
            });
        }
        
        // Group by day, week, or month
        let groupByFormat;
        switch (groupBy) {
            case 'week':
                groupByFormat = { week: { $week: '$createdAt' }, year: { $year: '$createdAt' } };
                break;
            case 'month':
                groupByFormat = { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } };
                break;
            default: // day
                groupByFormat = { 
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                };
        }
        
        // Aggregate bookings by status and date
        const bookingStats = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lte: end },
                    status: { $in: ['confirmed', 'cancelled', 'pending'] }
                }
            },
            {
                $group: {
                    _id: {
                        ...groupByFormat,
                        status: '$status'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 }
            }
        ]);
        
        // Format the response
        const result = {};
        bookingStats.forEach(stat => {
            const dateKey = groupBy === 'week' 
                ? `Week ${stat._id.week}, ${stat._id.year}`
                : groupBy === 'month'
                ? `${new Date(stat._id.year, stat._id.month - 1).toLocaleString('default', { month: 'short' })} ${stat._id.year}`
                : `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}-${String(stat._id.day).padStart(2, '0')}`;
                
            if (!result[dateKey]) {
                result[dateKey] = { date: dateKey, confirmed: 0, cancelled: 0, pending: 0 };
            }
            
            result[dateKey][stat._id.status] = stat.count;
        });
        
        res.json({
            success: true,
            data: Object.values(result)
        });
        
    } catch (error) {
        console.error('Error getting booking analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get revenue analytics
// @route   GET /api/reports/revenue
// @access  Private/Admin
exports.getRevenueAnalytics = async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'month' } = req.query;
        
        // Set default date range if not provided
        const defaultEndDate = new Date();
        const defaultStartDate = new Date();
        defaultStartDate.setFullYear(defaultEndDate.getFullYear() - 1);
        
        const start = startDate ? new Date(startDate) : defaultStartDate;
        const end = endDate ? new Date(endDate) : defaultEndDate;
        
        // Validate date range
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Please use YYYY-MM-DD'
            });
        }
        
        // Group by day, week, or month
        let groupByFormat, dateFormat;
        switch (groupBy) {
            case 'week':
                groupByFormat = { week: { $week: '$createdAt' }, year: { $year: '$createdAt' } };
                dateFormat = { $dateToString: { format: "%Y-W%U", date: '$createdAt' } };
                break;
            case 'day':
                groupByFormat = { 
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                };
                dateFormat = { $dateToString: { format: "%Y-%m-%d", date: '$createdAt' } };
                break;
            default: // month
                groupByFormat = { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } };
                dateFormat = { $dateToString: { format: "%Y-%m", date: '$createdAt' } };
        }
        
        // Aggregate revenue by date
        const revenueStats = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lte: end },
                    status: 'confirmed' // Only count confirmed bookings for revenue
                }
            },
            {
                $group: {
                    _id: groupByFormat,
                    date: { $first: dateFormat },
                    revenue: { $sum: '$totalAmount' },
                    bookingCount: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 }
            }
        ]);
        
        // Format the response
        const result = revenueStats.map(stat => ({
            date: stat.date,
            revenue: stat.revenue,
            bookingCount: stat.bookingCount,
            averageRevenue: stat.revenue / stat.bookingCount
        }));
        
        res.json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('Error getting revenue analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get train performance report
// @route   GET /api/reports/trains
// @access  Private/Admin
exports.getTrainPerformance = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        // Get top performing trains by revenue
        const trainPerformance = await Booking.aggregate([
            {
                $match: { status: 'confirmed' }
            },
            {
                $group: {
                    _id: '$train',
                    totalRevenue: { $sum: '$totalAmount' },
                    bookingCount: { $sum: 1 },
                    averageOccupancy: { $avg: { $size: '$passengers' } }
                }
            },
            {
                $lookup: {
                    from: 'trains',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'trainDetails'
                }
            },
            { $unwind: '$trainDetails' },
            {
                $project: {
                    _id: 1,
                    trainNumber: '$trainDetails.trainNumber',
                    trainName: '$trainDetails.name',
                    totalRevenue: 1,
                    bookingCount: 1,
                    averageOccupancy: { $round: ['$averageOccupancy', 2] },
                    averageRevenuePerBooking: { $divide: ['$totalRevenue', '$bookingCount'] }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: parseInt(limit) }
        ]);
        
        res.json({
            success: true,
            data: trainPerformance
        });
        
    } catch (error) {
        console.error('Error getting train performance:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get station performance report
// @route   GET /api/reports/stations
// @access  Private/Admin
exports.getStationPerformance = async (req, res) => {
    try {
        // Get station performance by number of departures and arrivals
        const stationPerformance = await Station.aggregate([
            {
                $lookup: {
                    from: 'trains',
                    localField: '_id',
                    foreignField: 'source',
                    as: 'departures'
                }
            },
            {
                $lookup: {
                    from: 'trains',
                    localField: '_id',
                    foreignField: 'destination',
                    as: 'arrivals'
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    code: 1,
                    city: 1,
                    state: 1,
                    departureCount: { $size: '$departures' },
                    arrivalCount: { $size: '$arrivals' },
                    totalTrains: { $add: [
                        { $size: '$departures' },
                        { $size: '$arrivals' }
                    ]}
                }
            },
            { $sort: { totalTrains: -1 } }
        ]);
        
        res.json({
            success: true,
            data: stationPerformance
        });
        
    } catch (error) {
        console.error('Error getting station performance:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get system summary
// @route   GET /api/reports/summary
// @access  Private/Admin
exports.getSystemSummary = async (req, res) => {
    try {
        // Get counts for various metrics
        const [
            totalTrains,
            totalStations,
            totalBookings,
            totalRevenue,
            recentBookings
        ] = await Promise.all([
            Train.countDocuments(),
            Station.countDocuments(),
            Booking.countDocuments({ status: 'confirmed' }),
            Booking.aggregate([
                { $match: { status: 'confirmed' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Booking.find({ status: 'confirmed' })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('train', 'trainNumber name')
                .populate('user', 'name email')
        ]);
        
        // Get revenue by month for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const monthlyRevenue = await Booking.aggregate([
            {
                $match: {
                    status: 'confirmed',
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$totalAmount' },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        
        // Format the response
        const summary = {
            totalTrains,
            totalStations,
            totalBookings,
            totalRevenue: totalRevenue[0]?.total || 0,
            recentBookings,
            monthlyRevenue: monthlyRevenue.map(month => ({
                year: month._id.year,
                month: month._id.month,
                label: new Date(month._id.year, month._id.month - 1).toLocaleString('default', { month: 'short' }),
                revenue: month.revenue,
                bookings: month.bookings
            }))
        };
        
        res.json({
            success: true,
            data: summary
        });
        
    } catch (error) {
        console.error('Error getting system summary:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

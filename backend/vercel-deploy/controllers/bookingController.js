const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Train = require('../models/Train');
const Station = require('../models/Station');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
    console.log('Received booking request:', JSON.stringify(req.body, null, 2));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            errors: errors.array() 
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    let booking;
    try {
        const { 
            train, 
            journeyDate, 
            fromStation, 
            toStation, 
            passengers,
            paymentMethod = 'credit_card'
        } = req.body;
        
        const trainDetails = await Train.findById(train).session(session);
        if (!trainDetails) {
            throw new Error('Train not found');
        }
        
        const [fromStationDetails, toStationDetails] = await Promise.all([
            Station.findById(fromStation).session(session),
            Station.findById(toStation).session(session)
        ]);
        
        if (!fromStationDetails || !toStationDetails) {
            throw new Error('Invalid source or destination station');
        }
        
        // Parse the journey date string in YYYY-MM-DD format (UTC)
        console.log('Journey date from request:', journeyDate);
        const [year, month, day] = journeyDate.split('-').map(Number);
        const journeyDateObj = new Date(Date.UTC(year, month - 1, day));
        
        // Set time to start of day in UTC
        journeyDateObj.setUTCHours(0, 0, 0, 0);
        
        // Create end of day in UTC
        const endOfDay = new Date(journeyDateObj);
        endOfDay.setUTCHours(23, 59, 59, 999);
        
        // Get day of week (0 = Sunday, 1 = Monday, etc.)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayIndex = journeyDateObj.getUTCDay();
        const dayName = days[dayIndex];
        
        console.log('Processed journey date:', {
          journeyDateObj,
          dayIndex,
          dayName,
          trainDays: trainDetails.daysOfOperation,
          trainId: trainDetails._id
        });
        
        // Check if train runs on this day
        if (!trainDetails.runsOnDay(dayName)) {
            console.error(`Train ${trainDetails.trainNumber} does not run on ${dayName}`);
            throw new Error(`Train does not run on ${dayName}`);
        }
        
        const bookedPassengersCountResult = await Booking.aggregate([
            { 
                $match: { 
                    train: trainDetails._id, 
                    journeyDate: { $gte: journeyDateObj, $lte: endOfDay },
                    bookingStatus: { $in: ['Confirmed', 'RAC'] } 
                } 
            },
            { $unwind: '$passengers' },
            { $count: 'totalPassengers' }
        ]).session(session);

        const totalBookedSeats = bookedPassengersCountResult.length > 0 ? bookedPassengersCountResult[0].totalPassengers : 0;
        const availableSeats = trainDetails.totalSeats - totalBookedSeats;

        if (passengers.length > availableSeats) {
            throw new Error(`Only ${availableSeats} seat(s) available`);
        }
        
        let totalFare = 0;
        if (trainDetails.route && trainDetails.route.length > 0) {
            const fromStop = trainDetails.route.find(s => s.station.toString() === fromStation);
            const toStop = trainDetails.route.find(s => s.station.toString() === toStation);
            
            if (fromStop && toStop) {
                const distance = Math.abs((toStop.distance || 0) - (fromStop.distance || 0));
                totalFare = Math.ceil((distance / 100) * trainDetails.fare) * passengers.length;
            } else {
                totalFare = trainDetails.fare * passengers.length;
            }
        } else {
            totalFare = trainDetails.fare * passengers.length;
        }
        
        const passengersWithSeats = [];
        for (let i = 0; i < passengers.length; i++) {
            const seatNumber = `A${totalBookedSeats + i + 1}`;
            const passenger = {
                name: passengers[i].name,
                age: passengers[i].age,
                gender: passengers[i].gender,
                seatNumber,
                coach: 'A'
            };
            passengersWithSeats.push(passenger);
        }
        
        console.log('Creating booking with data:', {
            trainId: trainDetails._id,
            journeyDate: journeyDateObj,
            from: fromStationDetails._id,
            to: toStationDetails._id,
            passengerCount: passengers.length,
            totalFare
        });
        
        
            booking = new Booking({
                pnr: await Booking.generateUniquePNR(session),
                user: req.user.id,
                train: trainDetails._id,
                journeyDate: journeyDateObj,
                fromStation: fromStationDetails._id,
                toStation: toStationDetails._id,
                passengers: passengers.map(p => ({
                    name: p.name,
                    age: p.age,
                    gender: p.gender,
                    berthPreference: p.berthPreference,
                    seatNumber: null, // Will be assigned later
                    status: 'Confirmed'
                })),
                totalFare: totalFare,
                bookingStatus: 'Confirmed',
                paymentStatus: 'Pending',
                paymentMethod: paymentMethod
            });

            console.log('Saving booking...');
            await booking.save({ session });
            console.log('Booking saved successfully');
        
        
        await User.findByIdAndUpdate(req.user.id, {
            $push: { bookings: booking._id }
        }, { session });
        
        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Booking error:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code,
            keyPattern: error.keyPattern,
            keyValue: error.keyValue
        });
        
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        const errorResponse = {
            success: false,
            message: 'Server error during booking creation.',
            ...(process.env.NODE_ENV === 'development' && {
                error: error.message,
                stack: error.stack,
                name: error.name
            })
        };
        
        res.status(500).json(errorResponse);
    } finally {
        session.endSession();
    }
};

// @desc    Get all bookings for a user
// @route   GET /api/bookings
// @access  Private
exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate({
                path: 'train',
                select: 'trainNumber name',
                populate: {
                    path: 'route.station',
                    select: 'name code'
                }
            })
            .populate('fromStation', 'name code')
            .populate('toStation', 'name code')
            .sort({ bookingTime: -1 });

        // Format the response
        const formattedBookings = bookings.map(booking => ({
            _id: booking._id,
            pnr: booking.pnr,
            train: {
                number: booking.train.trainNumber,
                name: booking.train.name
            },
            from: {
                name: booking.fromStation.name,
                code: booking.fromStation.code
            },
            to: {
                name: booking.toStation.name,
                code: booking.toStation.code
            },
            journeyDate: booking.journeyDate,
            bookingDate: booking.bookingTime,
            passengers: booking.passengers.map(p => ({
                name: p.name,
                age: p.age,
                gender: p.gender,
                seatNumber: p.seatNumber,
                coach: p.coach,
                status: p.status
            })),
            totalFare: booking.totalFare,
            bookingStatus: booking.bookingStatus,
            paymentStatus: booking.paymentStatus
        }));

        res.status(200).json({
            success: true,
            count: formattedBookings.length,
            data: formattedBookings
        });
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get booking by PNR
// @route   GET /api/bookings/pnr/:pnr
// @access  Private
exports.getBookingByPNR = async (req, res) => {
    try {
        const booking = await Booking.findOne({ 
            pnr: req.params.pnr,
            user: req.user.id // Ensure user can only access their own bookings
        })
        .populate('train', 'trainNumber name')
        .populate('fromStation', 'name code')
        .populate('toStation', 'name code');
        
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: 'Booking not found' 
            });
        }
        
        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Get booking by PNR error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.id,
            user: req.user.id // Ensure user can only cancel their own bookings
        });
        
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: 'Booking not found' 
            });
        }
        
        // Check if booking is already cancelled
        if (booking.bookingStatus === 'Cancelled') {
            return res.status(400).json({ 
                success: false, 
                message: 'Booking is already cancelled' 
            });
        }
        
        // Check if booking can be cancelled (e.g., not too close to departure)
        const now = new Date();
        const journeyDate = new Date(booking.journeyDate);
        const hoursDifference = (journeyDate - now) / (1000 * 60 * 60);
        
        if (hoursDifference < 4) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot cancel booking less than 4 hours before departure' 
            });
        }
        
        // Update booking status
        booking.bookingStatus = 'Cancelled';
        booking.paymentStatus = 'Refunded'; // Simplified refund logic
        
        await booking.save();
        
        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            data: booking
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Get all bookings (admin only)
// @route   GET /api/bookings/all
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status, 
            fromDate, 
            toDate,
            train
        } = req.query;
        
        let query = {};
        
        // Filter by status
        if (status) {
            query.bookingStatus = status;
        }
        
        // Filter by date range
        if (fromDate || toDate) {
            query.journeyDate = {};
            if (fromDate) query.journeyDate.$gte = new Date(fromDate);
            if (toDate) {
                const endOfDay = new Date(toDate);
                endOfDay.setHours(23, 59, 59, 999);
                query.journeyDate.$lte = endOfDay;
            }
        }
        
        // Filter by train
        if (train) {
            query.train = train;
        }
        
        const bookings = await Booking.find(query)
            .populate('user', 'username email')
            .populate('train', 'trainNumber name')
            .populate('fromStation', 'name code')
            .populate('toStation', 'name code')
            .sort({ bookingTime: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const count = await Booking.countDocuments(query);
        
        res.json({
            success: true,
            count: bookings.length,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            data: bookings
        });
    } catch (error) {
        console.error('Get all bookings error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

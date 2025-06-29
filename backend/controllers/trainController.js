const Train = require('../models/Train');
const Station = require('../models/Station');
const Booking = require('../models/Booking');
const { validationResult } = require('express-validator');

// @desc    Get all trains without pagination
// @route   GET /api/trains
// @access  Public
exports.getTrains = async (req, res) => {
    try {
        const { search, source, destination, date, trainType } = req.query;
        
        let query = {};
        
        // Add search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { trainNumber: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Filter by source and destination
        if (source) query.source = source;
        if (destination) query.destination = destination;
        if (trainType) query.trainType = trainType;
        
        // Filter by date (if provided)
        if (date) {
            const journeyDate = new Date(date);
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            query.daysOfOperation = days[journeyDate.getDay()];
        }
        
        // Fetch all matching trains
        const trains = await Train.find(query)
            .populate('source', 'name code city')
            .populate('destination', 'name code city')
            .sort({ name: 1 });
            
        res.json({
            success: true,
            count: trains.length,
            data: trains
        });
    } catch (error) {
        console.error('Get trains error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Get single train
// @route   GET /api/trains/:id
// @access  Public
exports.getTrain = async (req, res) => {
    try {
        const train = await Train.findById(req.params.id)
            .populate('source', 'name code city')
            .populate('destination', 'name code city')
            .populate('route.station', 'name code city');
        
        if (!train) {
            return res.status(404).json({ 
                success: false, 
                message: 'Train not found' 
            });
        }
        
        res.json({
            success: true,
            data: train
        });
    } catch (error) {
        console.error('Get train error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Create new train
// @route   POST /api/trains
// @access  Private/Admin
exports.createTrain = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }
        
        const { 
            trainNumber, 
            name, 
            trainType, 
            source, 
            destination, 
            departureTime, 
            arrivalTime,
            totalSeats,
            fare,
            route,
            daysOfOperation
        } = req.body;
        
        // Check if train with number already exists
        let train = await Train.findOne({ trainNumber });
        if (train) {
            return res.status(400).json({ 
                success: false, 
                message: 'Train with this number already exists' 
            });
        }
        
        // Check if source and destination stations exist
        const [sourceStation, destStation] = await Promise.all([
            Station.findById(source),
            Station.findById(destination)
        ]);
        
        if (!sourceStation || !destStation) {
            return res.status(400).json({ 
                success: false, 
                message: 'Source or destination station not found' 
            });
        }
        
        // Create train
        train = new Train({
            trainNumber,
            name,
            trainType,
            source,
            destination,
            departureTime: new Date(departureTime),
            arrivalTime: new Date(arrivalTime),
            totalSeats,
            availableSeats: totalSeats, // Initially available seats = total seats
            fare,
            route: route || [],
            daysOfOperation: daysOfOperation || []
        });
        
        await train.save();
        
        res.status(201).json({
            success: true,
            data: train
        });
    } catch (error) {
        console.error('Create train error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Update train
// @route   PUT /api/trains/:id
// @access  Private/Admin
exports.updateTrain = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }
        
        const { 
            trainNumber, 
            name, 
            trainType, 
            source, 
            destination, 
            departureTime, 
            arrivalTime,
            totalSeats,
            fare,
            route,
            daysOfOperation
        } = req.body;
        
        let train = await Train.findById(req.params.id);
        
        if (!train) {
            return res.status(404).json({ 
                success: false, 
                message: 'Train not found' 
            });
        }
        
        // Check if train number is being updated and if it's already taken
        if (trainNumber && trainNumber !== train.trainNumber) {
            const existingTrain = await Train.findOne({ trainNumber });
            if (existingTrain) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Train with this number already exists' 
                });
            }
            train.trainNumber = trainNumber;
        }
        
        // Update fields
        if (name) train.name = name;
        if (trainType) train.trainType = trainType;
        if (source) train.source = source;
        if (destination) train.destination = destination;
        if (departureTime) train.departureTime = new Date(departureTime);
        if (arrivalTime) train.arrivalTime = new Date(arrivalTime);
        if (totalSeats) {
            // Calculate the difference in seats and update available seats
            const seatDifference = totalSeats - train.totalSeats;
            train.totalSeats = totalSeats;
            train.availableSeats += seatDifference;
            
            // Ensure available seats don't go negative
            if (train.availableSeats < 0) train.availableSeats = 0;
        }
        if (fare) train.fare = fare;
        if (route) train.route = route;
        if (daysOfOperation) train.daysOfOperation = daysOfOperation;
        
        await train.save();
        
        res.json({
            success: true,
            data: train
        });
    } catch (error) {
        console.error('Update train error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Delete train
// @route   DELETE /api/trains/:id
// @access  Private/Admin
exports.deleteTrain = async (req, res) => {
    try {
        const train = await Train.findById(req.params.id);
        
        if (!train) {
            return res.status(404).json({ 
                success: false, 
                message: 'Train not found' 
            });
        }
        
        // Check if train has any bookings
        const bookingCount = await Booking.countDocuments({ train: train._id });
        
        if (bookingCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete train as it has associated bookings'
            });
        }
        
        await train.remove();
        
        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Delete train error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Search for trains between stations
// @route   GET /api/trains/search
// @access  Public
exports.searchTrains = async (req, res) => {
    try {
        const { 
            from, 
            to, 
            date, 
            sortBy = 'departureTime',
            sortOrder = 'asc',
            page = 1, 
            limit = 10 
        } = req.query;
        
        if (!from || !to) {
            return res.status(400).json({
                success: false,
                message: 'Source and destination stations are required'
            });
        }
        
        // Convert sort order to 1 (ascending) or -1 (descending)
        const sortDirection = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
        const sortOptions = {};
        sortOptions[sortBy] = sortDirection;
        
        // Find all trains that go from source to destination (direct or with stops)
        const trains = await Train.find({
            $or: [
                // Direct trains
                { 
                    source: from, 
                    destination: to 
                },
                // Trains with stops
                {
                    'route.station': { $all: [from, to] },
                    $expr: {
                        $let: {
                            vars: {
                                fromIndex: { $indexOfArray: ['$route.station', from] },
                                toIndex: { $indexOfArray: ['$route.station', to] }
                            },
                            in: { $lt: ['$$fromIndex', '$$toIndex'] }
                        }
                    }
                }
            ]
        })
        .populate('source', 'name code city')
        .populate('destination', 'name code city')
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit);
        
        // Get total count for pagination
        const count = await Train.countDocuments({
            $or: [
                { source: from, destination: to },
                {
                    'route.station': { $all: [from, to] },
                    $expr: {
                        $let: {
                            vars: {
                                fromIndex: { $indexOfArray: ['$route.station', from] },
                                toIndex: { $indexOfArray: ['$route.station', to] }
                            },
                            in: { $lt: ['$$fromIndex', '$$toIndex'] }
                        }
                    }
                }
            ]
        });
        
        // Process results to include additional information
        const processedTrains = await Promise.all(trains.map(async (train) => {
            const isDirect = train.source._id.toString() === from && 
                          train.destination._id.toString() === to;
            
            let departureTime = train.departureTime;
            let arrivalTime = train.arrivalTime;
            let fare = train.fare;
            
            // For trains with stops, calculate departure and arrival times
            if (!isDirect) {
                const fromStop = train.route.find(stop => 
                    stop.station.toString() === from
                );
                
                const toStop = train.route.find(stop => 
                    stop.station.toString() === to
                );
                
                if (fromStop && toStop) {
                    departureTime = fromStop.departureTime || departureTime;
                    arrivalTime = toStop.arrivalTime || arrivalTime;
                    
                    // Calculate fare based on distance (simplified)
                    if (fromStop.distance && toStop.distance) {
                        const distance = Math.abs(toStop.distance - fromStop.distance);
                        fare = Math.ceil((distance / 100) * train.fare); // Simplified fare calculation
                    }
                }
            }
            
            // Check seat availability for the given date
            const bookings = await Booking.countDocuments({
                train: train._id,
                journeyDate: date ? new Date(date) : { $gte: new Date() },
                bookingStatus: { $in: ['Confirmed', 'RAC'] }
            });
            
            const availableSeats = Math.max(0, train.totalSeats - bookings);
            
            return {
                ...train.toObject(),
                departureTime,
                arrivalTime,
                fare,
                availableSeats,
                isDirect
            };
        }));
        
        res.json({
            success: true,
            count: processedTrains.length,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            data: processedTrains
        });
    } catch (error) {
        console.error('Search trains error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Get available seats for a train on a specific date
// @route   GET /api/trains/:id/seats
// @access  Public
exports.getAvailableSeats = async (req, res) => {
    try {
        const { date } = req.query;
        
        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }
        
        const train = await Train.findById(req.params.id);
        
        if (!train) {
            return res.status(404).json({ 
                success: false, 
                message: 'Train not found' 
            });
        }
        
        // Get all bookings for this train on the given date
        const bookings = await Booking.find({
            train: train._id,
            journeyDate: new Date(date),
            bookingStatus: { $in: ['Confirmed', 'RAC'] }
        });
        
        // Get all booked seat numbers
        const bookedSeats = [];
        bookings.forEach(booking => {
            booking.passengers.forEach(passenger => {
                if (passenger.seatNumber) {
                    bookedSeats.push(passenger.seatNumber);
                }
            });
        });
        
        // Generate available seats (simplified)
        const totalSeats = train.totalSeats;
        const availableSeats = [];
        
        for (let i = 1; i <= totalSeats; i++) {
            const seatNumber = `A${i}`; // Simplified seat numbering
            if (!bookedSeats.includes(seatNumber)) {
                availableSeats.push({
                    seatNumber,
                    coach: 'A', // Simplified coach assignment
                    status: 'available'
                });
            } else {
                availableSeats.push({
                    seatNumber,
                    coach: 'A',
                    status: 'booked'
                });
            }
        }
        
        res.json({
            success: true,
            data: {
                train: train._id,
                trainNumber: train.trainNumber,
                trainName: train.name,
                journeyDate: date,
                totalSeats: train.totalSeats,
                availableSeats: availableSeats.filter(s => s.status === 'available').length,
                seats: availableSeats
            }
        });
    } catch (error) {
        console.error('Get available seats error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

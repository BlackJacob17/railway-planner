const Station = require('../models/Station');
const { validationResult } = require('express-validator');

// @desc    Get all stations
// @route   GET /api/stations
// @access  Public
exports.getStations = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        
        let query = {};
        
        // Add search functionality
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { code: { $regex: search, $options: 'i' } },
                    { city: { $regex: search, $options: 'i' } },
                    { state: { $regex: search, $options: 'i' } }
                ]
            };
        }
        
        // Execute query with pagination
        const stations = await Station.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ name: 1 });
            
        // Get total documents count
        const count = await Station.countDocuments(query);
        
        res.json({
            success: true,
            count: stations.length,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            data: stations
        });
    } catch (error) {
        console.error('Get stations error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Get single station
// @route   GET /api/stations/:id
// @access  Public
exports.getStation = async (req, res) => {
    try {
        const station = await Station.findById(req.params.id);
        
        if (!station) {
            return res.status(404).json({ 
                success: false, 
                message: 'Station not found' 
            });
        }
        
        res.json({
            success: true,
            data: station
        });
    } catch (error) {
        console.error('Get station error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Create new station
// @route   POST /api/stations
// @access  Private/Admin
exports.createStation = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }
        
        const { code, name, city, state, zone, latitude, longitude } = req.body;
        
        // Check if station with code already exists
        let station = await Station.findOne({ code });
        if (station) {
            return res.status(400).json({ 
                success: false, 
                message: 'Station with this code already exists' 
            });
        }
        
        // Create station
        station = new Station({
            code,
            name,
            city,
            state,
            zone,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude]
            },
            latitude,
            longitude
        });
        
        await station.save();
        
        res.status(201).json({
            success: true,
            data: station
        });
    } catch (error) {
        console.error('Create station error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Update station
// @route   PUT /api/stations/:id
// @access  Private/Admin
exports.updateStation = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }
        
        const { code, name, city, state, zone, latitude, longitude } = req.body;
        
        let station = await Station.findById(req.params.id);
        
        if (!station) {
            return res.status(404).json({ 
                success: false, 
                message: 'Station not found' 
            });
        }
        
        // Check if code is being updated and if it's already taken
        if (code && code !== station.code) {
            const existingStation = await Station.findOne({ code });
            if (existingStation) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Station with this code already exists' 
                });
            }
            station.code = code;
        }
        
        // Update fields
        if (name) station.name = name;
        if (city) station.city = city;
        if (state) station.state = state;
        if (zone) station.zone = zone;
        
        if (latitude && longitude) {
            station.latitude = latitude;
            station.longitude = longitude;
            station.location = {
                type: 'Point',
                coordinates: [longitude, latitude]
            };
        }
        
        await station.save();
        
        res.json({
            success: true,
            data: station
        });
    } catch (error) {
        console.error('Update station error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Delete station
// @route   DELETE /api/stations/:id
// @access  Private/Admin
exports.deleteStation = async (req, res) => {
    try {
        const station = await Station.findById(req.params.id);
        
        if (!station) {
            return res.status(404).json({ 
                success: false, 
                message: 'Station not found' 
            });
        }
        
        // Check if station is used in any routes
        // const usedInRoutes = await Train.countDocuments({
        //     $or: [
        //         { 'route.station': station._id },
        //         { source: station._id },
        //         { destination: station._id }
        //     ]
        // });
        
        // if (usedInRoutes > 0) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Cannot delete station as it is used in one or more routes'
        //     });
        // }
        
        await station.remove();
        
        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Delete station error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Find nearby stations
// @route   GET /api/stations/nearby
// @access  Public
exports.getNearbyStations = async (req, res) => {
    try {
        const { latitude, longitude, maxDistance = 10000 } = req.query; // maxDistance in meters
        
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }
        
        const stations = await Station.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [
                            parseFloat(longitude),
                            parseFloat(latitude)
                        ]
                    },
                    $maxDistance: parseInt(maxDistance)
                }
            }
        });
        
        res.json({
            success: true,
            count: stations.length,
            data: stations
        });
    } catch (error) {
        console.error('Get nearby stations error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

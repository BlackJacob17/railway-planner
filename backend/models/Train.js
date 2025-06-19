const mongoose = require('mongoose');

const trainSchema = new mongoose.Schema({
    trainNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    trainType: {
        type: String,
        enum: ['Rajdhani', 'Shatabdi', 'Duronto', 'Express', 'Passenger', 'Other'],
        required: true
    },
    source: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station',
        required: true
    },
    destination: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station',
        required: true
    },
    departureTime: {
        type: Date,
        required: true
    },
    arrivalTime: {
        type: Date,
        required: true
    },
    totalSeats: {
        type: Number,
        required: true,
        min: 1
    },
    availableSeats: {
        type: Number,
        required: true,
        min: 0
    },
    fare: {
        type: Number,
        required: true,
        min: 0
    },
    route: [{
        station: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Station',
            required: true
        },
        arrivalTime: Date,
        departureTime: Date,
        distance: Number,
        day: {
            type: Number,
            min: 0,
            default: 0
        }
    }],
    daysOfOperation: [{
        type: String,
        enum: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        required: true
    }],
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Cancelled'],
        default: 'Active'
    }
}, {
    timestamps: true
});

// Indexes for faster search
trainSchema.index({ trainNumber: 1 });
trainSchema.index({ source: 1, destination: 1 });
trainSchema.index({ 'route.station': 1 });

// Method to check if train runs on a particular day
trainSchema.methods.runsOnDay = function(day) {
    return this.daysOfOperation.includes(day);
};

// Method to get next available running day
trainSchema.methods.getNextRunningDay = function(fromDate = new Date()) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDay = fromDate.getDay();
    
    for (let i = 0; i < 7; i++) {
        const checkDay = (currentDay + i) % 7;
        const dayName = days[checkDay];
        
        if (this.daysOfOperation.includes(dayName)) {
            const resultDate = new Date(fromDate);
            resultDate.setDate(fromDate.getDate() + (i === 0 ? 0 : i));
            return {
                day: dayName,
                date: resultDate
            };
        }
    }
    
    return null;
};

module.exports = mongoose.model('Train', trainSchema);

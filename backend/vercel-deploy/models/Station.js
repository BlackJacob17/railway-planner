const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    zone: {
        type: String,
        trim: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

// Index for faster search by code and name
stationSchema.index({ code: 1 });
stationSchema.index({ name: 'text', city: 'text', state: 'text' });

// Static method to find nearby stations
stationSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10000) {
    return this.find({
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                },
                $maxDistance: maxDistance // in meters
            }
        }
    });
};

// Add 2dsphere index for geospatial queries
stationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Station', stationSchema);

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    pnr: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    train: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Train',
        required: true
    },
    journeyDate: {
        type: Date,
        required: true
    },
    passengers: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        age: {
            type: Number,
            required: true,
            min: 1,
            max: 120
        },
        gender: {
            type: String,
            enum: ['M', 'F', 'O'],
            required: true
        },
        seatNumber: String,
        coach: String
    }],
    fromStation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station',
        required: true
    },
    toStation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station',
        required: true
    },
    totalFare: {
        type: Number,
        required: true,
        min: 0
    },
    bookingStatus: {
        type: String,
        enum: ['Confirmed', 'Cancelled', 'Waiting', 'RAC'],
        default: 'Confirmed'
    },
    bookingTime: {
        type: Date,
        default: Date.now
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
        default: 'Pending'
    },
    paymentId: String,
    paymentMethod: String
}, {
    timestamps: true
});

// Indexes for faster search
bookingSchema.index({ pnr: 1 }, { unique: true });
bookingSchema.index({ user: 1 });
bookingSchema.index({ train: 1, journeyDate: 1 });

// IMPORTANT: The following index was removed because it was causing duplicate key errors
// when seatNumber and coach were null. If you need to add it back in the future,
// make sure to handle null values properly or use a partial index.
// bookingSchema.index({ 
//     train: 1, 
//     journeyDate: 1, 
//     'passengers.seatNumber': 1, 
//     'passengers.coach': 1 
// }, { unique: true, sparse: true });

// If you need to query by seat number and coach, use this non-unique index instead
// bookingSchema.index({ 
//     train: 1, 
//     journeyDate: 1, 
//     'passengers.seatNumber': 1, 
//     'passengers.coach': 1 
// });

// Static method to generate a unique PNR
bookingSchema.statics.generateUniquePNR = async function(session) {
    let pnr;
    let isUnique = false;
    while (!isUnique) {
        // Generate a random 8-character alphanumeric string
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        pnr = '';
        for (let i = 0; i < 8; i++) {
            pnr += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Check if the PNR already exists
        const existingBooking = await this.findOne({ pnr }).session(session);
        if (!existingBooking) {
            isUnique = true;
        }
    }
    return pnr;
};

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
    const now = new Date();
    const journeyDate = new Date(this.journeyDate);
    const hoursDifference = (journeyDate - now) / (1000 * 60 * 60);
    
    return hoursDifference > 4; // Can cancel up to 4 hours before departure
};

module.exports = mongoose.model('Booking', bookingSchema);

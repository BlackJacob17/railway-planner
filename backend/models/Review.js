const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    journeyDate: {
        type: Date,
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    keywords: [{
        type: String,
        trim: true,
        lowercase: true
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for faster search
reviewSchema.index({ train: 1, user: 1 }, { unique: true });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ keywords: 1 });

// Virtual for like count
reviewSchema.virtual('likeCount').get(function() {
    return this.likes.length;
});

// Virtual for dislike count
reviewSchema.virtual('dislikeCount').get(function() {
    return this.dislikes.length;
});

// Pre-save hook to extract keywords from title and comment
reviewSchema.pre('save', function(next) {
    if (this.isModified('title') || this.isModified('comment')) {
        const text = `${this.title} ${this.comment}`.toLowerCase();
        // Simple keyword extraction (can be enhanced with NLP)
        const words = text
            .replace(/[^\w\s]/g, '') // Remove punctuation
            .split(/\s+/)
            .filter(word => word.length > 3); // Only consider words longer than 3 characters
            
        // Get unique words and limit to 10 keywords
        this.keywords = [...new Set(words)].slice(0, 10);
    }
    next();
});

// Static method to search reviews using KMP algorithm
reviewSchema.statics.searchByKeyword = async function(keyword) {
    const reviews = await this.find({});
    const pattern = keyword.toLowerCase();
    const n = pattern.length;
    
    // KMP algorithm to find pattern in text
    const computeLPSArray = (pattern) => {
        const lps = new Array(n).fill(0);
        let len = 0;
        let i = 1;
        
        while (i < n) {
            if (pattern[i] === pattern[len]) {
                len++;
                lps[i] = len;
                i++;
            } else {
                if (len !== 0) {
                    len = lps[len - 1];
                } else {
                    lps[i] = 0;
                    i++;
                }
            }
        }
        return lps;
    };
    
    const searchKMP = (text) => {
        const m = text.length;
        let i = 0; // index for text
        let j = 0; // index for pattern
        const lps = computeLPSArray(pattern);
        
        while (i < m) {
            if (pattern[j] === text[i]) {
                i++;
                j++;
                
                if (j === n) {
                    return true; // Pattern found
                }
            } else {
                if (j !== 0) {
                    j = lps[j - 1];
                } else {
                    i++;
                }
            }
        }
        return false; // Pattern not found
    };
    
    // Filter reviews where pattern is found in title or comment
    return reviews.filter(review => 
        searchKMP(review.title.toLowerCase()) || 
        searchKMP(review.comment.toLowerCase())
    );
};

module.exports = mongoose.model('Review', reviewSchema);

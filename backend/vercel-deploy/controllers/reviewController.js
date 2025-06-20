const Review = require('../models/Review');
const Train = require('../models/Train');
const { validationResult } = require('express-validator');

// @desc    Get all reviews for a train
// @route   GET /api/reviews/train/:trainId
// @access  Public
exports.getTrainReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
        
        const reviews = await Review.find({ train: req.params.trainId })
            .populate('user', 'username')
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const count = await Review.countDocuments({ train: req.params.trainId });
        
        // Calculate average rating
        const avgRating = await Review.aggregate([
            { $match: { train: mongoose.Types.ObjectId(req.params.trainId) } },
            { $group: { _id: null, averageRating: { $avg: '$rating' } } }
        ]);
        
        res.json({
            success: true,
            count: reviews.length,
            total: count,
            averageRating: avgRating.length > 0 ? Math.round(avgRating[0].averageRating * 10) / 10 : 0,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            data: reviews
        });
    } catch (error) {
        console.error('Get train reviews error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }
        
        const { train, rating, title, comment, journeyDate } = req.body;
        
        // Check if train exists
        const trainExists = await Train.findById(train);
        if (!trainExists) {
            return res.status(404).json({ 
                success: false, 
                message: 'Train not found' 
            });
        }
        
        // Check if user has already reviewed this train
        const existingReview = await Review.findOne({
            user: req.user.id,
            train: train
        });
        
        if (existingReview) {
            return res.status(400).json({ 
                success: false, 
                message: 'You have already reviewed this train' 
            });
        }
        
        // Create review
        const review = new Review({
            user: req.user.id,
            train,
            rating,
            title,
            comment,
            journeyDate: new Date(journeyDate)
        });
        
        await review.save();
        
        // Populate user details
        await review.populate('user', 'username').execPopulate();
        
        res.status(201).json({
            success: true,
            data: review
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }
        
        const { rating, title, comment } = req.body;
        
        const review = await Review.findById(req.params.id);
        
        if (!review) {
            return res.status(404).json({ 
                success: false, 
                message: 'Review not found' 
            });
        }
        
        // Check if user is the owner of the review
        if (review.user.toString() !== req.user.id) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authorized to update this review' 
            });
        }
        
        // Update fields
        if (rating) review.rating = rating;
        if (title) review.title = title;
        if (comment) review.comment = comment;
        
        await review.save();
        
        // Populate user details
        await review.populate('user', 'username').execPopulate();
        
        res.json({
            success: true,
            data: review
        });
    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        
        if (!review) {
            return res.status(404).json({ 
                success: false, 
                message: 'Review not found' 
            });
        }
        
        // Check if user is the owner of the review or an admin
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authorized to delete this review' 
            });
        }
        
        await review.remove();
        
        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Like or unlike a review
// @route   PUT /api/reviews/:id/like
// @access  Private
exports.toggleLikeReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        
        if (!review) {
            return res.status(404).json({ 
                success: false, 
                message: 'Review not found' 
            });
        }
        
        const userId = req.user.id;
        const likeIndex = review.likes.indexOf(userId);
        const dislikeIndex = review.dislikes.indexOf(userId);
        
        // If already liked, remove like
        if (likeIndex !== -1) {
            review.likes.splice(likeIndex, 1);
        } else {
            // Add like and remove dislike if exists
            review.likes.push(userId);
            if (dislikeIndex !== -1) {
                review.dislikes.splice(dislikeIndex, 1);
            }
        }
        
        await review.save();
        
        res.json({
            success: true,
            data: {
                likes: review.likes.length,
                dislikes: review.dislikes.length,
                userLiked: review.likes.includes(userId),
                userDisliked: review.dislikes.includes(userId)
            }
        });
    } catch (error) {
        console.error('Like review error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Dislike or undislike a review
// @route   PUT /api/reviews/:id/dislike
// @access  Private
exports.toggleDislikeReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        
        if (!review) {
            return res.status(404).json({ 
                success: false, 
                message: 'Review not found' 
            });
        }
        
        const userId = req.user.id;
        const likeIndex = review.likes.indexOf(userId);
        const dislikeIndex = review.dislikes.indexOf(userId);
        
        // If already disliked, remove dislike
        if (dislikeIndex !== -1) {
            review.dislikes.splice(dislikeIndex, 1);
        } else {
            // Add dislike and remove like if exists
            review.dislikes.push(userId);
            if (likeIndex !== -1) {
                review.likes.splice(likeIndex, 1);
            }
        }
        
        await review.save();
        
        res.json({
            success: true,
            data: {
                likes: review.likes.length,
                dislikes: review.dislikes.length,
                userLiked: review.likes.includes(userId),
                userDisliked: review.dislikes.includes(userId)
            }
        });
    } catch (error) {
        console.error('Dislike review error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// @desc    Search reviews by keyword using KMP algorithm
// @route   GET /api/reviews/search
// @access  Public
exports.searchReviews = async (req, res) => {
    try {
        const { keyword, page = 1, limit = 10 } = req.query;
        
        if (!keyword || keyword.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Search keyword is required'
            });
        }
        
        // Use the KMP search method defined in the Review model
        const reviews = await Review.searchByKeyword(keyword);
        
        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedReviews = reviews.slice(startIndex, endIndex);
        
        // Populate user and train details
        await Review.populate(paginatedReviews, [
            { path: 'user', select: 'username' },
            { path: 'train', select: 'trainNumber name' }
        ]);
        
        res.json({
            success: true,
            count: paginatedReviews.length,
            total: reviews.length,
            totalPages: Math.ceil(reviews.length / limit),
            currentPage: Number(page),
            data: paginatedReviews
        });
    } catch (error) {
        console.error('Search reviews error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

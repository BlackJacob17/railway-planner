const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
    getTrainReviews,
    createReview,
    updateReview,
    deleteReview,
    toggleLikeReview,
    toggleDislikeReview,
    searchReviews
} = require('../controllers/reviewController');

// Validation middleware
const validateReview = [
    body('train', 'Train ID is required').isMongoId(),
    body('rating', 'Rating is required').isInt({ min: 1, max: 5 }),
    body('title', 'Title is required').not().isEmpty().isLength({ max: 100 }),
    body('comment', 'Comment is required').not().isEmpty().isLength({ max: 2000 }),
    body('journeyDate', 'Journey date is required').isISO8601()
];

// Public routes
router.get(
    '/train/:trainId',
    [param('trainId', 'Valid train ID is required').isMongoId()],
    getTrainReviews
);

router.get(
    '/search',
    [query('keyword', 'Search keyword is required').not().isEmpty()],
    searchReviews
);

// Protected routes (require authentication)
router.post('/', [protect, ...validateReview], createReview);

router.put(
    '/:id',
    [
        protect,
        param('id', 'Valid review ID is required').isMongoId(),
        body('rating', 'Rating is required').optional().isInt({ min: 1, max: 5 }),
        body('title', 'Title cannot be empty').optional().not().isEmpty().isLength({ max: 100 }),
        body('comment', 'Comment cannot be empty').optional().not().isEmpty().isLength({ max: 2000 })
    ],
    updateReview
);

router.delete(
    '/:id',
    [protect, param('id', 'Valid review ID is required').isMongoId()],
    deleteReview
);

router.put(
    '/:id/like',
    [protect, param('id', 'Valid review ID is required').isMongoId()],
    toggleLikeReview
);

router.put(
    '/:id/dislike',
    [protect, param('id', 'Valid review ID is required').isMongoId()],
    toggleDislikeReview
);

module.exports = router;

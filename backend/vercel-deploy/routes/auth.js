const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { 
    register, 
    login, 
    getMe 
} = require('../controllers/authController');

// Validation middleware
const validateRegister = [
    body('username', 'Username is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
];

const validateLogin = [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists()
];

// Routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);

module.exports = router;

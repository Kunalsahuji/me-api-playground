const express = require('express');
const { body } = require('express-validator');
const { isAuthenticated } = require('../middleware/auth');
const { 
    homepage,
    register, 
    login, 
    currentProfile,
    logout 
} = require('../controllers/authController');
const router = express.Router();

// Public routes
router.get('/', homepage);
router.post('/register', 
    [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], register);
router.post('/login', [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required')
], login);

// Protected routes
router.get('/me', isAuthenticated, currentProfile);
router.post('/logout', isAuthenticated, logout);

module.exports = router;
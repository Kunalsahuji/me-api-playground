const express = require('express');
const { body } = require('express-validator');
const { isAuthenticated } = require('../middleware/auth');
const {
    getProfiles,
    getProfileById,
    getCurrentProfile,
    updateProfile,
    deleteProfile,
    updateSkills,
    addEducation,
    addWork,
    updateLinks
} = require('../controllers/profileController');
const router = express.Router();

// Public routes
router.get('/', getProfiles); // GET /api/profiles?search=john&skills=javascript,react&page=1&limit=10
router.get('/:id', getProfileById); // GET /api/profiles/64f1234567890abcdef12345

// Protected routes - require authentication
router.get('/me/profile', isAuthenticated, getCurrentProfile); // GET /api/profiles/me/profile
router.put('/me', isAuthenticated, [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('skills').optional().isArray().withMessage('Skills must be an array'),
    body('education').optional().isArray().withMessage('Education must be an array'),
    body('work').optional().isArray().withMessage('Work must be an array')
], updateProfile);

router.delete('/me', isAuthenticated, deleteProfile);

router.patch('/me/skills', isAuthenticated, [
    body('skills').isArray({ min: 1 }).withMessage('Skills must be a non-empty array')
], updateSkills);

router.post('/me/education', isAuthenticated, [
    body('degree').notEmpty().withMessage('Degree is required'),
    body('institution').notEmpty().withMessage('Institution is required'),
    body('startYear').isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Valid start year required'),
    body('endYear').optional().isInt({ min: 1900 }).withMessage('Valid end year required')
], addEducation);

router.post('/me/work', isAuthenticated, [
    body('company').notEmpty().withMessage('Company is required'),
    body('role').notEmpty().withMessage('Role is required'),
    body('startDate').notEmpty().withMessage('Start date is required'),
    body('location').optional().notEmpty().withMessage('Location cannot be empty if provided')
], addWork);

router.patch('/me/links', isAuthenticated, [
    body('github').optional().isURL().withMessage('Valid GitHub URL required'),
    body('linkedin').optional().isURL().withMessage('Valid LinkedIn URL required'),
    body('portfolio').optional().isURL().withMessage('Valid portfolio URL required'),
    body('resume').optional().isURL().withMessage('Valid resume URL required')
], updateLinks);

module.exports = router;

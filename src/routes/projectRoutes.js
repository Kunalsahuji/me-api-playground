const express = require('express');
const { body } = require('express-validator');
const { isAuthenticated } = require('../middleware/auth');
const {
    getProjects,
    getProject,
    getMyProjects,
    createProject,
    updateProject,
    deleteProject,
    updateProjectSkills,
    updateProjectLinks,
    searchProjects
} = require('../controllers/projectController');
const router = express.Router();

// Public routes
router.get('/', getProjects); // GET /api/projects?search=ecommerce&skills=react,nodejs&owner=userId&page=1&limit=10
router.get('/search', searchProjects); // GET /api/projects/search?skills=react,nodejs&minSkills=2&sortBy=createdAt&order=desc
router.get('/:id', getProject); // GET /api/projects/64f9876543210fedcba98765

// Protected routes - require authentication
router.get('/user/my', isAuthenticated, getMyProjects); // GET /api/projects/user/my?page=1&limit=10

router.post('/', isAuthenticated, [
    body('title').notEmpty().withMessage('Project title is required'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('skills').optional().isArray().withMessage('Skills must be an array'),
    body('links.github').optional().isURL().withMessage('Valid GitHub URL required'),
    body('links.live').optional().isURL().withMessage('Valid live URL required'),
    body('links.demo').optional().isURL().withMessage('Valid demo URL required')
], createProject);

router.put('/:id', isAuthenticated, [
    body('title').optional().notEmpty().withMessage('Project title cannot be empty'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('skills').optional().isArray().withMessage('Skills must be an array')
], updateProject);

router.delete('/:id', isAuthenticated, deleteProject);

router.patch('/:id/skills', isAuthenticated, [
    body('skills').isArray({ min: 1 }).withMessage('Skills must be a non-empty array')
], updateProjectSkills);

router.patch('/:id/links', isAuthenticated, [
    body('github').optional().isURL().withMessage('Valid GitHub URL required'),
    body('live').optional().isURL().withMessage('Valid live URL required'),
    body('demo').optional().isURL().withMessage('Valid demo URL required')
], updateProjectLinks);

module.exports = router;
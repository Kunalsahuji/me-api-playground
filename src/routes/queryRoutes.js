const express = require('express');
const router = express.Router()
const controller = require('../controllers/projectController');
const { requireAuth } = require('../middleware/auth');

router.get('/', controller.listProjects)
router.get('/top-skills', controller.topSkills)
router.get('/search', controller.searchProjects)

module.exports = router
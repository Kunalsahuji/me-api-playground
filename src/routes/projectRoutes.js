const express = require('express');
const router = express.Router()
const controller = require('../controllers/projectController');
const { requireAuth } = require('../middleware/auth');

router.get('/', controller.listProjects)
router.get('/:id', controller.getProject)
router.post('/', requireAuth, controller.createProject)
router.put('/:id', requireAuth, controller.updateProject)
router.delete('/:id', requireAuth, controller.deleteProject)

module.exports = router
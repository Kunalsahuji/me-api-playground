const express = require('express');
const router = express.Router()
const { body } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const controller = require('../controllers/profileController')

router.get('/', controller.getProfile)
router.post('/',
    requireAuth,
    [body('name').notEmpty().withMessage('name is required'), body('email').isEmail().withMessage('valid email required')],
    controller.createProfile
)
router.put('/', requireAuth, controller.updateProfile)

module.exports = router
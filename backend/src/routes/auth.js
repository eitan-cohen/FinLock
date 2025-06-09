
const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const { validate, schemas } = require('../middlewares/validate');
const { authenticateToken } = require('../middlewares/auth');
const { authRateLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Public routes
router.post('/register', authRateLimiter, validate(schemas.register), register);
router.post('/login', authRateLimiter, validate(schemas.login), login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

module.exports = router;

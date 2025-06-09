
const express = require('express');
const { handleLithicWebhook } = require('../controllers/webhookController');

const router = express.Router();

// Webhook endpoints (no authentication required)
router.post('/lithic', handleLithicWebhook);

module.exports = router;

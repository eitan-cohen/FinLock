
const express = require('express');
const {
  getCardStatus,
  authorizeTransaction,
  freezeCard,
  getCardDetails
} = require('../controllers/cardController');
const { validate, schemas } = require('../middlewares/validate');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

// All card routes require authentication
router.use(authenticateToken);

router.get('/status', getCardStatus);
router.get('/details', getCardDetails);
router.post('/authorize', validate(schemas.authorizeTransaction), authorizeTransaction);
router.post('/freeze', freezeCard);

module.exports = router;

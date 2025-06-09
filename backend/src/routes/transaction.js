
const express = require('express');
const {
  getTransactions,
  getTransactionDetails,
  getSpendingAnalytics
} = require('../controllers/transactionController');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

// All transaction routes require authentication
router.use(authenticateToken);

router.get('/', getTransactions);
router.get('/analytics', getSpendingAnalytics);
router.get('/:transactionId', getTransactionDetails);

module.exports = router;

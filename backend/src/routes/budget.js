
const express = require('express');
const {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  getBudgetAnalytics
} = require('../controllers/budgetController');
const { validate, schemas } = require('../middlewares/validate');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

// All budget routes require authentication
router.use(authenticateToken);

router.post('/', validate(schemas.createBudget), createBudget);
router.get('/', getBudgets);
router.get('/analytics', getBudgetAnalytics);
router.put('/:budgetId', updateBudget);
router.delete('/:budgetId', deleteBudget);

module.exports = router;


const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const createBudget = async (userId, budgetData) => {
  const { category, limit, period } = budgetData;
  const budgetId = uuidv4();
  
  const result = await query(
    `INSERT INTO budgets (id, user_id, category, limit_amount, spent_amount, period, created_at)
     VALUES ($1, $2, $3, $4, 0, $5, NOW())
     RETURNING *`,
    [budgetId, userId, category, limit, period]
  );
  
  return result.rows[0];
};

const getBudgetsByUserId = async (userId) => {
  const result = await query(
    'SELECT * FROM budgets WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  
  return result.rows;
};

const getBudgetByCategory = async (userId, category) => {
  const result = await query(
    'SELECT * FROM budgets WHERE user_id = $1 AND category = $2',
    [userId, category]
  );
  
  return result.rows[0];
};

const updateBudgetSpent = async (budgetId, amount) => {
  const result = await query(
    'UPDATE budgets SET spent_amount = spent_amount + $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [amount, budgetId]
  );
  
  return result.rows[0];
};

const resetBudgetSpent = async (budgetId) => {
  const result = await query(
    'UPDATE budgets SET spent_amount = 0, updated_at = NOW() WHERE id = $1 RETURNING *',
    [budgetId]
  );
  
  return result.rows[0];
};

const deleteBudget = async (budgetId, userId) => {
  const result = await query(
    'DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING *',
    [budgetId, userId]
  );
  
  return result.rows[0];
};

module.exports = {
  createBudget,
  getBudgetsByUserId,
  getBudgetByCategory,
  updateBudgetSpent,
  resetBudgetSpent,
  deleteBudget
};

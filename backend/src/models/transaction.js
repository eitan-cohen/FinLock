
const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const createTransaction = async (transactionData) => {
  const {
    userId,
    cardId,
    lithicTransactionId,
    amount,
    category,
    merchantName,
    merchantMcc,
    status,
    authorizationSessionId
  } = transactionData;
  
  const transactionId = uuidv4();
  
  const result = await query(
    `INSERT INTO transactions (
      id, user_id, card_id, lithic_transaction_id, amount, category, 
      merchant_name, merchant_mcc, status, authorization_session_id, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
    RETURNING *`,
    [
      transactionId, userId, cardId, lithicTransactionId, amount, category,
      merchantName, merchantMcc, status, authorizationSessionId
    ]
  );
  
  return result.rows[0];
};

const getTransactionsByUserId = async (userId, limit = 50, offset = 0) => {
  const result = await query(
    `SELECT * FROM transactions 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  
  return result.rows;
};

const getTransactionById = async (transactionId) => {
  const result = await query(
    'SELECT * FROM transactions WHERE id = $1',
    [transactionId]
  );
  
  return result.rows[0];
};

const getTransactionByLithicId = async (lithicTransactionId) => {
  const result = await query(
    'SELECT * FROM transactions WHERE lithic_transaction_id = $1',
    [lithicTransactionId]
  );
  
  return result.rows[0];
};

const updateTransactionStatus = async (transactionId, status) => {
  const result = await query(
    'UPDATE transactions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, transactionId]
  );
  
  return result.rows[0];
};

const getTransactionsByCategory = async (userId, category, startDate, endDate) => {
  const result = await query(
    `SELECT * FROM transactions 
     WHERE user_id = $1 AND category = $2 
     AND created_at BETWEEN $3 AND $4
     ORDER BY created_at DESC`,
    [userId, category, startDate, endDate]
  );
  
  return result.rows;
};

const getSpendingAnalytics = async (userId, period = '30 days') => {
  const result = await query(
    `SELECT 
      category,
      COUNT(*) as transaction_count,
      SUM(amount) as total_amount,
      AVG(amount) as avg_amount
     FROM transactions 
     WHERE user_id = $1 
     AND created_at >= NOW() - INTERVAL '${period}'
     AND status = 'completed'
     GROUP BY category
     ORDER BY total_amount DESC`,
    [userId]
  );
  
  return result.rows;
};

module.exports = {
  createTransaction,
  getTransactionsByUserId,
  getTransactionById,
  getTransactionByLithicId,
  updateTransactionStatus,
  getTransactionsByCategory,
  getSpendingAnalytics
};

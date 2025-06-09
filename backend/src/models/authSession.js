
const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const createAuthSession = async (sessionData) => {
  const {
    userId,
    cardId,
    amountLimit,
    categoryMcc,
    merchantName,
    expiresAt
  } = sessionData;
  
  const sessionId = uuidv4();
  
  const result = await query(
    `INSERT INTO authorization_sessions (
      id, user_id, card_id, amount_limit, category_mcc, 
      merchant_name, expires_at, status, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', NOW())
    RETURNING *`,
    [sessionId, userId, cardId, amountLimit, categoryMcc, merchantName, expiresAt]
  );
  
  return result.rows[0];
};

const getActiveSessionByUserId = async (userId) => {
  const result = await query(
    `SELECT * FROM authorization_sessions 
     WHERE user_id = $1 AND status = 'active' AND expires_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );
  
  return result.rows[0];
};

const getSessionById = async (sessionId) => {
  const result = await query(
    'SELECT * FROM authorization_sessions WHERE id = $1',
    [sessionId]
  );
  
  return result.rows[0];
};

const updateSessionStatus = async (sessionId, status) => {
  const result = await query(
    'UPDATE authorization_sessions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, sessionId]
  );
  
  return result.rows[0];
};

const getExpiredSessions = async () => {
  const result = await query(
    `SELECT * FROM authorization_sessions 
     WHERE status = 'active' AND expires_at <= NOW()`
  );
  
  return result.rows;
};

const deactivateExpiredSessions = async () => {
  const result = await query(
    `UPDATE authorization_sessions 
     SET status = 'expired', updated_at = NOW() 
     WHERE status = 'active' AND expires_at <= NOW()
     RETURNING *`
  );
  
  return result.rows;
};

module.exports = {
  createAuthSession,
  getActiveSessionByUserId,
  getSessionById,
  updateSessionStatus,
  getExpiredSessions,
  deactivateExpiredSessions
};

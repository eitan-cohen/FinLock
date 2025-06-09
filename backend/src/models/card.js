
const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const createVirtualCard = async (userId, lithicCardId, cardToken) => {
  const cardId = uuidv4();
  
  const result = await query(
    `INSERT INTO virtual_cards (id, user_id, lithic_card_id, card_token, status, created_at)
     VALUES ($1, $2, $3, $4, 'frozen', NOW())
     RETURNING *`,
    [cardId, userId, lithicCardId, cardToken]
  );
  
  return result.rows[0];
};

const getCardByUserId = async (userId) => {
  const result = await query(
    'SELECT * FROM virtual_cards WHERE user_id = $1',
    [userId]
  );
  
  return result.rows[0];
};

const getCardById = async (cardId) => {
  const result = await query(
    'SELECT * FROM virtual_cards WHERE id = $1',
    [cardId]
  );
  
  return result.rows[0];
};

const updateCardStatus = async (cardId, status) => {
  const result = await query(
    'UPDATE virtual_cards SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, cardId]
  );
  
  return result.rows[0];
};

const getCardByLithicId = async (lithicCardId) => {
  const result = await query(
    'SELECT * FROM virtual_cards WHERE lithic_card_id = $1',
    [lithicCardId]
  );
  
  return result.rows[0];
};

module.exports = {
  createVirtualCard,
  getCardByUserId,
  getCardById,
  updateCardStatus,
  getCardByLithicId
};

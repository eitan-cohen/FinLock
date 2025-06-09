
const { query } = require('../config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const createUser = async (userData) => {
  const { email, password, firstName, lastName, phoneNumber } = userData;
  const userId = uuidv4();
  const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
  
  const result = await query(
    `INSERT INTO users (id, email, password_hash, first_name, last_name, phone_number, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     RETURNING id, email, first_name, last_name, phone_number, created_at`,
    [userId, email, passwordHash, firstName, lastName, phoneNumber]
  );
  
  return result.rows[0];
};

const getUserByEmail = async (email) => {
  const result = await query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  
  return result.rows[0];
};

const getUserById = async (id) => {
  const result = await query(
    'SELECT id, email, first_name, last_name, phone_number, created_at FROM users WHERE id = $1',
    [id]
  );
  
  return result.rows[0];
};

const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const updateUserLastLogin = async (userId) => {
  await query(
    'UPDATE users SET last_login = NOW() WHERE id = $1',
    [userId]
  );
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  verifyPassword,
  updateUserLastLogin
};

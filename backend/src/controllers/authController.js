
const { createUser, getUserByEmail, verifyPassword, updateUserLastLogin } = require('../models/user');
const { createVirtualCard } = require('../models/card');
const { generateToken } = require('../utils/jwt');
const { createLithicCard } = require('../services/lithic');
const logger = require('../utils/logger');

const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Create user
    const user = await createUser({
      email,
      password,
      firstName,
      lastName,
      phoneNumber
    });

    // Create virtual card via Lithic
    const lithicCard = await createLithicCard({
      userId: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name
    });

    // Store virtual card in database
    const virtualCard = await createVirtualCard(
      user.id,
      lithicCard.token,
      lithicCard.card_token
    );

    // Generate JWT token
    const token = generateToken(user.id);

    logger.info('User registered successfully:', { userId: user.id, email: user.email });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phoneNumber: user.phone_number
      },
      card: {
        id: virtualCard.id,
        status: virtualCard.status,
        maskedNumber: lithicCard.last_four ? `****-****-****-${lithicCard.last_four}` : null
      },
      token
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Get user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Update last login
    await updateUserLastLogin(user.id);

    // Generate JWT token
    const token = generateToken(user.id);

    logger.info('User logged in successfully:', { userId: user.id, email: user.email });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phoneNumber: user.phone_number
      },
      token
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = req.user;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phoneNumber: user.phone_number,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile
};

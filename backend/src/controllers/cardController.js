
const { getCardByUserId, updateCardStatus } = require('../models/card');
const {
  createAuthSession,
  getActiveSessionByUserId,
  updateSessionStatus
} = require('../models/authSession');
const { unfreezeCard, freezeCardLithic, getCardDetails: getLithicCardDetails } = require('../services/lithic');
const { client: redisClient } = require('../config/redis');
const logger = require('../utils/logger');

const getCardStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const card = await getCardByUserId(userId);

    if (!card) {
      return res.status(404).json({
        error: 'Card not found',
        message: 'No virtual card found for this user'
      });
    }

    // Check for active authorization session
    const activeSession = await getActiveSessionByUserId(userId);

    res.json({
      card: {
        id: card.id,
        status: card.status,
        createdAt: card.created_at,
        updatedAt: card.updated_at
      },
      activeSession: activeSession ? {
        id: activeSession.id,
        amountLimit: activeSession.amount_limit,
        categoryMcc: activeSession.category_mcc,
        merchantName: activeSession.merchant_name,
        expiresAt: activeSession.expires_at
      } : null
    });
  } catch (error) {
    logger.error('Get card status error:', error);
    next(error);
  }
};

const authorizeTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { amountLimit, categoryMcc, timeLimit, merchantName } = req.body;

    const card = await getCardByUserId(userId);
    if (!card) {
      return res.status(404).json({
        error: 'Card not found',
        message: 'No virtual card found for this user'
      });
    }

    // Check if there's already an active session
    const existingSession = await getActiveSessionByUserId(userId);
    if (existingSession) {
      return res.status(409).json({
        error: 'Active session exists',
        message: 'Card is already authorized for transactions'
      });
    }

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + timeLimit * 60 * 1000);

    // Create authorization session
    const authSession = await createAuthSession({
      userId,
      cardId: card.id,
      amountLimit,
      categoryMcc,
      merchantName,
      expiresAt
    });

    // Unfreeze card via Lithic with spending controls
    await unfreezeCard(card.lithic_card_id, {
      amountLimit,
      categoryMcc,
      merchantName
    });

    // Update card status
    await updateCardStatus(card.id, 'active');

    // Set Redis timer for auto-refreeze
    const redisKey = `auto_refreeze:${authSession.id}`;
    await redisClient.setEx(redisKey, timeLimit * 60, JSON.stringify({
      sessionId: authSession.id,
      cardId: card.id,
      userId
    }));

    logger.info('Card authorized successfully:', {
      userId,
      cardId: card.id,
      sessionId: authSession.id,
      amountLimit,
      timeLimit
    });

    res.json({
      message: 'Card authorized successfully',
      session: {
        id: authSession.id,
        amountLimit: authSession.amount_limit,
        categoryMcc: authSession.category_mcc,
        merchantName: authSession.merchant_name,
        expiresAt: authSession.expires_at
      },
      card: {
        id: card.id,
        status: 'active'
      }
    });
  } catch (error) {
    logger.error('Authorize transaction error:', error);
    next(error);
  }
};

const freezeCard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const card = await getCardByUserId(userId);

    if (!card) {
      return res.status(404).json({
        error: 'Card not found',
        message: 'No virtual card found for this user'
      });
    }

    // Freeze card via Lithic
    await freezeCardLithic(card.lithic_card_id);

    // Update card status
    await updateCardStatus(card.id, 'frozen');

    // Deactivate any active sessions
    const activeSession = await getActiveSessionByUserId(userId);
    if (activeSession) {
      await updateSessionStatus(activeSession.id, 'cancelled');
      
      // Remove Redis timer
      const redisKey = `auto_refreeze:${activeSession.id}`;
      await redisClient.del(redisKey);
    }

    logger.info('Card frozen successfully:', { userId, cardId: card.id });

    res.json({
      message: 'Card frozen successfully',
      card: {
        id: card.id,
        status: 'frozen'
      }
    });
  } catch (error) {
    logger.error('Freeze card error:', error);
    next(error);
  }
};

const getCardDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const card = await getCardByUserId(userId);

    if (!card) {
      return res.status(404).json({
        error: 'Card not found',
        message: 'No virtual card found for this user'
      });
    }

    // Get detailed card information from Lithic
    const lithicDetails = await getLithicCardDetails(card.lithic_card_id);

    res.json({
      card: {
        id: card.id,
        status: card.status,
        maskedNumber: lithicDetails.last_four ? `****-****-****-${lithicDetails.last_four}` : null,
        expiryMonth: lithicDetails.exp_month,
        expiryYear: lithicDetails.exp_year,
        createdAt: card.created_at,
        updatedAt: card.updated_at
      }
    });
  } catch (error) {
    logger.error('Get card details error:', error);
    next(error);
  }
};

module.exports = {
  getCardStatus,
  authorizeTransaction,
  freezeCard,
  getCardDetails
};

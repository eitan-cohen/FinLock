
const crypto = require('crypto');
const { getCardByLithicId } = require('../models/card');
const { createTransaction, getTransactionByLithicId, updateTransactionStatus } = require('../models/transaction');
const { getActiveSessionByUserId, updateSessionStatus } = require('../models/authSession');
const { updateBudgetSpent } = require('../models/budget');
const { freezeCardLithic } = require('../services/lithic');
const { updateCardStatus } = require('../models/card');
const logger = require('../utils/logger');

const verifyWebhookSignature = (payload, signature, secret) => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
};

const handleLithicWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['lithic-signature'];
    const payload = JSON.stringify(req.body);

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature, process.env.LITHIC_WEBHOOK_SECRET)) {
      logger.warn('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { event_type, payload: eventPayload } = req.body;

    logger.info('Received Lithic webhook:', { event_type, payload: eventPayload });

    switch (event_type) {
      case 'transaction.created':
        await handleTransactionCreated(eventPayload);
        break;
      
      case 'transaction.updated':
        await handleTransactionUpdated(eventPayload);
        break;
      
      case 'authorization.created':
        await handleAuthorizationCreated(eventPayload);
        break;
      
      case 'authorization.updated':
        await handleAuthorizationUpdated(eventPayload);
        break;
      
      default:
        logger.info('Unhandled webhook event type:', event_type);
    }

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    logger.error('Webhook processing error:', error);
    next(error);
  }
};

const handleTransactionCreated = async (payload) => {
  const { token, amount, merchant, card_token, status } = payload;

  // Find the card
  const card = await getCardByLithicId(card_token);
  if (!card) {
    logger.error('Card not found for transaction:', { card_token });
    return;
  }

  // Get active authorization session
  const activeSession = await getActiveSessionByUserId(card.user_id);

  // Create transaction record
  await createTransaction({
    userId: card.user_id,
    cardId: card.id,
    lithicTransactionId: token,
    amount: amount / 100, // Convert from cents
    category: merchant.mcc || 'unknown',
    merchantName: merchant.descriptor,
    merchantMcc: merchant.mcc,
    status: status.toLowerCase(),
    authorizationSessionId: activeSession?.id
  });

  logger.info('Transaction created:', { 
    transactionId: token, 
    userId: card.user_id, 
    amount: amount / 100 
  });
};

const handleTransactionUpdated = async (payload) => {
  const { token, status } = payload;

  const transaction = await getTransactionByLithicId(token);
  if (!transaction) {
    logger.error('Transaction not found for update:', { token });
    return;
  }

  await updateTransactionStatus(transaction.id, status.toLowerCase());

  // If transaction is completed, update budget and potentially refreeze card
  if (status.toLowerCase() === 'settled') {
    await handleTransactionSettled(transaction);
  }

  logger.info('Transaction updated:', { transactionId: token, status });
};

const handleAuthorizationCreated = async (payload) => {
  // Handle authorization creation if needed
  logger.info('Authorization created:', payload);
};

const handleAuthorizationUpdated = async (payload) => {
  const { token, status, card_token } = payload;

  if (status === 'DECLINED') {
    // Find the card and potentially refreeze it
    const card = await getCardByLithicId(card_token);
    if (card) {
      await freezeCardLithic(card.lithic_card_id);
      await updateCardStatus(card.id, 'frozen');
      
      // Deactivate active session
      const activeSession = await getActiveSessionByUserId(card.user_id);
      if (activeSession) {
        await updateSessionStatus(activeSession.id, 'declined');
      }
      
      logger.info('Card refrozen due to declined authorization:', { cardId: card.id });
    }
  }

  logger.info('Authorization updated:', { token, status });
};

const handleTransactionSettled = async (transaction) => {
  try {
    // Update budget spending if applicable
    // This is a simplified implementation - in production, you'd have more sophisticated budget matching
    
    // Automatically refreeze card after successful transaction
    const card = await getCardByLithicId(transaction.card_id);
    if (card) {
      await freezeCardLithic(card.lithic_card_id);
      await updateCardStatus(card.id, 'frozen');
      
      // Mark authorization session as completed
      if (transaction.authorization_session_id) {
        await updateSessionStatus(transaction.authorization_session_id, 'completed');
      }
      
      logger.info('Card automatically refrozen after transaction settlement:', { 
        cardId: card.id, 
        transactionId: transaction.id 
      });
    }
  } catch (error) {
    logger.error('Error handling transaction settlement:', error);
  }
};

module.exports = {
  handleLithicWebhook
};

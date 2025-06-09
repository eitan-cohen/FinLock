
const { deactivateExpiredSessions } = require('../models/authSession');
const { updateCardStatus } = require('../models/card');
const { freezeCardLithic } = require('./lithic');
const { client: redisClient } = require('../config/redis');
const logger = require('../utils/logger');

const autoRefreezeJob = async () => {
  try {
    // Get expired sessions from database
    const expiredSessions = await deactivateExpiredSessions();

    for (const session of expiredSessions) {
      try {
        // Freeze the card via Lithic
        const card = await require('../models/card').getCardById(session.card_id);
        if (card) {
          await freezeCardLithic(card.lithic_card_id);
          await updateCardStatus(card.id, 'frozen');
          
          // Clean up Redis timer
          const redisKey = `auto_refreeze:${session.id}`;
          await redisClient.del(redisKey);
          
          logger.info('Card auto-refrozen due to session expiry:', {
            sessionId: session.id,
            cardId: card.id,
            userId: session.user_id
          });
        }
      } catch (error) {
        logger.error('Error auto-refreezing card:', {
          sessionId: session.id,
          error: error.message
        });
      }
    }

    // Also check Redis for any expired timers (backup mechanism)
    await checkRedisTimers();

  } catch (error) {
    logger.error('Auto-refreeze job error:', error);
  }
};

const checkRedisTimers = async () => {
  try {
    const keys = await redisClient.keys('auto_refreeze:*');
    
    for (const key of keys) {
      const ttl = await redisClient.ttl(key);
      
      // If TTL is -1 (no expiry) or -2 (key doesn't exist), clean up
      if (ttl <= 0) {
        const data = await redisClient.get(key);
        if (data) {
          const { sessionId, cardId, userId } = JSON.parse(data);
          
          // Force refreeze
          const card = await require('../models/card').getCardById(cardId);
          if (card) {
            await freezeCardLithic(card.lithic_card_id);
            await updateCardStatus(cardId, 'frozen');
            
            // Update session status
            await require('../models/authSession').updateSessionStatus(sessionId, 'expired');
            
            logger.info('Card force-refrozen via Redis cleanup:', {
              sessionId,
              cardId,
              userId
            });
          }
        }
        
        await redisClient.del(key);
      }
    }
  } catch (error) {
    logger.error('Redis timer check error:', error);
  }
};

module.exports = {
  autoRefreezeJob,
  checkRedisTimers
};

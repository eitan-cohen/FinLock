
const axios = require('axios');
const logger = require('../utils/logger');

class LithicService {
  constructor() {
    this.apiKey = process.env.LITHIC_API_KEY;
    this.baseURL = process.env.LITHIC_BASE_URL || 'https://sandbox.lithic.com';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async createLithicCard(userData) {
    // In development mode, return mock data instead of calling real API
    if (process.env.NODE_ENV === 'development' || !this.apiKey || this.apiKey === 'test_api_key') {
      const mockCardData = {
        token: `mock_card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'VIRTUAL',
        state: 'PAUSED',
        memo: `FinLock card for ${userData.email}`,
        spend_limit: 10000,
        spend_limit_duration: 'MONTHLY',
        created: new Date().toISOString(),
        last_four: '1234',
        pan: '4111111111111234' // Mock PAN for development
      };

      logger.info('Mock Lithic card created for development:', { 
        cardToken: mockCardData.token,
        userId: userData.userId 
      });

      return mockCardData;
    }

    try {
      const response = await this.client.post('/v1/cards', {
        type: 'VIRTUAL',
        account_token: process.env.LITHIC_ACCOUNT_TOKEN, // You'll need to set this
        card_program_token: process.env.LITHIC_CARD_PROGRAM_TOKEN, // You'll need to set this
        memo: `FinLock card for ${userData.email}`,
        spend_limit: 10000, // $100 default limit in cents
        spend_limit_duration: 'MONTHLY',
        state: 'PAUSED' // Start frozen
      });

      logger.info('Lithic card created successfully:', { 
        cardToken: response.data.token,
        userId: userData.userId 
      });

      return response.data;
    } catch (error) {
      logger.error('Error creating Lithic card:', error.response?.data || error.message);
      throw new Error('Failed to create virtual card');
    }
  }

  async unfreezeCard(cardToken, controls = {}) {
    // In development mode, just log the action
    if (process.env.NODE_ENV === 'development' || !this.apiKey || this.apiKey === 'test_api_key') {
      logger.info('Mock card unfrozen for development:', { cardToken, controls });
      return { success: true, state: 'OPEN' };
    }

    try {
      const { amountLimit, categoryMcc, merchantName } = controls;

      // Update card state to OPEN
      await this.client.patch(`/v1/cards/${cardToken}`, {
        state: 'OPEN'
      });

      // Set spending controls if provided
      if (amountLimit || categoryMcc || merchantName) {
        const spendingControls = {
          spend_limit: amountLimit ? Math.round(amountLimit * 100) : undefined, // Convert to cents
          spend_limit_duration: 'TRANSACTION',
          allowed_mcc: categoryMcc ? [categoryMcc] : undefined,
          blocked_mcc: categoryMcc ? undefined : [], // Allow all if no specific MCC
        };

        await this.client.post(`/v1/cards/${cardToken}/spending_controls`, spendingControls);
      }

      logger.info('Card unfrozen successfully:', { cardToken, controls });
    } catch (error) {
      logger.error('Error unfreezing card:', error.response?.data || error.message);
      throw new Error('Failed to unfreeze card');
    }
  }

  async freezeCardLithic(cardToken) {
    // In development mode, just log the action
    if (process.env.NODE_ENV === 'development' || !this.apiKey || this.apiKey === 'test_api_key') {
      logger.info('Mock card frozen for development:', { cardToken });
      return { success: true, state: 'PAUSED' };
    }

    try {
      await this.client.patch(`/v1/cards/${cardToken}`, {
        state: 'PAUSED'
      });

      logger.info('Card frozen successfully:', { cardToken });
    } catch (error) {
      logger.error('Error freezing card:', error.response?.data || error.message);
      throw new Error('Failed to freeze card');
    }
  }

  async getCardDetails(cardToken) {
    try {
      const response = await this.client.get(`/v1/cards/${cardToken}`);
      return response.data;
    } catch (error) {
      logger.error('Error getting card details:', error.response?.data || error.message);
      throw new Error('Failed to get card details');
    }
  }

  async getTransactions(cardToken, limit = 50) {
    try {
      const response = await this.client.get('/v1/transactions', {
        params: {
          card_token: cardToken,
          page_size: limit
        }
      });
      return response.data;
    } catch (error) {
      logger.error('Error getting transactions:', error.response?.data || error.message);
      throw new Error('Failed to get transactions');
    }
  }
}

const lithicService = new LithicService();

module.exports = {
  createLithicCard: lithicService.createLithicCard.bind(lithicService),
  unfreezeCard: lithicService.unfreezeCard.bind(lithicService),
  freezeCardLithic: lithicService.freezeCardLithic.bind(lithicService),
  getCardDetails: lithicService.getCardDetails.bind(lithicService),
  getTransactions: lithicService.getTransactions.bind(lithicService)
};

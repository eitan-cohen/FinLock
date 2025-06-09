
const {
  getTransactionsByUserId,
  getTransactionById,
  getSpendingAnalytics: getSpendingAnalyticsModel
} = require('../models/transaction');
const logger = require('../utils/logger');

const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0, category, status } = req.query;

    let transactions = await getTransactionsByUserId(userId, parseInt(limit), parseInt(offset));

    // Apply filters if provided
    if (category) {
      transactions = transactions.filter(t => t.category === category);
    }
    if (status) {
      transactions = transactions.filter(t => t.status === status);
    }

    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      amount: transaction.amount,
      category: transaction.category,
      merchantName: transaction.merchant_name,
      merchantMcc: transaction.merchant_mcc,
      status: transaction.status,
      createdAt: transaction.created_at,
      updatedAt: transaction.updated_at
    }));

    res.json({
      transactions: formattedTransactions,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: formattedTransactions.length
      }
    });
  } catch (error) {
    logger.error('Get transactions error:', error);
    next(error);
  }
};

const getTransactionDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { transactionId } = req.params;

    const transaction = await getTransactionById(transactionId);

    if (!transaction || transaction.user_id !== userId) {
      return res.status(404).json({
        error: 'Transaction not found',
        message: 'Transaction not found or does not belong to this user'
      });
    }

    res.json({
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        category: transaction.category,
        merchantName: transaction.merchant_name,
        merchantMcc: transaction.merchant_mcc,
        status: transaction.status,
        authorizationSessionId: transaction.authorization_session_id,
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at
      }
    });
  } catch (error) {
    logger.error('Get transaction details error:', error);
    next(error);
  }
};

const getSpendingAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { period = '30 days' } = req.query;

    const analytics = await getSpendingAnalyticsModel(userId, period);

    const totalSpent = analytics.reduce((sum, item) => sum + parseFloat(item.total_amount), 0);
    const totalTransactions = analytics.reduce((sum, item) => sum + parseInt(item.transaction_count), 0);

    const formattedAnalytics = {
      summary: {
        totalSpent,
        totalTransactions,
        averageTransactionAmount: totalTransactions > 0 ? totalSpent / totalTransactions : 0,
        period
      },
      categoryBreakdown: analytics.map(item => ({
        category: item.category,
        totalAmount: parseFloat(item.total_amount),
        transactionCount: parseInt(item.transaction_count),
        averageAmount: parseFloat(item.avg_amount),
        percentage: totalSpent > 0 ? Math.round((parseFloat(item.total_amount) / totalSpent) * 100) : 0
      }))
    };

    res.json({
      analytics: formattedAnalytics
    });
  } catch (error) {
    logger.error('Get spending analytics error:', error);
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransactionDetails,
  getSpendingAnalytics
};

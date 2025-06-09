
const {
  createBudget: createBudgetModel,
  getBudgetsByUserId,
  getBudgetByCategory,
  updateBudgetSpent,
  deleteBudget: deleteBudgetModel
} = require('../models/budget');
const { getSpendingAnalytics } = require('../models/transaction');
const logger = require('../utils/logger');

const createBudget = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { category, limit, period } = req.body;

    // Check if budget already exists for this category
    const existingBudget = await getBudgetByCategory(userId, category);
    if (existingBudget) {
      return res.status(409).json({
        error: 'Budget already exists',
        message: `A budget for category '${category}' already exists`
      });
    }

    const budget = await createBudgetModel(userId, { category, limit, period });

    logger.info('Budget created successfully:', { userId, budgetId: budget.id, category });

    res.status(201).json({
      message: 'Budget created successfully',
      budget: {
        id: budget.id,
        category: budget.category,
        limit: budget.limit_amount,
        spent: budget.spent_amount,
        period: budget.period,
        createdAt: budget.created_at
      }
    });
  } catch (error) {
    logger.error('Create budget error:', error);
    next(error);
  }
};

const getBudgets = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const budgets = await getBudgetsByUserId(userId);

    const formattedBudgets = budgets.map(budget => ({
      id: budget.id,
      category: budget.category,
      limit: budget.limit_amount,
      spent: budget.spent_amount,
      remaining: budget.limit_amount - budget.spent_amount,
      period: budget.period,
      utilizationPercentage: Math.round((budget.spent_amount / budget.limit_amount) * 100),
      createdAt: budget.created_at,
      updatedAt: budget.updated_at
    }));

    res.json({
      budgets: formattedBudgets,
      totalBudgets: budgets.length
    });
  } catch (error) {
    logger.error('Get budgets error:', error);
    next(error);
  }
};

const updateBudget = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { budgetId } = req.params;
    const { limit, period } = req.body;

    // Verify budget belongs to user
    const budgets = await getBudgetsByUserId(userId);
    const budget = budgets.find(b => b.id === budgetId);

    if (!budget) {
      return res.status(404).json({
        error: 'Budget not found',
        message: 'Budget not found or does not belong to this user'
      });
    }

    // Update budget (simplified - in production, you'd have a proper update method)
    // For now, we'll return the existing budget with a message
    res.json({
      message: 'Budget update functionality to be implemented',
      budget: {
        id: budget.id,
        category: budget.category,
        limit: budget.limit_amount,
        spent: budget.spent_amount,
        period: budget.period
      }
    });
  } catch (error) {
    logger.error('Update budget error:', error);
    next(error);
  }
};

const deleteBudget = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { budgetId } = req.params;

    const deletedBudget = await deleteBudgetModel(budgetId, userId);

    if (!deletedBudget) {
      return res.status(404).json({
        error: 'Budget not found',
        message: 'Budget not found or does not belong to this user'
      });
    }

    logger.info('Budget deleted successfully:', { userId, budgetId });

    res.json({
      message: 'Budget deleted successfully',
      deletedBudget: {
        id: deletedBudget.id,
        category: deletedBudget.category
      }
    });
  } catch (error) {
    logger.error('Delete budget error:', error);
    next(error);
  }
};

const getBudgetAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { period = '30 days' } = req.query;

    const [budgets, spendingAnalytics] = await Promise.all([
      getBudgetsByUserId(userId),
      getSpendingAnalytics(userId, period)
    ]);

    const analytics = {
      totalBudgets: budgets.length,
      totalBudgetAmount: budgets.reduce((sum, budget) => sum + budget.limit_amount, 0),
      totalSpent: budgets.reduce((sum, budget) => sum + budget.spent_amount, 0),
      budgetUtilization: budgets.map(budget => ({
        category: budget.category,
        limit: budget.limit_amount,
        spent: budget.spent_amount,
        utilizationPercentage: Math.round((budget.spent_amount / budget.limit_amount) * 100),
        status: budget.spent_amount >= budget.limit_amount ? 'exceeded' : 
                budget.spent_amount >= budget.limit_amount * 0.8 ? 'warning' : 'good'
      })),
      spendingByCategory: spendingAnalytics
    };

    res.json({
      analytics,
      period
    });
  } catch (error) {
    logger.error('Get budget analytics error:', error);
    next(error);
  }
};

module.exports = {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  getBudgetAnalytics
};


const { getBudgetsByUserId, updateBudgetSpent, getBudgetByCategory } = require('../models/budget');
const { getTransactionsByCategory } = require('../models/transaction');
const logger = require('../utils/logger');

class BudgetService {
  async checkBudgetLimits(userId, category, amount) {
    try {
      const budget = await getBudgetByCategory(userId, category);
      
      if (!budget) {
        return { allowed: true, message: 'No budget set for this category' };
      }

      const newSpentAmount = budget.spent_amount + amount;
      
      if (newSpentAmount > budget.limit_amount) {
        return {
          allowed: false,
          message: `Transaction would exceed budget limit. Limit: $${budget.limit_amount}, Current: $${budget.spent_amount}, Attempted: $${amount}`,
          budget: {
            category: budget.category,
            limit: budget.limit_amount,
            spent: budget.spent_amount,
            remaining: budget.limit_amount - budget.spent_amount
          }
        };
      }

      return {
        allowed: true,
        message: 'Transaction within budget limits',
        budget: {
          category: budget.category,
          limit: budget.limit_amount,
          spent: budget.spent_amount,
          remaining: budget.limit_amount - newSpentAmount
        }
      };
    } catch (error) {
      logger.error('Error checking budget limits:', error);
      return { allowed: true, message: 'Budget check failed, allowing transaction' };
    }
  }

  async updateBudgetAfterTransaction(userId, category, amount) {
    try {
      const budget = await getBudgetByCategory(userId, category);
      
      if (budget) {
        await updateBudgetSpent(budget.id, amount);
        logger.info('Budget updated after transaction:', {
          userId,
          budgetId: budget.id,
          category,
          amount
        });
      }
    } catch (error) {
      logger.error('Error updating budget after transaction:', error);
    }
  }

  async getBudgetAlerts(userId) {
    try {
      const budgets = await getBudgetsByUserId(userId);
      const alerts = [];

      for (const budget of budgets) {
        const utilizationPercentage = (budget.spent_amount / budget.limit_amount) * 100;
        
        if (utilizationPercentage >= 100) {
          alerts.push({
            type: 'exceeded',
            category: budget.category,
            message: `Budget exceeded for ${budget.category}`,
            utilizationPercentage: Math.round(utilizationPercentage),
            budget
          });
        } else if (utilizationPercentage >= 80) {
          alerts.push({
            type: 'warning',
            category: budget.category,
            message: `Budget at ${Math.round(utilizationPercentage)}% for ${budget.category}`,
            utilizationPercentage: Math.round(utilizationPercentage),
            budget
          });
        }
      }

      return alerts;
    } catch (error) {
      logger.error('Error getting budget alerts:', error);
      return [];
    }
  }

  async resetPeriodBudgets() {
    try {
      // This would be called by a scheduled job to reset budgets based on their period
      // Implementation would depend on specific business rules
      logger.info('Budget reset job would run here');
    } catch (error) {
      logger.error('Error resetting period budgets:', error);
    }
  }
}

module.exports = new BudgetService();

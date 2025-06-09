
const Joi = require('joi');
const logger = require('../utils/logger');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      logger.warn('Validation error:', error.details);
      return res.status(400).json({
        error: 'Validation failed',
        message: error.details[0].message,
        details: error.details
      });
    }
    
    next();
  };
};

// Validation schemas
const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  authorizeTransaction: Joi.object({
    amountLimit: Joi.number().positive().required(),
    categoryMcc: Joi.string().length(4).optional(),
    timeLimit: Joi.number().min(1).max(1440).required(), // 1 minute to 24 hours
    merchantName: Joi.string().max(100).optional()
  }),

  createBudget: Joi.object({
    category: Joi.string().required(),
    limit: Joi.number().positive().required(),
    period: Joi.string().valid('daily', 'weekly', 'monthly').required()
  })
};

module.exports = {
  validate,
  schemas
};

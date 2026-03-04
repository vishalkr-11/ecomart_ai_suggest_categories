'use strict';

const Joi = require('joi');
const {
  CLIENT_TYPES,
  EVENT_TYPES,
  SUSTAINABILITY_LEVELS,
  AI_RESPONSE_SCHEMA,
} = require('../../config/constants');

// ─── Request Validation Schema ─────────────────────────────────────────────────

const proposalRequestSchema = Joi.object({
  clientType: Joi.string()
    .valid(...CLIENT_TYPES)
    .required()
    .messages({
      'any.only': `clientType must be one of: ${CLIENT_TYPES.join(', ')}`,
      'any.required': 'clientType is required',
    }),
  budgetLimit: Joi.number().positive().max(100_000_000).required().messages({
    'number.positive': 'budgetLimit must be a positive number',
    'any.required': 'budgetLimit is required',
  }),
  currency: Joi.string().length(3).uppercase().default('INR'),
  eventType: Joi.string()
    .valid(...EVENT_TYPES)
    .required()
    .messages({
      'any.only': `eventType must be one of: ${EVENT_TYPES.join(', ')}`,
      'any.required': 'eventType is required',
    }),
  sustainabilityPreferenceLevel: Joi.string()
    .valid(...Object.values(SUSTAINABILITY_LEVELS))
    .required()
    .messages({
      'any.only': `sustainabilityPreferenceLevel must be one of: ${Object.values(SUSTAINABILITY_LEVELS).join(', ')}`,
      'any.required': 'sustainabilityPreferenceLevel is required',
    }),
  headcount: Joi.number().integer().positive().max(100_000).default(1),
  notes: Joi.string().trim().max(1000).allow('').default(''),
});

/**
 * Validates the incoming HTTP request body for proposal generation.
 * @param {Object} body
 * @returns {{ error: string|null, value: Object|null }}
 */
function validateProposalRequest(body) {
  const { error, value } = proposalRequestSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((d) => d.message).join('; ');
    return { error: messages, value: null };
  }

  return { error: null, value };
}

// ─── AI Response Validation ────────────────────────────────────────────────────

const aiRecommendedProductSchema = Joi.object({
  sku: Joi.string().uppercase().trim().required(),
  suggestedQuantity: Joi.number().integer().min(1).max(100_000).required(),
  sustainabilityHighlight: Joi.string().trim().max(500).default(''),
});

const aiProposalResponseSchema = Joi.object({
  recommendedProducts: Joi.array()
    .items(aiRecommendedProductSchema)
    .min(AI_RESPONSE_SCHEMA.proposal.MIN_PRODUCTS)
    .max(AI_RESPONSE_SCHEMA.proposal.MAX_PRODUCTS)
    .required()
    .messages({
      'array.min': `AI must recommend at least ${AI_RESPONSE_SCHEMA.proposal.MIN_PRODUCTS} products`,
      'array.max': `AI must recommend at most ${AI_RESPONSE_SCHEMA.proposal.MAX_PRODUCTS} products`,
    }),
  impactPositioningSummary: Joi.string().trim().min(50).max(1000).required().messages({
    'string.min': 'impactPositioningSummary must be at least 50 characters',
    'any.required': 'AI response missing impactPositioningSummary',
  }),
  rationale: Joi.string().trim().max(2000).allow('').default(''),
});

/**
 * Validates the parsed AI response structure for proposal generation.
 * NOTE: This does NOT validate budget — that is done separately in proposalService.
 *
 * @param {Object} parsed
 * @returns {{ error: string|null, value: Object|null }}
 */
function validateAiProposalResponse(parsed) {
  const { error, value } = aiProposalResponseSchema.validate(parsed, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((d) => d.message).join('; ');
    return { error: messages, value: null };
  }

  return { error: null, value };
}

/**
 * Business logic: validates that backend-computed line items respect the budget.
 * This is the final financial gate — runs AFTER prices are fetched from the DB.
 *
 * @param {Array} lineItems   - Array of resolved line items with DB prices
 * @param {number} budgetLimit
 * @returns {{ valid: boolean, totalAllocated: number, remaining: number, error: string|null }}
 */
function validateBudgetAllocation(lineItems, budgetLimit) {
  if (!Array.isArray(lineItems) || lineItems.length === 0) {
    return { valid: false, totalAllocated: 0, remaining: budgetLimit, error: 'No line items to validate' };
  }

  const totalAllocated = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const remaining = parseFloat((budgetLimit - totalAllocated).toFixed(2));

  if (totalAllocated > budgetLimit) {
    return {
      valid: false,
      totalAllocated: parseFloat(totalAllocated.toFixed(2)),
      remaining,
      error: `Total allocation (${totalAllocated.toFixed(2)}) exceeds budget limit (${budgetLimit})`,
    };
  }

  return {
    valid: true,
    totalAllocated: parseFloat(totalAllocated.toFixed(2)),
    remaining,
    error: null,
  };
}

module.exports = {
  validateProposalRequest,
  validateAiProposalResponse,
  validateBudgetAllocation,
};

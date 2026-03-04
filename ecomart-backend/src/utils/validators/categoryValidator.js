'use strict';

const Joi = require('joi');
const { PRIMARY_CATEGORIES, SUSTAINABILITY_FILTERS, AI_RESPONSE_SCHEMA } = require('../../config/constants');

// ─── Request Validation Schema ─────────────────────────────────────────────────

const categoryRequestSchema = Joi.object({
  productName: Joi.string().trim().min(2).max(200).required().messages({
    'string.min': 'productName must be at least 2 characters',
    'string.max': 'productName must be at most 200 characters',
    'any.required': 'productName is required',
  }),
  productDescription: Joi.string().trim().min(10).max(2000).required().messages({
    'string.min': 'productDescription must be at least 10 characters',
    'any.required': 'productDescription is required',
  }),
  materials: Joi.array()
    .items(Joi.string().trim().min(1).max(100))
    .min(1)
    .max(20)
    .required()
    .messages({
      'array.min': 'At least one material is required',
      'any.required': 'materials is required',
    }),
  targetAudience: Joi.string().trim().min(2).max(500).required().messages({
    'any.required': 'targetAudience is required',
  }),
});

/**
 * Validates the incoming HTTP request body for category generation.
 * @param {Object} body
 * @returns {{ error: string|null, value: Object|null }}
 */
function validateCategoryRequest(body) {
  const { error, value } = categoryRequestSchema.validate(body, {
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

const aiCategoryResponseSchema = Joi.object({
  primaryCategory: Joi.string()
    .valid(...PRIMARY_CATEGORIES)
    .required()
    .messages({
      'any.only': `primaryCategory must be one of: ${PRIMARY_CATEGORIES.join(', ')}`,
      'any.required': 'AI response missing primaryCategory',
    }),
  subCategory: Joi.string().trim().min(2).max(100).required().messages({
    'any.required': 'AI response missing subCategory',
  }),
  seoTags: Joi.array()
    .items(
      Joi.string()
        .lowercase()
        .pattern(/^[a-z0-9-]+$/)
        .message('seoTags must be lowercase hyphenated strings')
    )
    .min(AI_RESPONSE_SCHEMA.category.MIN_TAGS)
    .max(AI_RESPONSE_SCHEMA.category.MAX_TAGS)
    .required()
    .messages({
      'array.min': `AI must return at least ${AI_RESPONSE_SCHEMA.category.MIN_TAGS} SEO tags`,
      'array.max': `AI must return at most ${AI_RESPONSE_SCHEMA.category.MAX_TAGS} SEO tags`,
    }),
  sustainabilityFilters: Joi.array()
    .items(Joi.string().valid(...SUSTAINABILITY_FILTERS))
    .min(AI_RESPONSE_SCHEMA.category.MIN_FILTERS)
    .max(AI_RESPONSE_SCHEMA.category.MAX_FILTERS)
    .required()
    .messages({
      'any.only': `sustainabilityFilters must be from the approved list`,
      'array.min': 'AI must return at least 1 sustainability filter',
    }),
  confidenceNote: Joi.string().allow('').default(''),
});

/**
 * Validates the parsed AI response for category generation.
 * This is the enforcement gate — if the AI hallucinated a category or
 * produced invalid filters, this throws and triggers a retry.
 *
 * @param {Object} parsed
 * @returns {{ error: string|null, value: Object|null }}
 */
function validateAiCategoryResponse(parsed) {
  const { error, value } = aiCategoryResponseSchema.validate(parsed, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((d) => d.message).join('; ');
    return { error: messages, value: null };
  }

  return { error: null, value };
}

module.exports = { validateCategoryRequest, validateAiCategoryResponse };

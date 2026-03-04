'use strict';

const categoryService = require('../services/categoryService');
const { validateCategoryRequest } = require('../utils/validators/categoryValidator');
const {
  created,
  ok,
  badRequest,
  notFound,
  serverError,
  aiError,
} = require('../utils/responseHelpers');
const logger = require('../config/logger');

/**
 * POST /api/v1/categories/generate
 *
 * Generate AI-powered category, sub-category, SEO tags, and sustainability
 * filters for a given product.
 */
async function generateCategory(req, res) {
  // 1. Validate request input
  const { error, value: input } = validateCategoryRequest(req.body);
  if (error) return badRequest(res, 'Validation failed', error);

  try {
    // 2. Delegate entirely to service layer
    const result = await categoryService.generateCategoryAndTags(input);

    return created(res, result, {
      message: 'Product categorised successfully',
    });
  } catch (err) {
    logger.error(`[CategoryController] generateCategory error: ${err.message}`);

    // Surface AI-specific errors with a different HTTP code
    if (err.message.startsWith('AI call failed')) {
      return aiError(res, err.message);
    }

    return serverError(res, err.message);
  }
}

/**
 * GET /api/v1/categories/results/:requestId
 *
 * Retrieve a previous categorisation result by its correlation ID.
 */
async function getCategoryResult(req, res) {
  const { requestId } = req.params;

  if (!requestId || requestId.length < 10) {
    return badRequest(res, 'Invalid requestId');
  }

  try {
    const result = await categoryService.getCategoryResultByRequestId(requestId);
    if (!result) return notFound(res, `No category result found for requestId: ${requestId}`);

    return ok(res, result);
  } catch (err) {
    logger.error(`[CategoryController] getCategoryResult error: ${err.message}`);
    return serverError(res);
  }
}

/**
 * GET /api/v1/categories/results
 *
 * List recent categorisation results with pagination.
 * Query params: page, limit
 */
async function listCategoryResults(req, res) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));

  try {
    const results = await categoryService.listCategoryResults({ page, limit });
    return ok(res, results, { page, limit });
  } catch (err) {
    logger.error(`[CategoryController] listCategoryResults error: ${err.message}`);
    return serverError(res);
  }
}

module.exports = { generateCategory, getCategoryResult, listCategoryResults };

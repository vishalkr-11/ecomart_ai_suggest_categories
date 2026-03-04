'use strict';

const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');
const { callAiWithRetry } = require('./ai/aiService');
const { buildCategorySystemPrompt, buildCategoryUserPrompt } = require('../utils/prompts/categoryPrompt');
const { validateAiCategoryResponse } = require('../utils/validators/categoryValidator');
const CategoryResult = require('../models/CategoryResult');
const Category = require('../models/Category');

/**
 * Module 1: AI Category & Tag Generator
 *
 * Orchestrates:
 *  1. Fetch active categories from DB (AI constraint injection)
 *  2. Build system + user prompts
 *  3. Invoke AI service with validator
 *  4. Persist result with full traceability
 *  5. Return structured output
 */
async function generateCategoryAndTags(input) {
  const requestId = uuidv4();
  logger.info(`[CategoryService] Starting categorisation — requestId: ${requestId}`);

  // Step 1: Verify category list is available in DB (defensive check)
  const activeCategories = await Category.find({ isActive: true }).select('name').lean();
  if (!activeCategories.length) {
    throw new Error('No active categories found in database. Please run the seed script first.');
  }

  // Step 2: Build prompts
  const systemPrompt = buildCategorySystemPrompt();
  const userPrompt = buildCategoryUserPrompt(input);

  // Step 3: Call AI with built-in retry and schema validation
  const aiResult = await callAiWithRetry({
    module: 'category-generator',
    requestId,
    systemPrompt,
    userPrompt,
    validator: validateAiCategoryResponse,
  });

  const { validatedData, rawResponse, usage, latencyMs, retryCount, model } = aiResult;

  // Step 4: Persist to database with full traceability
  const savedResult = await CategoryResult.create({
    requestId,
    input: {
      productName: input.productName,
      productDescription: input.productDescription,
      materials: input.materials,
      targetAudience: input.targetAudience,
    },
    promptUsed: `SYSTEM:\n${systemPrompt}\n\nUSER:\n${userPrompt}`,
    rawAiResponse: rawResponse,
    output: {
      primaryCategory: validatedData.primaryCategory,
      subCategory: validatedData.subCategory,
      seoTags: validatedData.seoTags,
      sustainabilityFilters: validatedData.sustainabilityFilters,
      confidenceNote: validatedData.confidenceNote || '',
    },
    aiMetadata: {
      model,
      promptTokens: usage.prompt_tokens || 0,
      completionTokens: usage.completion_tokens || 0,
      totalTokens: usage.total_tokens || 0,
      latencyMs,
      retryCount,
    },
    status: 'success',
  });

  logger.info(`[CategoryService] Result saved — id: ${savedResult._id}, requestId: ${requestId}`);

  // Step 5: Return clean structured output
  return {
    requestId,
    resultId: savedResult._id,
    input: savedResult.input,
    output: savedResult.output,
    aiMetadata: {
      model,
      totalTokens: usage.total_tokens || 0,
      latencyMs,
      retryCount,
    },
    createdAt: savedResult.createdAt,
  };
}

/**
 * Retrieve a previously saved categorisation result by requestId.
 * @param {string} requestId
 */
async function getCategoryResultByRequestId(requestId) {
  const result = await CategoryResult.findOne({ requestId }).lean();
  if (!result) return null;

  // Exclude raw prompt and AI response from public API response
  const { promptUsed, rawAiResponse, ...publicResult } = result;
  return publicResult;
}

/**
 * List recent categorisation results with pagination.
 * @param {Object} options
 * @param {number} options.page
 * @param {number} options.limit
 */
async function listCategoryResults({ page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const [results, total] = await Promise.all([
    CategoryResult.find({}, { promptUsed: 0, rawAiResponse: 0 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    CategoryResult.countDocuments(),
  ]);

  return { results, total, page, limit, totalPages: Math.ceil(total / limit) };
}

module.exports = { generateCategoryAndTags, getCategoryResultByRequestId, listCategoryResults };

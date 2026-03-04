'use strict';

const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');
const { callAiWithRetry } = require('./ai/aiService');
const { buildProposalSystemPrompt, buildProposalUserPrompt } = require('../utils/prompts/proposalPrompt');
const {
  validateAiProposalResponse,
  validateBudgetAllocation,
} = require('../utils/validators/proposalValidator');
const { SUSTAINABILITY_LEVELS } = require('../config/constants');
const Proposal = require('../models/Proposal');
const Product = require('../models/Product');

/**
 * Maps sustainabilityPreferenceLevel → minimum sustainability score
 * used when querying the product catalogue.
 */
const SUSTAINABILITY_SCORE_THRESHOLD = {
  [SUSTAINABILITY_LEVELS.LOW]: 0,
  [SUSTAINABILITY_LEVELS.MEDIUM]: 30,
  [SUSTAINABILITY_LEVELS.HIGH]: 60,
  [SUSTAINABILITY_LEVELS.PREMIUM]: 80,
};

/**
 * Module 2: AI B2B Proposal Generator
 *
 * Orchestrates:
 *  1. Fetch eligible products from DB (filtered by sustainability score)
 *  2. Build prompts with real product catalogue injected
 *  3. Invoke AI service — AI selects SKUs + quantities only
 *  4. Resolve prices from DB (never trust AI prices)
 *  5. Validate total allocation ≤ budget
 *  6. Persist proposal with full traceability
 *  7. Return structured proposal
 */
async function generateProposal(input) {
  const requestId = uuidv4();
  logger.info(`[ProposalService] Generating proposal — requestId: ${requestId}`);

  // Step 1: Fetch eligible product catalogue from DB
  const scoreThreshold = SUSTAINABILITY_SCORE_THRESHOLD[input.sustainabilityPreferenceLevel] ?? 0;
  const availableProducts = await Product.find({
    isActive: true,
    sustainabilityScore: { $gte: scoreThreshold },
  })
    .select('sku name category sustainabilityScore sustainabilityFilters pricing description impactMetrics')
    .lean();

  if (!availableProducts.length) {
    throw new Error(
      `No active products meet the sustainability level "${input.sustainabilityPreferenceLevel}". ` +
        'Please lower the sustainability preference or check product data.'
    );
  }

  logger.info(
    `[ProposalService] ${availableProducts.length} products eligible (score ≥ ${scoreThreshold})`
  );

  // Step 2: Build prompts — inject real catalogue so AI only picks real SKUs
  const systemPrompt = buildProposalSystemPrompt(availableProducts);
  const userPrompt = buildProposalUserPrompt(input);

  // Step 3: Call AI — AI returns SKU selections + quantities only
  const aiResult = await callAiWithRetry({
    module: 'proposal-generator',
    requestId,
    systemPrompt,
    userPrompt,
    validator: validateAiProposalResponse,
  });

  const { validatedData, rawResponse, usage, latencyMs, retryCount, model } = aiResult;

  // Step 4: Ground truth pricing — resolve every SKU against DB
  //          AI-suggested prices are NEVER used.
  const { lineItems, unknownSkus } = await resolveLineItemsFromDb(
    validatedData.recommendedProducts,
    availableProducts
  );

  if (unknownSkus.length > 0) {
    logger.warn(`[ProposalService] AI returned unknown SKUs: ${unknownSkus.join(', ')} — skipped`);
  }

  if (!lineItems.length) {
    throw new Error('None of the AI-recommended SKUs matched available products. Proposal cannot be created.');
  }

  // Step 5: Budget validation — backend enforced, not AI-determined
  const budgetValidation = validateBudgetAllocation(lineItems, input.budgetLimit);

  if (!budgetValidation.valid) {
    logger.info(
      `[ProposalService] Budget exceeded — trimming lowest-sustainability items to fit budget`
    );
    const trimmedItems = trimToFitBudget(lineItems, input.budgetLimit);
    const revalidation = validateBudgetAllocation(trimmedItems, input.budgetLimit);

    if (!revalidation.valid) {
      throw new Error(
        `Unable to fit proposal within budget ${input.currency} ${input.budgetLimit}. ` +
          `Minimum feasible cost: ${trimmedItems[0]?.lineTotal || 'N/A'}`
      );
    }

    lineItems.length = 0;
    lineItems.push(...trimmedItems);
    Object.assign(budgetValidation, revalidation);
  }

  // Step 6: Persist proposal with complete audit trail
  const proposalCode = generateProposalCode(input.clientType, input.eventType);

  const savedProposal = await Proposal.create({
    requestId,
    proposalCode,
    input: {
      clientType: input.clientType,
      budgetLimit: input.budgetLimit,
      currency: input.currency || 'INR',
      eventType: input.eventType,
      sustainabilityPreferenceLevel: input.sustainabilityPreferenceLevel,
      headcount: input.headcount || 1,
      notes: input.notes || '',
    },
    promptUsed: `SYSTEM:\n${systemPrompt}\n\nUSER:\n${userPrompt}`,
    rawAiResponse: rawResponse,
    lineItems,
    budgetSummary: {
      budgetLimit: input.budgetLimit,
      totalAllocated: budgetValidation.totalAllocated,
      remainingBudget: budgetValidation.remaining,
      isWithinBudget: budgetValidation.valid,
      currency: input.currency || 'INR',
    },
    impactPositioningSummary: validatedData.impactPositioningSummary,
    aiMetadata: {
      model,
      promptTokens: usage.prompt_tokens || 0,
      completionTokens: usage.completion_tokens || 0,
      totalTokens: usage.total_tokens || 0,
      latencyMs,
      retryCount,
    },
    status: 'validated',
  });

  logger.info(
    `[ProposalService] Proposal saved — code: ${proposalCode}, requestId: ${requestId}`
  );

  // Step 7: Return clean, structured response
  return {
    requestId,
    proposalId: savedProposal._id,
    proposalCode,
    input: savedProposal.input,
    lineItems: savedProposal.lineItems,
    budgetSummary: savedProposal.budgetSummary,
    impactPositioningSummary: savedProposal.impactPositioningSummary,
    aiMetadata: { model, totalTokens: usage.total_tokens || 0, latencyMs, retryCount },
    status: savedProposal.status,
    createdAt: savedProposal.createdAt,
  };
}

// ─── Private Helpers ──────────────────────────────────────────────────────────

/**
 * Resolves AI-suggested SKUs to DB products and computes real pricing.
 * SKUs not found in the DB are collected in unknownSkus and skipped.
 */
async function resolveLineItemsFromDb(recommendedProducts, availableProducts) {
  const productMap = new Map(availableProducts.map((p) => [p.sku.toUpperCase(), p]));
  const lineItems = [];
  const unknownSkus = [];

  for (const rec of recommendedProducts) {
    const sku = rec.sku.toUpperCase();
    const product = productMap.get(sku);

    if (!product) {
      unknownSkus.push(sku);
      continue;
    }

    // Use DB-stored bulk pricing logic
    const unitPrice = getEffectivePriceForQuantity(product, rec.suggestedQuantity);
    const lineTotal = parseFloat((unitPrice * rec.suggestedQuantity).toFixed(2));

    lineItems.push({
      productId: product._id,
      productName: product.name,
      sku: product.sku,
      category: product.category,
      quantity: rec.suggestedQuantity,
      unitPrice,
      lineTotal,
      sustainabilityHighlight: rec.sustainabilityHighlight || '',
    });
  }

  return { lineItems, unknownSkus };
}

/**
 * Compute effective price using DB bulk pricing tiers.
 * Falls back to basePrice if no bulk tier applies.
 */
function getEffectivePriceForQuantity(product, qty) {
  const bulkTiers = (product.pricing?.bulkPricing || [])
    .filter((tier) => qty >= tier.minQty)
    .sort((a, b) => b.minQty - a.minQty);

  return bulkTiers.length > 0 ? bulkTiers[0].pricePerUnit : product.pricing.basePrice;
}

/**
 * Budget trimming strategy: remove the lowest sustainability score items
 * one by one until the total fits within budget. This ensures the client
 * always gets the best sustainability value for money.
 */
function trimToFitBudget(lineItems, budgetLimit) {
  // Sort ascending by sustainability (remove least sustainable first)
  const sorted = [...lineItems].sort(
    (a, b) => (a.sustainabilityScore || 0) - (b.sustainabilityScore || 0)
  );

  const kept = [...sorted];
  while (kept.length > 1) {
    const total = kept.reduce((s, i) => s + i.lineTotal, 0);
    if (total <= budgetLimit) break;
    kept.shift(); // Remove lowest sustainability item
  }
  return kept;
}

/**
 * Generates a human-readable proposal code for reference.
 */
function generateProposalCode(clientType, eventType) {
  const prefix = `ECO-${clientType.toUpperCase().slice(0, 3)}-${eventType.toUpperCase().slice(0, 3)}`;
  const suffix = Date.now().toString(36).toUpperCase();
  return `${prefix}-${suffix}`;
}

// ─── Query Methods ─────────────────────────────────────────────────────────────

async function getProposalByRequestId(requestId) {
  const proposal = await Proposal.findOne({ requestId }, { promptUsed: 0, rawAiResponse: 0 }).lean();
  return proposal || null;
}

async function getProposalByCode(proposalCode) {
  const proposal = await Proposal.findOne({ proposalCode }, { promptUsed: 0, rawAiResponse: 0 }).lean();
  return proposal || null;
}

async function listProposals({ page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const [results, total] = await Promise.all([
    Proposal.find({}, { promptUsed: 0, rawAiResponse: 0 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Proposal.countDocuments(),
  ]);
  return { results, total, page, limit, totalPages: Math.ceil(total / limit) };
}

module.exports = {
  generateProposal,
  getProposalByRequestId,
  getProposalByCode,
  listProposals,
};

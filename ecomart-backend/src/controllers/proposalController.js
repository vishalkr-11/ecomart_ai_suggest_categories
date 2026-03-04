'use strict';

const proposalService = require('../services/proposalService');
const { validateProposalRequest } = require('../utils/validators/proposalValidator');
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
 * POST /api/v1/proposals/generate
 *
 * Generate an AI-powered B2B product proposal with verified budget allocation.
 */
async function generateProposal(req, res) {
  // 1. Validate request input
  const { error, value: input } = validateProposalRequest(req.body);
  if (error) return badRequest(res, 'Validation failed', error);

  try {
    // 2. Delegate to service layer (all business logic lives there)
    const result = await proposalService.generateProposal(input);

    return created(res, result, {
      message: 'B2B proposal generated successfully',
      proposalCode: result.proposalCode,
    });
  } catch (err) {
    logger.error(`[ProposalController] generateProposal error: ${err.message}`);

    if (err.message.startsWith('AI call failed')) {
      return aiError(res, err.message);
    }

    return serverError(res, err.message);
  }
}

/**
 * GET /api/v1/proposals/:proposalCode
 *
 * Retrieve a proposal by its human-readable proposal code.
 */
async function getProposalByCode(req, res) {
  const { proposalCode } = req.params;

  if (!proposalCode) return badRequest(res, 'proposalCode is required');

  try {
    const proposal = await proposalService.getProposalByCode(proposalCode);
    if (!proposal) return notFound(res, `No proposal found for code: ${proposalCode}`);

    return ok(res, proposal);
  } catch (err) {
    logger.error(`[ProposalController] getProposalByCode error: ${err.message}`);
    return serverError(res);
  }
}

/**
 * GET /api/v1/proposals/request/:requestId
 *
 * Retrieve a proposal by correlation requestId.
 */
async function getProposalByRequestId(req, res) {
  const { requestId } = req.params;

  if (!requestId || requestId.length < 10) {
    return badRequest(res, 'Invalid requestId');
  }

  try {
    const proposal = await proposalService.getProposalByRequestId(requestId);
    if (!proposal) return notFound(res, `No proposal found for requestId: ${requestId}`);

    return ok(res, proposal);
  } catch (err) {
    logger.error(`[ProposalController] getProposalByRequestId error: ${err.message}`);
    return serverError(res);
  }
}

/**
 * GET /api/v1/proposals
 *
 * List proposals with pagination.
 * Query params: page, limit
 */
async function listProposals(req, res) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));

  try {
    const results = await proposalService.listProposals({ page, limit });
    return ok(res, results, { page, limit });
  } catch (err) {
    logger.error(`[ProposalController] listProposals error: ${err.message}`);
    return serverError(res);
  }
}

module.exports = { generateProposal, getProposalByCode, getProposalByRequestId, listProposals };

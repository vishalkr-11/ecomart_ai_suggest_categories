'use strict';

const { Router } = require('express');
const {
  generateProposal,
  getProposalByCode,
  getProposalByRequestId,
  listProposals,
} = require('../controllers/proposalController');

const router = Router();

/**
 * POST /api/v1/proposals/generate
 * Body: { clientType, budgetLimit, eventType, sustainabilityPreferenceLevel, headcount?, notes? }
 */
router.post('/generate', generateProposal);

/**
 * GET /api/v1/proposals
 * Query: ?page=1&limit=20
 */
router.get('/', listProposals);

/**
 * GET /api/v1/proposals/request/:requestId
 */
router.get('/request/:requestId', getProposalByRequestId);

/**
 * GET /api/v1/proposals/:proposalCode
 */
router.get('/:proposalCode', getProposalByCode);

module.exports = router;

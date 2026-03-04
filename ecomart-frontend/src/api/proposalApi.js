import apiClient from './apiClient';

/**
 * POST /proposals/generate
 */
export const generateProposal = (payload) =>
  apiClient.post('/proposals/generate', payload);

/**
 * GET /proposals?page&limit
 */
export const listProposals = (page = 1, limit = 12) =>
  apiClient.get('/proposals', { params: { page, limit } });

/**
 * GET /proposals/:proposalCode
 */
export const getProposalByCode = (proposalCode) =>
  apiClient.get(`/proposals/${proposalCode}`);

/**
 * GET /proposals/request/:requestId
 */
export const getProposalByRequestId = (requestId) =>
  apiClient.get(`/proposals/request/${requestId}`);

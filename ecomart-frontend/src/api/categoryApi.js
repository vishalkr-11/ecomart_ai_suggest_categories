import apiClient from './apiClient';

/**
 * POST /categories/generate
 * @param {{ productName, productDescription, materials, targetAudience }} payload
 */
export const generateCategory = (payload) =>
  apiClient.post('/categories/generate', payload);

/**
 * GET /categories/results?page&limit
 */
export const listCategoryResults = (page = 1, limit = 12) =>
  apiClient.get('/categories/results', { params: { page, limit } });

/**
 * GET /categories/results/:requestId
 */
export const getCategoryResult = (requestId) =>
  apiClient.get(`/categories/results/${requestId}`);

'use strict';

const { Router } = require('express');
const { generateCategory, getCategoryResult, listCategoryResults } = require('../controllers/categoryController');

const router = Router();

/**
 * POST /api/v1/categories/generate
 * Body: { productName, productDescription, materials[], targetAudience }
 */
router.post('/generate', generateCategory);

/**
 * GET /api/v1/categories/results
 * Query: ?page=1&limit=20
 */
router.get('/results', listCategoryResults);

/**
 * GET /api/v1/categories/results/:requestId
 */
router.get('/results/:requestId', getCategoryResult);

module.exports = router;

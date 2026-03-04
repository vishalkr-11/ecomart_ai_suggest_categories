'use strict';

const { Router } = require('express');
const categoryRoutes = require('./categoryRoutes');
const proposalRoutes = require('./proposalRoutes');

const router = Router();

// ─── Module 1: Category Generator ─────────────────────────────────────────────
router.use('/categories', categoryRoutes);

// ─── Module 2: Proposal Generator ─────────────────────────────────────────────
router.use('/proposals', proposalRoutes);

// ─── API Info ─────────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  res.json({
    service: 'EcoMart AI Backend API',
    version: 'v1',
    modules: {
      'category-generator': '/api/v1/categories',
      'proposal-generator': '/api/v1/proposals',
    },
    docs: 'See README.md for full API documentation',
  });
});

module.exports = router;

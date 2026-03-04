'use strict';

/**
 * Predefined primary categories stored here as source-of-truth constants.
 * These are also seeded into the database. AI is NOT allowed to return
 * a category outside this list — enforced in validation layer.
 */
const PRIMARY_CATEGORIES = [
  'Packaging & Wrapping',
  'Office & Stationery',
  'Food & Beverage',
  'Personal Care & Hygiene',
  'Cleaning & Household',
  'Apparel & Accessories',
  'Electronics & Gadgets',
  'Events & Gifting',
  'Agriculture & Garden',
  'Travel & Outdoors',
];

const SUSTAINABILITY_FILTERS = [
  'plastic-free',
  'compostable',
  'recycled-content',
  'biodegradable',
  'vegan',
  'organic',
  'fair-trade',
  'carbon-neutral',
  'zero-waste',
  'renewable-materials',
  'upcycled',
  'water-saving',
  'energy-efficient',
  'locally-sourced',
  'cruelty-free',
];

const SUSTAINABILITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  PREMIUM: 'premium',
};

const CLIENT_TYPES = [
  'corporate',
  'startup',
  'ngo',
  'government',
  'hospitality',
  'retail',
  'education',
];

const EVENT_TYPES = [
  'conference',
  'product-launch',
  'team-offsite',
  'trade-show',
  'client-gifting',
  'onboarding-kit',
  'festival-celebration',
  'award-ceremony',
  'workshop',
  'annual-day',
];

const AI_RESPONSE_SCHEMA = {
  category: {
    MIN_TAGS: 5,
    MAX_TAGS: 10,
    MIN_FILTERS: 1,
    MAX_FILTERS: 8,
  },
  proposal: {
    MIN_PRODUCTS: 2,
    MAX_PRODUCTS: 10,
    BUDGET_TOLERANCE_PERCENT: 0, // Total must be ≤ budget (no tolerance for over)
  },
};

module.exports = {
  PRIMARY_CATEGORIES,
  SUSTAINABILITY_FILTERS,
  SUSTAINABILITY_LEVELS,
  CLIENT_TYPES,
  EVENT_TYPES,
  AI_RESPONSE_SCHEMA,
};

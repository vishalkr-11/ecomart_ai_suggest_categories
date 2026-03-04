'use strict';

require('dotenv').config();

const mongoose = require('mongoose');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const { PRIMARY_CATEGORIES } = require('../src/config/constants');

// ─── Category Seed Data ────────────────────────────────────────────────────────
const CATEGORY_SEED = PRIMARY_CATEGORIES.map((name) => ({
  name,
  slug: name.toLowerCase().replace(/\s+&\s+|\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
  description: `Products related to ${name}`,
  isActive: true,
  suggestedSubCategories: [],
}));

// ─── Product Seed Data ─────────────────────────────────────────────────────────
const PRODUCT_SEED = [
  {
    name: 'Kraft Paper Carry Bags',
    sku: 'PKG-KRAFT-001',
    description: 'Sturdy kraft paper bags with twisted handles. 100% recycled paper, food-safe.',
    category: 'Packaging & Wrapping',
    subCategory: 'Paper Bags',
    materials: ['recycled kraft paper', 'jute twine'],
    sustainabilityFilters: ['recycled-content', 'plastic-free', 'biodegradable'],
    sustainabilityScore: 88,
    pricing: {
      basePrice: 18,
      currency: 'INR',
      minOrderQuantity: 100,
      bulkPricing: [
        { minQty: 500, pricePerUnit: 15 },
        { minQty: 2000, pricePerUnit: 12 },
      ],
    },
    targetAudience: ['retail', 'hospitality', 'events'],
    availableStock: 50000,
    impactMetrics: { plasticSavedPerUnitGrams: 25, carbonAvoidedPerUnitKg: 0.03 },
  },
  {
    name: 'Bamboo Ballpoint Pen Set',
    sku: 'OFF-BPEN-002',
    description: 'Set of 3 bamboo barrel pens with refillable cartridges. FSC-certified bamboo.',
    category: 'Office & Stationery',
    subCategory: 'Eco Pens',
    materials: ['bamboo', 'recycled aluminium'],
    sustainabilityFilters: ['plastic-free', 'recycled-content', 'renewable-materials'],
    sustainabilityScore: 82,
    pricing: {
      basePrice: 120,
      currency: 'INR',
      minOrderQuantity: 50,
      bulkPricing: [
        { minQty: 200, pricePerUnit: 100 },
        { minQty: 1000, pricePerUnit: 85 },
      ],
    },
    targetAudience: ['corporate', 'education', 'events'],
    availableStock: 10000,
    impactMetrics: { plasticSavedPerUnitGrams: 15, carbonAvoidedPerUnitKg: 0.01 },
  },
  {
    name: 'Seed Paper Notepad A5',
    sku: 'OFF-SNPAD-003',
    description: '80-page A5 notepad made from seed-embedded handmade paper. Plant it after use.',
    category: 'Office & Stationery',
    subCategory: 'Plantable Stationery',
    materials: ['seed paper', 'handmade recycled paper', 'soy ink'],
    sustainabilityFilters: ['recycled-content', 'plastic-free', 'zero-waste', 'biodegradable'],
    sustainabilityScore: 95,
    pricing: {
      basePrice: 250,
      currency: 'INR',
      minOrderQuantity: 25,
      bulkPricing: [
        { minQty: 100, pricePerUnit: 210 },
        { minQty: 500, pricePerUnit: 180 },
      ],
    },
    targetAudience: ['corporate', 'ngo', 'events', 'education'],
    availableStock: 5000,
    impactMetrics: { plasticSavedPerUnitGrams: 0, carbonAvoidedPerUnitKg: 0.05 },
  },
  {
    name: 'Stainless Steel Insulated Bottle 750ml',
    sku: 'TRV-SBOT-004',
    description: 'Double-walled 750ml stainless steel water bottle. Keeps drinks cold 24h / hot 12h.',
    category: 'Travel & Outdoors',
    subCategory: 'Reusable Drinkware',
    materials: ['food-grade stainless steel', 'BPA-free silicone'],
    sustainabilityFilters: ['plastic-free', 'zero-waste', 'energy-efficient'],
    sustainabilityScore: 90,
    pricing: {
      basePrice: 650,
      currency: 'INR',
      minOrderQuantity: 20,
      bulkPricing: [
        { minQty: 50, pricePerUnit: 590 },
        { minQty: 200, pricePerUnit: 520 },
      ],
    },
    targetAudience: ['corporate', 'hospitality', 'events', 'retail'],
    availableStock: 3000,
    impactMetrics: { plasticSavedPerUnitGrams: 200, carbonAvoidedPerUnitKg: 0.15 },
  },
  {
    name: 'Jute Tote Bag with Canvas Lining',
    sku: 'EVT-JTOTE-005',
    description: 'Natural jute tote bag with cotton canvas inner lining. Handles up to 10kg. Custom print ready.',
    category: 'Events & Gifting',
    subCategory: 'Eco Gifting Bags',
    materials: ['natural jute', 'cotton canvas'],
    sustainabilityFilters: ['plastic-free', 'biodegradable', 'vegan', 'renewable-materials'],
    sustainabilityScore: 85,
    pricing: {
      basePrice: 190,
      currency: 'INR',
      minOrderQuantity: 50,
      bulkPricing: [
        { minQty: 200, pricePerUnit: 160 },
        { minQty: 1000, pricePerUnit: 130 },
      ],
    },
    targetAudience: ['corporate', 'retail', 'events'],
    availableStock: 20000,
    impactMetrics: { plasticSavedPerUnitGrams: 50, carbonAvoidedPerUnitKg: 0.04 },
  },
  {
    name: 'Bamboo Desk Organiser Set',
    sku: 'OFF-BDSK-006',
    description: '4-piece bamboo desk organiser set — pen holder, card tray, sticky pad frame, and phone stand.',
    category: 'Office & Stationery',
    subCategory: 'Desk Accessories',
    materials: ['moso bamboo', 'natural lacquer'],
    sustainabilityFilters: ['plastic-free', 'renewable-materials', 'biodegradable'],
    sustainabilityScore: 80,
    pricing: {
      basePrice: 750,
      currency: 'INR',
      minOrderQuantity: 10,
      bulkPricing: [
        { minQty: 50, pricePerUnit: 680 },
        { minQty: 200, pricePerUnit: 600 },
      ],
    },
    targetAudience: ['corporate', 'startup', 'education'],
    availableStock: 2000,
    impactMetrics: { plasticSavedPerUnitGrams: 100, carbonAvoidedPerUnitKg: 0.08 },
  },
  {
    name: 'Compostable Event Badge with Lanyard',
    sku: 'EVT-BADGE-007',
    description: 'Event badge card made from cornstarch PLA. Paired with organic cotton lanyard. 100% compostable.',
    category: 'Events & Gifting',
    subCategory: 'Event Accessories',
    materials: ['cornstarch PLA', 'organic cotton'],
    sustainabilityFilters: ['compostable', 'plastic-free', 'biodegradable', 'organic'],
    sustainabilityScore: 93,
    pricing: {
      basePrice: 75,
      currency: 'INR',
      minOrderQuantity: 100,
      bulkPricing: [
        { minQty: 500, pricePerUnit: 60 },
        { minQty: 2000, pricePerUnit: 48 },
      ],
    },
    targetAudience: ['corporate', 'events', 'hospitality', 'government'],
    availableStock: 100000,
    impactMetrics: { plasticSavedPerUnitGrams: 12, carbonAvoidedPerUnitKg: 0.02 },
  },
  {
    name: 'Recycled Cotton Tote — Premium',
    sku: 'APR-RTOTE-008',
    description: 'Premium tote bag made from 100% recycled cotton fibre. Natural beige, weight 280 GSM.',
    category: 'Apparel & Accessories',
    subCategory: 'Sustainable Bags',
    materials: ['recycled cotton'],
    sustainabilityFilters: ['recycled-content', 'plastic-free', 'vegan', 'zero-waste'],
    sustainabilityScore: 87,
    pricing: {
      basePrice: 280,
      currency: 'INR',
      minOrderQuantity: 50,
      bulkPricing: [
        { minQty: 200, pricePerUnit: 240 },
        { minQty: 1000, pricePerUnit: 200 },
      ],
    },
    targetAudience: ['retail', 'corporate', 'events'],
    availableStock: 15000,
    impactMetrics: { plasticSavedPerUnitGrams: 0, carbonAvoidedPerUnitKg: 0.09 },
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // ── Categories ─────────────────────────────────────────────────────────────
    await Category.deleteMany({});
    const categories = await Category.insertMany(CATEGORY_SEED);
    console.log(`✅ Seeded ${categories.length} categories`);

    // ── Products ───────────────────────────────────────────────────────────────
    await Product.deleteMany({});
    const products = await Product.insertMany(PRODUCT_SEED);
    console.log(`✅ Seeded ${products.length} products`);

    console.log('\n🌱 Database seeded successfully. You can now start the server.\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();

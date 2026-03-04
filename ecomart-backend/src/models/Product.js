'use strict';

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    subCategory: {
      type: String,
      default: '',
    },
    materials: {
      type: [String],
      default: [],
    },
    sustainabilityFilters: {
      type: [String],
      default: [],
    },
    sustainabilityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    pricing: {
      basePrice: { type: Number, required: true, min: 0 },
      currency: { type: String, default: 'INR' },
      minOrderQuantity: { type: Number, default: 1 },
      bulkPricing: [
        {
          minQty: { type: Number },
          pricePerUnit: { type: Number },
        },
      ],
    },
    targetAudience: {
      type: [String],
      default: [],
    },
    availableStock: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    impactMetrics: {
      plasticSavedPerUnitGrams: { type: Number, default: 0 },
      carbonAvoidedPerUnitKg: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    collection: 'products',
  }
);

// Compound index for proposal queries
productSchema.index({ category: 1, isActive: 1, sustainabilityScore: -1 });

// Resolve effective price for a given quantity
productSchema.methods.getPriceForQuantity = function (qty) {
  const bulk = this.pricing.bulkPricing
    .filter((tier) => qty >= tier.minQty)
    .sort((a, b) => b.minQty - a.minQty);

  return bulk.length > 0 ? bulk[0].pricePerUnit : this.pricing.basePrice;
};

module.exports = mongoose.model('Product', productSchema);

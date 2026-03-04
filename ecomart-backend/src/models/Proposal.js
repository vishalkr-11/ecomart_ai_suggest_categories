'use strict';

const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
    sustainabilityHighlight: { type: String, default: '' },
  },
  { _id: false }
);

const proposalSchema = new mongoose.Schema(
  {
    // Traceability
    requestId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    proposalCode: {
      type: String,
      required: true,
      unique: true,
    },

    // Input payload
    input: {
      clientType: { type: String, required: true },
      budgetLimit: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
      eventType: { type: String, required: true },
      sustainabilityPreferenceLevel: { type: String, required: true },
      headcount: { type: Number, default: 1 },
      notes: { type: String, default: '' },
    },

    // AI prompt for observability
    promptUsed: {
      type: String,
      required: true,
    },

    // Raw AI output for debugging
    rawAiResponse: {
      type: String,
      required: true,
    },

    // Validated product line items (prices verified against DB)
    lineItems: {
      type: [lineItemSchema],
      required: true,
    },

    // Budget summary (computed by backend, never from AI)
    budgetSummary: {
      budgetLimit: { type: Number, required: true },
      totalAllocated: { type: Number, required: true },
      remainingBudget: { type: Number, required: true },
      isWithinBudget: { type: Boolean, required: true },
      currency: { type: String, default: 'INR' },
    },

    // AI-generated positioning (text content only)
    impactPositioningSummary: {
      type: String,
      required: true,
    },

    // AI metadata
    aiMetadata: {
      model: { type: String },
      promptTokens: { type: Number },
      completionTokens: { type: Number },
      totalTokens: { type: Number },
      latencyMs: { type: Number },
      retryCount: { type: Number, default: 0 },
    },

    status: {
      type: String,
      enum: ['draft', 'validated', 'sent', 'accepted', 'rejected'],
      default: 'validated',
    },
  },
  {
    timestamps: true,
    collection: 'proposals',
  }
);

// Index for dashboard queries
proposalSchema.index({ 'input.clientType': 1, createdAt: -1 });

module.exports = mongoose.model('Proposal', proposalSchema);

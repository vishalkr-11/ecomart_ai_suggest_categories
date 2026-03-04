'use strict';

const mongoose = require('mongoose');

const categoryResultSchema = new mongoose.Schema(
  {
    // Traceability
    requestId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Input payload
    input: {
      productName: { type: String, required: true },
      productDescription: { type: String, required: true },
      materials: { type: [String], required: true },
      targetAudience: { type: String, required: true },
    },

    // AI prompt sent (for observability)
    promptUsed: {
      type: String,
      required: true,
    },

    // Raw AI response before parsing (for debugging)
    rawAiResponse: {
      type: String,
      required: true,
    },

    // Validated & structured output
    output: {
      primaryCategory: { type: String, required: true },
      subCategory: { type: String, required: true },
      seoTags: { type: [String], required: true },
      sustainabilityFilters: { type: [String], required: true },
      confidenceNote: { type: String, default: '' },
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
      enum: ['success', 'failed', 'partial'],
      default: 'success',
    },
  },
  {
    timestamps: true,
    collection: 'category_results',
  }
);

module.exports = mongoose.model('CategoryResult', categoryResultSchema);

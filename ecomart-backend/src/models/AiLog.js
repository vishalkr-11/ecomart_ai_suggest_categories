'use strict';

const mongoose = require('mongoose');

/**
 * Central audit log for every outgoing AI call.
 * Stored separately from domain models so it can be queried independently
 * for observability dashboards, cost tracking, and debugging.
 */
const aiLogSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      index: true,
    },
    module: {
      type: String,
      required: true,
      enum: ['category-generator', 'proposal-generator', 'impact-reporter', 'whatsapp-bot'],
      index: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    rawResponse: {
      type: String,
      default: '',
    },
    parsedResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    model: {
      type: String,
    },
    usage: {
      promptTokens: { type: Number, default: 0 },
      completionTokens: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
    },
    latencyMs: {
      type: Number,
      default: 0,
    },
    attempt: {
      type: Number,
      default: 1,
    },
    success: {
      type: Boolean,
      required: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'ai_logs',
  }
);

// Useful for cost-per-module reporting
aiLogSchema.index({ module: 1, createdAt: -1 });
aiLogSchema.index({ success: 1, createdAt: -1 });

module.exports = mongoose.model('AiLog', aiLogSchema);

'use strict';

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    suggestedSubCategories: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'categories',
  }
);

module.exports = mongoose.model('Category', categorySchema);

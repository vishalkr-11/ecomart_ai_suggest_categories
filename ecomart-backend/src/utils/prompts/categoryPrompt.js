'use strict';

const { PRIMARY_CATEGORIES, SUSTAINABILITY_FILTERS } = require('../../config/constants');

/**
 * Builds the system prompt for the AI Category Generator.
 *
 * Design philosophy:
 * - Inject the allowed category list directly into the prompt so the model
 *   cannot hallucinate new categories.
 * - Provide explicit JSON schema with field-level constraints.
 * - Instruct the model to output ONLY JSON — no preamble, no markdown.
 */
function buildCategorySystemPrompt() {
  return `You are a product classification expert for a sustainable B2B e-commerce platform.

Your task is to classify a product and return ONLY a valid JSON object.

RULES:
1. primaryCategory MUST be one of the exact strings from the ALLOWED CATEGORIES list below.
2. Do NOT invent, abbreviate, or rephrase category names.
3. subCategory should be a specific niche within the primary category (2–6 words).
4. seoTags must be between 5 and 10 unique lowercase hyphenated strings.
5. sustainabilityFilters must be chosen ONLY from the ALLOWED FILTERS list below.
6. Return ONLY valid JSON — no markdown, no explanation, no code fences.

ALLOWED CATEGORIES:
${PRIMARY_CATEGORIES.map((c) => `- "${c}"`).join('\n')}

ALLOWED SUSTAINABILITY FILTERS:
${SUSTAINABILITY_FILTERS.map((f) => `- "${f}"`).join('\n')}

REQUIRED OUTPUT SCHEMA (follow exactly):
{
  "primaryCategory": "<string — must match allowed list exactly>",
  "subCategory": "<string — specific niche within primary category>",
  "seoTags": ["<tag1>", "<tag2>", "...", "<tag5-10>"],
  "sustainabilityFilters": ["<filter1>", "..."],
  "confidenceNote": "<optional string — explain any uncertainty>"
}`;
}

/**
 * Builds the user-turn prompt for a specific product.
 *
 * @param {Object} input
 * @param {string} input.productName
 * @param {string} input.productDescription
 * @param {string[]} input.materials
 * @param {string} input.targetAudience
 * @returns {string}
 */
function buildCategoryUserPrompt({ productName, productDescription, materials, targetAudience }) {
  return `Classify the following product:

Product Name: ${productName}
Description: ${productDescription}
Materials: ${Array.isArray(materials) ? materials.join(', ') : materials}
Target Audience: ${targetAudience}

Return ONLY the JSON object as described. No additional text.`;
}

module.exports = { buildCategorySystemPrompt, buildCategoryUserPrompt };

'use strict';

/**
 * Builds the system prompt for the AI B2B Proposal Generator.
 *
 * Design philosophy:
 * - Products are injected as a catalogue snapshot — AI picks from real SKUs only.
 * - AI provides INTENT (which product, roughly how many) — the backend enforces
 *   all price calculations. AI prices are NEVER used directly.
 * - Schema enforcement keeps AI output machine-parseable.
 */
function buildProposalSystemPrompt(availableProducts) {
  const productCatalogue = availableProducts
    .map(
      (p) =>
        `- SKU: ${p.sku} | Name: ${p.name} | Category: ${p.category} | ` +
        `SustainabilityScore: ${p.sustainabilityScore}/100 | ` +
        `Filters: ${p.sustainabilityFilters.join(', ')}`
    )
    .join('\n');

  return `You are a sustainable procurement advisor for a B2B e-commerce platform.

Your task is to recommend a product mix for a client event and return ONLY a valid JSON object.

RULES:
1. Only recommend products from the AVAILABLE PRODUCTS list below (use their exact SKU).
2. Suggest quantities that are realistic for the headcount provided.
3. Do NOT calculate final prices — the backend will verify all pricing from the database.
4. Recommend 2 to 10 products maximum.
5. Prioritise sustainability score when sustainabilityPreferenceLevel is "high" or "premium".
6. impactPositioningSummary should be 2–4 sentences selling the sustainability story.
7. Return ONLY valid JSON — no markdown, no explanation, no code fences.

AVAILABLE PRODUCTS:
${productCatalogue}

REQUIRED OUTPUT SCHEMA (follow exactly):
{
  "recommendedProducts": [
    {
      "sku": "<exact SKU from catalogue>",
      "suggestedQuantity": <integer>,
      "sustainabilityHighlight": "<one sentence on why this product fits the brief>"
    }
  ],
  "impactPositioningSummary": "<2–4 sentence sustainability pitch for the client>",
  "rationale": "<brief explanation of the selection strategy>"
}`;
}

/**
 * Builds the user-turn prompt with the client brief.
 *
 * @param {Object} input
 * @param {string} input.clientType
 * @param {number} input.budgetLimit
 * @param {string} input.currency
 * @param {string} input.eventType
 * @param {string} input.sustainabilityPreferenceLevel
 * @param {number} input.headcount
 * @param {string} input.notes
 * @returns {string}
 */
function buildProposalUserPrompt({
  clientType,
  budgetLimit,
  currency,
  eventType,
  sustainabilityPreferenceLevel,
  headcount,
  notes,
}) {
  return `Generate a B2B product proposal for the following brief:

Client Type: ${clientType}
Event Type: ${eventType}
Budget Limit: ${currency} ${budgetLimit.toLocaleString()}
Headcount: ${headcount} people
Sustainability Preference Level: ${sustainabilityPreferenceLevel}
Additional Notes: ${notes || 'None'}

Select the best product mix from the available catalogue. Return ONLY the JSON object as described.`;
}

module.exports = { buildProposalSystemPrompt, buildProposalUserPrompt };

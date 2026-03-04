'use strict';

/**
 * Safely parses JSON from AI response text.
 *
 * The AI is instructed to return pure JSON but occasionally wraps output
 * in markdown code fences. This utility strips those and parses safely.
 *
 * @param {string} rawText
 * @returns {{ parsed: Object|null, error: string|null }}
 */
function parseAiJson(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { parsed: null, error: 'AI returned empty or non-string response' };
  }

  // Strip markdown code fences if present
  let cleaned = rawText.trim();
  const codeFenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeFenceMatch) {
    cleaned = codeFenceMatch[1].trim();
  }

  // Extract the first JSON object if surrounded by prose
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  try {
    const parsed = JSON.parse(cleaned);
    if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
      return { parsed: null, error: 'AI response parsed but is not a JSON object' };
    }
    return { parsed, error: null };
  } catch (err) {
    return { parsed: null, error: `JSON parse failed: ${err.message}` };
  }
}

module.exports = { parseAiJson };

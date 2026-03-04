'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { v4: uuidv4 } = require('uuid');
const logger = require('../../config/logger');
const AiLog = require('../../models/AiLog');
const { parseAiJson } = require('../../utils/parseAiJson');

// ─── Lazy-initialised Gemini client ──────────────────────────────────────────
let _geminiClient = null;

function getGeminiClient() {
  if (!_geminiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    _geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _geminiClient;
}

const DEFAULT_MODEL       = process.env.GEMINI_MODEL        || 'gemini-2.0-flash';
const DEFAULT_MAX_TOKENS  = Number(process.env.GEMINI_MAX_TOKENS)  || 2000;
const DEFAULT_TEMPERATURE = Number(process.env.GEMINI_TEMPERATURE) || 0.2;
const MAX_RETRIES         = Number(process.env.AI_MAX_RETRIES)     || 3;
const RETRY_DELAY_MS      = Number(process.env.AI_RETRY_DELAY_MS)  || 1500;

/**
 * Core AI call — Gemini edition.
 *
 * Identical contract to the OpenAI version:
 *   callAiWithRetry({ module, requestId, systemPrompt, userPrompt, validator })
 *
 * Gemini differences handled here:
 *  1. Uses responseMimeType: "application/json" to force JSON output
 *     (equivalent to OpenAI's response_format: { type: 'json_object' })
 *  2. System instruction is a separate field, not a role:"system" message
 *  3. Usage metadata uses different field names — normalised before logging
 *
 * @param {Object} options
 * @param {string}   options.module
 * @param {string}   options.requestId
 * @param {string}   options.systemPrompt
 * @param {string}   options.userPrompt
 * @param {Function} options.validator     — (parsed) => { error, value }
 * @param {string}   [options.model]
 * @param {number}   [options.maxTokens]
 * @param {number}   [options.temperature]
 *
 * @returns {Promise<{
 *   validatedData: Object,
 *   rawResponse: string,
 *   usage: Object,
 *   latencyMs: number,
 *   retryCount: number,
 *   model: string
 * }>}
 */
async function callAiWithRetry({
  module: moduleName,
  requestId,
  systemPrompt,
  userPrompt,
  validator,
  model       = DEFAULT_MODEL,
  maxTokens   = DEFAULT_MAX_TOKENS,
  temperature = DEFAULT_TEMPERATURE,
}) {
  const client = getGeminiClient();
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const startTime  = Date.now();
    let rawResponse  = '';
    let usage        = {};

    try {
      logger.info(
        `[AI][${moduleName}] Attempt ${attempt}/${MAX_RETRIES} — requestId: ${requestId}`
      );

      // ── Build Gemini model instance ────────────────────────────────────
      const geminiModel = client.getGenerativeModel({
        model,
        // System instruction — Gemini's equivalent of role:"system"
        systemInstruction: systemPrompt,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          // Forces the model to return valid JSON only —
          // Gemini's equivalent of OpenAI's response_format: { type: 'json_object' }
          responseMimeType: 'application/json',
        },
      });

      // ── Send user message ──────────────────────────────────────────────
      const result = await geminiModel.generateContent(userPrompt);
      const latencyMs = Date.now() - startTime;

      // ── Extract text and usage ─────────────────────────────────────────
      rawResponse = result.response.text();

      // Normalise Gemini's usageMetadata to match the shape we log
      const meta = result.response.usageMetadata || {};
      usage = {
        prompt_tokens:     meta.promptTokenCount     || 0,
        completion_tokens: meta.candidatesTokenCount || 0,
        total_tokens:      meta.totalTokenCount      || 0,
      };

      // ── Parse JSON ─────────────────────────────────────────────────────
      const { parsed, error: parseError } = parseAiJson(rawResponse);
      if (parseError) throw new Error(`JSON parse failed: ${parseError}`);

      // ── Schema + business validation ───────────────────────────────────
      const { error: validationError, value: validatedData } = validator(parsed);
      if (validationError) throw new Error(`Schema validation failed: ${validationError}`);

      // ── Success — log and return ───────────────────────────────────────
      await persistAiLog({
        requestId,
        module: moduleName,
        prompt: `SYSTEM:\n${systemPrompt}\n\nUSER:\n${userPrompt}`,
        rawResponse,
        parsedResponse: validatedData,
        model,
        usage,
        latencyMs,
        attempt,
        success: true,
      });

      logger.info(
        `[AI][${moduleName}] Success on attempt ${attempt} — ${latencyMs}ms — ` +
        `${usage.total_tokens} tokens`
      );

      return {
        validatedData,
        rawResponse,
        usage,
        latencyMs,
        retryCount: attempt - 1,
        model,
      };

    } catch (err) {
      const latencyMs = Date.now() - startTime;
      lastError = err;

      logger.warn(`[AI][${moduleName}] Attempt ${attempt} failed: ${err.message}`);

      await persistAiLog({
        requestId,
        module:        moduleName,
        prompt:        `SYSTEM:\n${systemPrompt}\n\nUSER:\n${userPrompt}`,
        rawResponse,
        parsedResponse: null,
        model,
        usage,
        latencyMs,
        attempt,
        success:      false,
        errorMessage: err.message,
      });

      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * attempt; // exponential back-off
        logger.info(`[AI][${moduleName}] Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  throw new Error(
    `AI call failed after ${MAX_RETRIES} attempts for "${moduleName}". ` +
    `Last error: ${lastError?.message}`
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function persistAiLog({
  requestId, module: moduleName, prompt, rawResponse,
  parsedResponse, model, usage, latencyMs, attempt, success, errorMessage,
}) {
  try {
    await AiLog.create({
      requestId,
      module: moduleName,
      prompt,
      rawResponse,
      parsedResponse,
      model,
      usage: {
        promptTokens:     usage.prompt_tokens     || 0,
        completionTokens: usage.completion_tokens || 0,
        totalTokens:      usage.total_tokens      || 0,
      },
      latencyMs,
      attempt,
      success,
      errorMessage: errorMessage || null,
    });
  } catch (logErr) {
    // Never let a logging failure surface to the user
    logger.error('[AI] Failed to persist AI log:', logErr.message);
  }
}

module.exports = { callAiWithRetry };
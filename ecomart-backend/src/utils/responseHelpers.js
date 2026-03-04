'use strict';

/**
 * All API responses pass through these helpers to guarantee a consistent envelope.
 *
 * Success shape:   { success: true,  data: {...},  meta: {...} }
 * Error shape:     { success: false, error: { code, message, details? } }
 */

function successResponse(res, statusCode, data, meta = {}) {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(Object.keys(meta).length ? { meta } : {}),
    timestamp: new Date().toISOString(),
  });
}

function errorResponse(res, statusCode, code, message, details = null) {
  const body = {
    success: false,
    error: { code, message },
    timestamp: new Date().toISOString(),
  };

  if (details) body.error.details = details;

  return res.status(statusCode).json(body);
}

// Convenience wrappers
const ok = (res, data, meta) => successResponse(res, 200, data, meta);
const created = (res, data, meta) => successResponse(res, 201, data, meta);
const badRequest = (res, message, details) => errorResponse(res, 400, 'BAD_REQUEST', message, details);
const notFound = (res, message = 'Resource not found') => errorResponse(res, 404, 'NOT_FOUND', message);
const unprocessable = (res, message, details) => errorResponse(res, 422, 'UNPROCESSABLE', message, details);
const serverError = (res, message = 'Internal server error') => errorResponse(res, 500, 'SERVER_ERROR', message);
const aiError = (res, message) => errorResponse(res, 502, 'AI_ERROR', message);

module.exports = { ok, created, badRequest, notFound, unprocessable, serverError, aiError };

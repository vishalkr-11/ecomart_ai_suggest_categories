'use strict';

const logger = require('../config/logger');

/**
 * 404 handler — must be registered AFTER all routes.
 */
function notFound(req, res, next) {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  err.code = 'NOT_FOUND';
  next(err);
}

/**
 * Global error handler — must be registered last with four parameters.
 * Catches all errors propagated via next(err) or thrown in async handlers.
 *
 * Provides consistent error envelope regardless of error origin.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const code = err.code || (statusCode === 404 ? 'NOT_FOUND' : 'SERVER_ERROR');

  // Log full error for observability
  if (statusCode >= 500) {
    logger.error(`[ErrorHandler] ${req.method} ${req.originalUrl} — ${statusCode}: ${err.message}`, {
      stack: err.stack,
      requestId: req.requestId,
    });
  } else {
    logger.warn(`[ErrorHandler] ${req.method} ${req.originalUrl} — ${statusCode}: ${err.message}`);
  }

  // Sanitise error message in production for 5xx errors
  const message =
    statusCode >= 500 && process.env.NODE_ENV === 'production'
      ? 'An internal error occurred. Please try again later.'
      : err.message;

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(process.env.NODE_ENV !== 'production' && err.details ? { details: err.details } : {}),
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    requestId: req.requestId || null,
  });
}

module.exports = errorHandler;
module.exports.notFound = notFound;

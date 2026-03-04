'use strict';

const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

/**
 * Stamps every incoming request with a correlation ID (requestId).
 * - Written to req.requestId for downstream use
 * - Echoed back as X-Request-ID response header
 * - Logged so every request is traceable in logs
 */
function requestLogger(req, res, next) {
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  logger.info(`→ ${req.method} ${req.originalUrl}`, {
    requestId,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(`← ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`, {
      requestId,
      statusCode: res.statusCode,
      duration,
    });
  });

  next();
}

module.exports = requestLogger;

'use strict';

const { createLogger, format, transports } = require('winston');

const { combine, timestamp, printf, colorize, errors } = format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) =>
    stack
      ? `[${ts}] ${level}: ${message}\n${stack}`
      : `[${ts}] ${level}: ${message}`
  )
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  format.json()
);

// ─── IMPORTANT: Console-only on Vercel ───────────────────────────────────────
// Vercel's serverless filesystem is read-only — file transports will crash
// the function on boot. All logs are captured by Vercel's log dashboard anyway.
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [
    new transports.Console(),
    // NO file transports — incompatible with serverless (Vercel, Lambda, etc.)
  ],
  exitOnError: false,
});

module.exports = logger;
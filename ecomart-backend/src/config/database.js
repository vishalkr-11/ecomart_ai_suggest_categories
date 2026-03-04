'use strict';

const mongoose = require('mongoose');
const logger = require('./logger');

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
};

// Cache the connection promise across Vercel invocations
let cached = global._mongooseConnection;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined');

  if (cached && mongoose.connection.readyState === 1) {
    return cached;
  }

  cached = mongoose.connect(uri, MONGO_OPTIONS);
  global._mongooseConnection = cached;

  mongoose.connection.on('disconnected', () =>
    logger.warn('MongoDB disconnected')
  );
  mongoose.connection.on('error', (err) =>
    logger.error('MongoDB error:', err)
  );

  return cached;
}

module.exports = connectDB;
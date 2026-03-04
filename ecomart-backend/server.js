'use strict';

require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/database');
const logger = require('./src/config/logger');

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    await connectDB();
    logger.info('✅ MongoDB connected successfully');

    const server = app.listen(PORT, () => {
      logger.info(`🚀 EcoMart API server running on port ${PORT} [${process.env.NODE_ENV}]`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Promise Rejection:', reason);
      server.close(() => process.exit(1));
    });
  } catch (err) {
    logger.error('Fatal: failed to start server', err);
    process.exit(1);
  }
}

bootstrap();

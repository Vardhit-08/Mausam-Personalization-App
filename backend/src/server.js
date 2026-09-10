import app from './app.js';
import { config } from './config/env.js';
import { cronService } from './services/cron.service.js';
import { logger } from './utils/logger.js';

const PORT = config.port;

const server = app.listen(PORT, () => {
  logger.info(`=======================================================`);
  logger.info(` Express Weather Gateway running on port ${PORT}`);
  logger.info(` Environment: ${config.env}`);
  logger.info(` API Docs:    http://localhost:${PORT}/api-docs`);
  logger.info(` Health:      http://localhost:${PORT}/health`);
  logger.info(`=======================================================`);

  // Start background alert monitoring cron
  cronService.start();
});

// Graceful shutdown handling
function handleShutdown(signal) {
  logger.info(`Received ${signal}. Gracefully shutting down...`);
  cronService.stop();

  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });

  // Force close if taking too long
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 5000);
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export default server;


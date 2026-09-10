import { ApiResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  logger.error(`[Error] ${req.method} ${req.originalUrl} - ${message}`);
  if (err.stack && process.env.NODE_ENV === 'development') {
    logger.debug(err.stack);
  }

  return ApiResponse.error(res, message, statusCode, err.errors);
}

export function notFoundHandler(req, res, next) {
  return ApiResponse.error(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}


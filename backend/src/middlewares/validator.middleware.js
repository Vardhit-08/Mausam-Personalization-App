import { ApiError } from './error.middleware.js';

/**
 * Middleware factory for validating required fields in req.query or req.body
 */
export function validateRequired(fields, location = 'query') {
  return (req, res, next) => {
    const target = req[location] || {};
    const missing = [];

    for (const field of fields) {
      if (target[field] === undefined || target[field] === null || target[field] === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return next(
        new ApiError(400, `Missing required ${location} parameters: ${missing.join(', ')}`)
      );
    }

    next();
  };
}


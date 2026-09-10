import { auth } from '../config/firebase.js';
import { ApiError } from './error.middleware.js';

/**
 * Authentication Middleware using Firebase Admin SDK.
 * In development or when Firebase credentials are not yet populated in .env,
 * it provides a mock user payload so local testing and presentation demos proceed smoothly.
 */
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If Firebase Auth is not active, allow dev fallback user
    if (!auth) {
      req.user = {
        uid: req.headers['x-user-id'] || 'usr_dev_guest',
        email: 'guest@mausam.gov.in',
        name: 'Guest User',
        isMock: true,
      };
      return next();
    }
    return next(new ApiError(401, 'Unauthorized: Missing or malformed Authorization header.'));
  }

  const token = authHeader.split('Bearer ')[1].trim();

  try {
    if (auth) {
      const decodedToken = await auth.verifyIdToken(token);
      req.user = decodedToken;
      return next();
    } else {
      // Dev mode token bypass
      req.user = {
        uid: req.headers['x-user-id'] || 'usr_dev_' + Buffer.from(token).toString('base64').substring(0, 8),
        email: 'dev@mausam.gov.in',
        name: 'Dev User',
        isMock: true,
      };
      return next();
    }
  } catch (error) {
    return next(new ApiError(401, `Unauthorized: Invalid Firebase token (${error.message})`));
  }
}

/**
 * Optional authentication middleware: populates req.user if token is present, but doesn't block if missing.
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = {
      uid: req.headers['x-user-id'] || 'usr_guest',
      email: 'guest@mausam.gov.in',
      name: 'Guest User',
      isMock: true,
    };
    return next();
  }
  return authenticate(req, res, next);
}


/**
 * authStorage.js
 * 
 * Centralized source of truth for LocalStorage operations and session state.
 * Strictly adheres to the 4 canonical keys:
 * - isLoggedIn ("true" or absent)
 * - activePersona ("health" | "agriculture" | absent)
 * - userName (string)
 * - userEmail (string)
 */

export const AUTH_KEYS = {
  IS_LOGGED_IN: 'isLoggedIn',
  ACTIVE_PERSONA: 'activePersona',
  USER_NAME: 'userName',
  USER_EMAIL: 'userEmail',
};

export const AUTH_STATES = {
  LOGGED_OUT: 'LOGGED_OUT',
  AUTHENTICATED_NO_PERSONA: 'AUTHENTICATED_NO_PERSONA',
  AUTHENTICATED: 'AUTHENTICATED',
};

/**
 * Returns the canonical application authentication state.
 * Rule: activePersona alone NEVER authenticates a user.
 */
export function getAuthState(storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  if (!storage) return AUTH_STATES.LOGGED_OUT;

  const isLoggedIn = storage.getItem(AUTH_KEYS.IS_LOGGED_IN) === 'true';
  const activePersona = storage.getItem(AUTH_KEYS.ACTIVE_PERSONA);

  if (!isLoggedIn) {
    return AUTH_STATES.LOGGED_OUT;
  }

  if (!activePersona || activePersona.trim() === '') {
    return AUTH_STATES.AUTHENTICATED_NO_PERSONA;
  }

  return AUTH_STATES.AUTHENTICATED;
}

/**
 * Checks if the user is authenticated (isLoggedIn === "true").
 */
export function isAuthenticated(storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  if (!storage) return false;
  return storage.getItem(AUTH_KEYS.IS_LOGGED_IN) === 'true';
}

/**
 * Gets the active persona string if any ("health" | "agriculture" | null).
 */
export function getActivePersona(storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  if (!storage) return null;
  return storage.getItem(AUTH_KEYS.ACTIVE_PERSONA) || null;
}

/**
 * Gets current user info ({ name, email }).
 */
export function getCurrentUser(storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  if (!storage) return { name: '', email: '' };
  return {
    name: storage.getItem(AUTH_KEYS.USER_NAME) || '',
    email: storage.getItem(AUTH_KEYS.USER_EMAIL) || '',
  };
}

/**
 * Sets authenticated user details upon Login or Signup.
 * Note: Does NOT set or overwrite activePersona.
 */
export function setAuthenticatedUser({ name, email }, storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  if (!storage) return;
  storage.setItem(AUTH_KEYS.IS_LOGGED_IN, 'true');
  if (email) {
    storage.setItem(AUTH_KEYS.USER_EMAIL, email);
  }
  if (name) {
    storage.setItem(AUTH_KEYS.USER_NAME, name);
  }
}

/**
 * Sets the active persona upon selection.
 */
export function setPersona(persona, storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  if (!storage) return;
  if (persona) {
    storage.setItem(AUTH_KEYS.ACTIVE_PERSONA, persona);
  } else {
    storage.removeItem(AUTH_KEYS.ACTIVE_PERSONA);
  }
}

/**
 * Destroys only the application's authentication-related LocalStorage keys.
 * Does NOT call localStorage.clear() to preserve other frontend application data.
 */
export function clearSession(storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  if (!storage) return;
  storage.removeItem(AUTH_KEYS.IS_LOGGED_IN);
  storage.removeItem(AUTH_KEYS.ACTIVE_PERSONA);
  storage.removeItem(AUTH_KEYS.USER_NAME);
  storage.removeItem(AUTH_KEYS.USER_EMAIL);
}

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

export function isAuthenticated(storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  if (!storage) return false;
  return storage.getItem(AUTH_KEYS.IS_LOGGED_IN) === 'true';
}

export function getActivePersona(storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  if (!storage) return null;
  return storage.getItem(AUTH_KEYS.ACTIVE_PERSONA) || null;
}

export function getCurrentUser(storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  if (!storage) return { name: '', email: '' };
  return {
    name: storage.getItem(AUTH_KEYS.USER_NAME) || '',
    email: storage.getItem(AUTH_KEYS.USER_EMAIL) || '',
  };
}

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

export function setPersona(persona, storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  if (!storage) return;
  if (persona) {
    storage.setItem(AUTH_KEYS.ACTIVE_PERSONA, persona);
  } else {
    storage.removeItem(AUTH_KEYS.ACTIVE_PERSONA);
  }
}

export function clearSession(storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  if (!storage) return;
  storage.removeItem(AUTH_KEYS.IS_LOGGED_IN);
  storage.removeItem(AUTH_KEYS.ACTIVE_PERSONA);
  storage.removeItem(AUTH_KEYS.USER_NAME);
  storage.removeItem(AUTH_KEYS.USER_EMAIL);
}

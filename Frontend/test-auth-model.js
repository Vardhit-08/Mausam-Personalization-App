/**
 * test-auth-model.js
 * 
 * Automated verification suite for the 11 Acceptance Tests (Test A through Test K)
 * Validates the canonical LocalStorage persistence model, state machine, and route protection rules.
 */

import {
  AUTH_KEYS,
  AUTH_STATES,
  getAuthState,
  isAuthenticated,
  getActivePersona,
  getCurrentUser,
  setAuthenticatedUser,
  setPersona,
  clearSession,
} from './src/auth/authStorage.js';

// Mock localStorage for Node environment
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

/**
 * Pure route resolution function mirroring RootRoute, PublicOnlyRoute, PersonaRoute, and ProtectedRoute.
 */
function resolveRoute(path, storage) {
  const state = getAuthState(storage);

  if (path === '/') {
    if (state === AUTH_STATES.LOGGED_OUT) return { render: 'Landing' };
    if (state === AUTH_STATES.AUTHENTICATED_NO_PERSONA) return { redirect: '/persona' };
    if (state === AUTH_STATES.AUTHENTICATED) return { redirect: '/dashboard' };
  }

  if (path === '/login' || path === '/signup' || path === '/forgot-password') {
    if (state === AUTH_STATES.LOGGED_OUT) return { render: path.replace('/', '') };
    if (state === AUTH_STATES.AUTHENTICATED_NO_PERSONA) return { redirect: '/persona' };
    if (state === AUTH_STATES.AUTHENTICATED) return { redirect: '/dashboard' };
  }

  if (path === '/persona') {
    if (state === AUTH_STATES.LOGGED_OUT) return { redirect: '/' };
    if (state === AUTH_STATES.AUTHENTICATED_NO_PERSONA) return { render: 'PersonaSelection' };
    if (state === AUTH_STATES.AUTHENTICATED) return { redirect: '/dashboard' };
  }

  if (path === '/dashboard') {
    if (state === AUTH_STATES.LOGGED_OUT) return { redirect: '/' };
    if (state === AUTH_STATES.AUTHENTICATED_NO_PERSONA) return { redirect: '/persona' };
    if (state === AUTH_STATES.AUTHENTICATED) return { render: 'Dashboard' };
  }

  return { redirect: '/' };
}

let allPassed = true;
const results = [];

function assert(condition, testName, details) {
  if (condition) {
    results.push({ name: testName, status: 'PASS', details });
    console.log(`PASS - ${testName}`);
  } else {
    allPassed = false;
    results.push({ name: testName, status: 'FAIL', details });
    console.error(`FAIL - ${testName}: ${details}`);
  }
}

console.log('=====================================================================');
console.log('   Mausam Personalization App - Auth Model Verification Suite        ');
console.log('=====================================================================\n');

// Test A — Fresh browser
{
  const storage = new MockLocalStorage();
  const route = resolveRoute('/', storage);
  assert(
    route.render === 'Landing' && getAuthState(storage) === AUTH_STATES.LOGGED_OUT,
    'Test A — Fresh browser',
    `Expected Landing, got ${JSON.stringify(route)}`
  );
}

// Test B — Signup
{
  const storage = new MockLocalStorage();
  // Simulate signup action
  setAuthenticatedUser({ name: 'Demo User', email: 'demo@example.com' }, storage);
  setPersona(null, storage); // explicitly absent

  const isLoggedInVal = storage.getItem(AUTH_KEYS.IS_LOGGED_IN);
  const nameVal = storage.getItem(AUTH_KEYS.USER_NAME);
  const emailVal = storage.getItem(AUTH_KEYS.USER_EMAIL);
  const personaVal = storage.getItem(AUTH_KEYS.ACTIVE_PERSONA);
  const state = getAuthState(storage);
  const route = resolveRoute('/', storage);

  assert(
    isLoggedInVal === 'true' &&
    nameVal === 'Demo User' &&
    emailVal === 'demo@example.com' &&
    personaVal === null &&
    state === AUTH_STATES.AUTHENTICATED_NO_PERSONA &&
    route.redirect === '/persona',
    'Test B — Signup',
    `State: ${state}, Persona: ${personaVal}, Route: ${JSON.stringify(route)}`
  );
}

// Test C — Complete onboarding
{
  const storage = new MockLocalStorage();
  setAuthenticatedUser({ name: 'Demo User', email: 'demo@example.com' }, storage);
  setPersona('health', storage);

  const isLoggedInVal = storage.getItem(AUTH_KEYS.IS_LOGGED_IN);
  const personaVal = storage.getItem(AUTH_KEYS.ACTIVE_PERSONA);
  const state = getAuthState(storage);
  const route = resolveRoute('/dashboard', storage);

  assert(
    isLoggedInVal === 'true' &&
    personaVal === 'health' &&
    state === AUTH_STATES.AUTHENTICATED &&
    route.render === 'Dashboard',
    'Test C — Complete onboarding',
    `isLoggedIn: ${isLoggedInVal}, activePersona: ${personaVal}`
  );
}

// Test D — Refresh persistence
{
  const storage = new MockLocalStorage();
  setAuthenticatedUser({ name: 'Demo User', email: 'demo@example.com' }, storage);
  setPersona('health', storage);

  // Re-read storage upon refresh
  const stateAfterRefresh = getAuthState(storage);
  const personaAfterRefresh = getActivePersona(storage);
  const routeAfterRefresh = resolveRoute('/dashboard', storage);

  assert(
    stateAfterRefresh === AUTH_STATES.AUTHENTICATED &&
    personaAfterRefresh === 'health' &&
    routeAfterRefresh.render === 'Dashboard',
    'Test D — Refresh persistence',
    `After refresh: state=${stateAfterRefresh}, persona=${personaAfterRefresh}, route=${JSON.stringify(routeAfterRefresh)}`
  );
}

// Test E — Returning user
{
  const storage = new MockLocalStorage();
  storage.setItem(AUTH_KEYS.IS_LOGGED_IN, 'true');
  storage.setItem(AUTH_KEYS.ACTIVE_PERSONA, 'health');
  storage.setItem(AUTH_KEYS.USER_NAME, 'Demo User');
  storage.setItem(AUTH_KEYS.USER_EMAIL, 'demo@example.com');

  // Returning user opening '/'
  const route = resolveRoute('/', storage);
  assert(
    route.redirect === '/dashboard' && getActivePersona(storage) === 'health',
    'Test E — Returning user',
    `Opening / redirected to: ${JSON.stringify(route)}`
  );
}

// Test F — Login with existing persona
{
  const storage = new MockLocalStorage();
  // Existing persona from previous session
  storage.setItem(AUTH_KEYS.ACTIVE_PERSONA, 'health');
  // Logged out currently
  storage.removeItem(AUTH_KEYS.IS_LOGGED_IN);

  // Login occurs
  const existingPersonaBefore = getActivePersona(storage);
  setAuthenticatedUser({ email: 'demo@example.com' }, storage);
  // In Login, we do NOT overwrite activePersona!
  const personaAfterLogin = getActivePersona(storage);
  const state = getAuthState(storage);
  const targetRoute = personaAfterLogin ? '/dashboard' : '/persona';

  assert(
    existingPersonaBefore === 'health' &&
    personaAfterLogin === 'health' &&
    state === AUTH_STATES.AUTHENTICATED &&
    targetRoute === '/dashboard',
    'Test F — Login with existing persona',
    `Persona preserved: ${personaAfterLogin}, target: ${targetRoute}`
  );
}

// Test G — Login without persona
{
  const storage = new MockLocalStorage();
  // Absent auth and absent persona
  setAuthenticatedUser({ email: 'demo@example.com' }, storage);
  const personaAfterLogin = getActivePersona(storage);
  const state = getAuthState(storage);
  const targetRoute = personaAfterLogin ? '/dashboard' : '/persona';

  assert(
    personaAfterLogin === null &&
    state === AUTH_STATES.AUTHENTICATED_NO_PERSONA &&
    targetRoute === '/persona',
    'Test G — Login without persona',
    `Persona: ${personaAfterLogin}, state: ${state}, targetRoute: ${targetRoute}`
  );
}

// Test H — Persona cannot authenticate
{
  const storage = new MockLocalStorage();
  storage.setItem(AUTH_KEYS.ACTIVE_PERSONA, 'health');
  storage.removeItem(AUTH_KEYS.IS_LOGGED_IN);

  const state = getAuthState(storage);
  const route = resolveRoute('/', storage);

  assert(
    state === AUTH_STATES.LOGGED_OUT && route.render === 'Landing',
    'Test H — Persona cannot authenticate',
    `State with only persona: ${state}, route: ${JSON.stringify(route)}`
  );
}

// Test I — Logout
{
  const storage = new MockLocalStorage();
  storage.setItem(AUTH_KEYS.IS_LOGGED_IN, 'true');
  storage.setItem(AUTH_KEYS.ACTIVE_PERSONA, 'health');
  storage.setItem(AUTH_KEYS.USER_NAME, 'Demo User');
  storage.setItem(AUTH_KEYS.USER_EMAIL, 'demo@example.com');
  // Store unrelated mock data to ensure localStorage.clear() is NOT called
  storage.setItem('unrelated_theme_preference', 'dark');

  // Perform logout
  clearSession(storage);

  const isAuthAfterLogout = storage.getItem(AUTH_KEYS.IS_LOGGED_IN);
  const personaAfterLogout = storage.getItem(AUTH_KEYS.ACTIVE_PERSONA);
  const nameAfterLogout = storage.getItem(AUTH_KEYS.USER_NAME);
  const emailAfterLogout = storage.getItem(AUTH_KEYS.USER_EMAIL);
  const unrelatedPreserved = storage.getItem('unrelated_theme_preference') === 'dark';
  const stateAfterLogout = getAuthState(storage);
  const routeAfterLogout = resolveRoute('/', storage);

  assert(
    isAuthAfterLogout === null &&
    personaAfterLogout === null &&
    nameAfterLogout === null &&
    emailAfterLogout === null &&
    unrelatedPreserved === true &&
    stateAfterLogout === AUTH_STATES.LOGGED_OUT &&
    routeAfterLogout.render === 'Landing',
    'Test I — Logout',
    `Keys removed properly, unrelated data preserved: ${unrelatedPreserved}`
  );
}

// Test J — Protected dashboard
{
  const storage = new MockLocalStorage();
  storage.removeItem(AUTH_KEYS.IS_LOGGED_IN);

  const route = resolveRoute('/dashboard', storage);
  assert(
    route.redirect === '/',
    'Test J — Protected dashboard',
    `Logged out user accessing /dashboard redirected to: ${JSON.stringify(route)}`
  );
}

// Test K — Protected persona
{
  const storage = new MockLocalStorage();
  storage.setItem(AUTH_KEYS.IS_LOGGED_IN, 'true');
  storage.setItem(AUTH_KEYS.ACTIVE_PERSONA, 'health');

  const route = resolveRoute('/persona', storage);
  assert(
    route.redirect === '/dashboard',
    'Test K — Protected persona',
    `User with persona accessing /persona redirected to: ${JSON.stringify(route)}`
  );
}

console.log('\n=====================================================================');
if (allPassed) {
  console.log(' ALL 11 ACCEPTANCE TESTS PASSED (100% SUCCESS)');
} else {
  console.log(' SOME TESTS FAILED');
  process.exit(1);
}
console.log('=====================================================================\n');

import {
  normalizeNotification,
  getStoredNotifications,
  ingestNotification,
  markAsRead,
  markAllAsRead,
  dismissNotification,
} from './src/services/notificationAdapter.js';

import { evaluateProactiveAlerts } from './src/services/alertService.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

class MockStorage {
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

console.log('====================================================');
console.log('MAUSAM SIH26076 — NOTIFICATION ADAPTER TEST (PART 12)');
console.log('====================================================\n');

const storage = new MockStorage();

console.log('TEST GROUP 1: Canonical Notification Contract');
const rawBackendAlert = {
  id: 'be-alert-99',
  type: 'COMMUTER_HAZARD',
  severity: 'CRITICAL',
  description: 'Waterlogging reported on NH-48 corridor.',
  timestamp_epoch: 1726000000000,
};
const normalized = normalizeNotification(rawBackendAlert);
assert(normalized.id === 'be-alert-99', 'ID preserved');
assert(normalized.severity === 'SEVERE', `CRITICAL mapped to SEVERE: got ${normalized.severity}`);
assert(normalized.message === 'Waterlogging reported on NH-48 corridor.', 'Message extracted from description');
assert(normalized.targetAnchor === '#tour-indices-section', 'Contextual anchor resolved to indices section');
assert(normalized.rawPayload === rawBackendAlert, 'Original backend payload preserved in rawPayload');

console.log('\nTEST GROUP 2: Storage & Unread Badge Count');
const initial = getStoredNotifications(storage);
assert(Array.isArray(initial) && initial.length >= 2, `Initial seed notifications loaded: count ${initial.length}`);
const unreadInitial = initial.filter(n => !n.read && !n.dismissed).length;
assert(unreadInitial >= 1, `Unread count accurately computed: ${unreadInitial}`);

console.log('\nTEST GROUP 3: Ingestion, Cooldown & Duplicate Suppression');
const newAlert = {
  id: 'notif-fresh-1',
  type: 'FITNESS_HEAT',
  severity: 'WARNING',
  title: 'Heat stress warning',
  message: 'Midday heat index is 38°C.',
};
const ingestRes1 = ingestNotification(newAlert, storage, 5000);
assert(ingestRes1.accepted === true, 'Fresh notification accepted');

const repeatAlert = {
  id: 'notif-fresh-2',
  type: 'FITNESS_HEAT',
  severity: 'WARNING',
  title: 'Heat stress warning (repeat)',
  message: 'Midday heat index is 38°C.',
};
const ingestRes2 = ingestNotification(repeatAlert, storage, 5000);
assert(ingestRes2.accepted === false && ingestRes2.reason === 'COOLDOWN_ACTIVE', 'Cooldown suppressed repeat notification within window');

const ingestRes3 = ingestNotification(newAlert, storage, 0); // 0ms cooldown to test deduplication
assert(ingestRes3.accepted === false && ingestRes3.reason === 'DUPLICATE_SUPPRESSED', 'Duplicate alert suppressed by deduplication filter');

console.log('\nTEST GROUP 4: Read / Unread State Transitions');
const afterRead = markAsRead('seed-notif-1', storage);
const targetNotif = afterRead.find(n => n.id === 'seed-notif-1');
assert(targetNotif.read === true, 'Target notification marked as read');

const allRead = markAllAsRead(storage);
const remainingUnread = allRead.filter(n => !n.read && !n.dismissed).length;
assert(remainingUnread === 0, 'Mark all read resets unread count to 0');

console.log('\nTEST GROUP 5: Dismissal Flow');
const activeBeforeDismiss = getStoredNotifications(storage).filter(n => !n.dismissed).length;
const afterDismiss = dismissNotification('seed-notif-1', storage);
assert(afterDismiss.length === activeBeforeDismiss - 1, `Dismiss removed alert from active list: ${afterDismiss.length}`);
assert(!afterDismiss.some(n => n.id === 'seed-notif-1'), 'Dismissed alert excluded from active list');

console.log('\nTEST GROUP 6: Persona-Relevant Alert Generation');
const storage2 = new MockStorage();

const fitnessAlerts = evaluateProactiveAlerts({
  persona: 'fitness',
  rainProbability: 80,
  storage: storage2,
});
assert(fitnessAlerts.some(a => a.type === 'FITNESS_RAIN'), 'Fitness rain alert generated when rain >= 70%');

const commuterAlerts = evaluateProactiveAlerts({
  persona: 'commuter',
  rainProbability: 75,
  visibility: 2.0,
  storage: storage2,
});
assert(commuterAlerts.some(a => a.type === 'COMMUTER_HAZARD'), 'Commuter hazard alert generated on low visibility/rain');

const healthAlerts = evaluateProactiveAlerts({
  persona: 'health',
  aqi: 220,
  storage: storage2,
});
assert(healthAlerts.some(a => a.type === 'HEALTH_AQI'), 'Health AQI alert generated when AQI >= 150');

console.log('\n====================================================');
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL FRONTEND ALERT INTEGRATION TESTS PASSED! ✓\n');
  process.exit(0);
}

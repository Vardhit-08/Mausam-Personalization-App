/**
 * notificationAdapter.js
 * 
 * Frontend Notification Adapter & State Layer for SIH26076 Mausam (Part 12).
 * 
 * Architecture:
 * Backend Source / Demo Source
 *         ↓
 * Frontend Notification Adapter (Normalizes raw payloads into canonical contract)
 *         ↓
 * Frontend Notification State & Fatigue Filter (Deduplication, Cooldown, Read/Dismiss)
 *         ↓
 * Notification Center Component
 *         ↓
 * UI
 * 
 * Note: FRONTEND ONLY. When backend alert streaming/API is wired, it plugs
 * directly into this adapter without any UI changes.
 */

const STORAGE_KEY_NOTIFICATIONS = 'mausam_notifications_cache';
const STORAGE_KEY_COOLDOWNS = 'mausam_notifications_cooldowns';
export const DEFAULT_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Normalizes raw backend or mock alerts into the standard Frontend Notification Contract
 */
export function normalizeNotification(raw) {
  if (!raw) return null;

  const now = Date.now();
  const createdAt = typeof raw.createdAt === 'number' ? raw.createdAt : (raw.timestamp_epoch || now);

  // Normalize severity
  let severity = 'INFO';
  const rawSev = String(raw.severity || '').toUpperCase();
  if (rawSev === 'SEVERE' || rawSev === 'EMERGENCY' || rawSev === 'CRITICAL') {
    severity = 'SEVERE';
  } else if (rawSev === 'WARNING' || rawSev === 'ALERT' || rawSev === 'MODERATE') {
    severity = 'WARNING';
  }

  // Determine contextual navigation anchor
  let targetAnchor = '#tour-insight-card';
  const type = String(raw.type || '').toUpperCase();
  if (type.includes('COMMUTE') || type.includes('ROAD') || type.includes('TRANSIT')) {
    targetAnchor = '#tour-indices-section';
  } else if (type.includes('AQI') || type.includes('POLLEN') || type.includes('HEALTH')) {
    targetAnchor = '#tour-indices-section';
  } else if (type.includes('TIMELINE') || type.includes('HOUR')) {
    targetAnchor = '#tour-timeline-section';
  }

  return {
    id: String(raw.id || `notif-${now}-${Math.random().toString(36).slice(2, 7)}`),
    type: raw.type || 'GENERAL_WEATHER',
    title: raw.title || 'Weather Bulletin',
    message: raw.message || raw.description || 'Weather condition update.',
    severity,
    category: raw.category || (severity === 'SEVERE' ? 'Severe Advisory' : severity === 'WARNING' ? 'Weather Warning' : 'Public Notice'),
    targetAnchor,
    actionLabel: raw.actionLabel || 'View Affected Indicator',
    timestamp: raw.timestamp || formatTimeAgo(createdAt),
    createdAt,
    read: Boolean(raw.read),
    dismissed: Boolean(raw.dismissed),
    rawPayload: raw, // Preserves original backend contract
  };
}

/**
 * Formats relative time (e.g., "Just now", "15m ago", "1h ago")
 */
function formatTimeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  if (diff < 60 * 1000) return 'Just now';
  const mins = Math.floor(diff / (60 * 1000));
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/**
 * Retrieve notifications from storage with fallback to initial seed advisories
 */
export function getStoredNotifications(storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  if (!storage) return getInitialSeedNotifications();

  try {
    const raw = storage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(normalizeNotification).filter(Boolean);
      }
    }
  } catch (e) {
    console.warn('Failed to parse notifications from storage', e);
  }

  const seed = getInitialSeedNotifications();
  saveStoredNotifications(seed, storage);
  return seed;
}

/**
 * Initial canonical seed notifications
 */
export function getInitialSeedNotifications() {
  const now = Date.now();
  return [
    normalizeNotification({
      id: 'seed-notif-1',
      type: 'HEALTH_AQI',
      severity: 'WARNING',
      title: 'AQI surged above 160 threshold',
      message: 'Air quality in your station has reached unhealthy levels for sensitive individuals and cardio workouts.',
      actionLabel: 'Check Air Quality',
      timestamp: '25 min ago',
      createdAt: now - 25 * 60 * 1000,
      read: false,
      dismissed: false,
    }),
    normalizeNotification({
      id: 'seed-notif-2',
      type: 'COMMUTER_HAZARD',
      severity: 'INFO',
      title: 'Highway visibility advisory',
      message: 'Morning mist and haze has reduced visibility to 2.8 km along major transit corridors.',
      actionLabel: 'View Commute Risk',
      timestamp: '1 hr ago',
      createdAt: now - 60 * 60 * 1000,
      read: true,
      dismissed: false,
    }),
  ];
}

/**
 * Save notifications list to storage
 */
export function saveStoredNotifications(list, storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(list));
  } catch (e) {
    console.warn('Failed to save notifications', e);
  }
}

/**
 * Retrieve cooldown map
 */
export function getCooldowns(storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  if (!storage) return {};
  try {
    const raw = storage.getItem(STORAGE_KEY_COOLDOWNS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Save cooldown map
 */
export function saveCooldowns(cooldowns, storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY_COOLDOWNS, JSON.stringify(cooldowns));
  } catch (e) {
    console.warn('Failed to save cooldowns', e);
  }
}

/**
 * Ingests a new proactive notification with fatigue protection (cooldown & deduplication)
 */
export function ingestNotification(rawItem, storage = (typeof window !== 'undefined' ? window.localStorage : null), cooldownMs = DEFAULT_COOLDOWN_MS) {
  const item = normalizeNotification(rawItem);
  if (!item) return { accepted: false, reason: 'INVALID_PAYLOAD' };

  const currentList = getStoredNotifications(storage);
  const cooldowns = getCooldowns(storage);
  const now = Date.now();

  const lastDispatched = cooldowns[item.type] || 0;
  if (now - lastDispatched < cooldownMs) {
    return { accepted: false, reason: 'COOLDOWN_ACTIVE', remainingMs: cooldownMs - (now - lastDispatched) };
  }

  // Deduplication check: check if an identical unread notification exists
  const isDuplicate = currentList.some((n) => n.id === item.id || (n.type === item.type && !n.dismissed && now - n.createdAt < cooldownMs));
  if (isDuplicate) {
    return { accepted: false, reason: 'DUPLICATE_SUPPRESSED' };
  }

  // Update cooldown and prepend new alert
  cooldowns[item.type] = now;
  saveCooldowns(cooldowns, storage);

  const updatedList = [item, ...currentList];
  saveStoredNotifications(updatedList, storage);

  return { accepted: true, notification: item, list: updatedList };
}

/**
 * Mark a notification as read
 */
export function markAsRead(id, storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  const list = getStoredNotifications(storage).map((n) => (n.id === id ? { ...n, read: true } : n));
  saveStoredNotifications(list, storage);
  return list;
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead(storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  const list = getStoredNotifications(storage).map((n) => ({ ...n, read: true }));
  saveStoredNotifications(list, storage);
  return list;
}

/**
 * Dismiss a notification
 */
export function dismissNotification(id, storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  const list = getStoredNotifications(storage).map((n) => (n.id === id ? { ...n, dismissed: true } : n));
  saveStoredNotifications(list, storage);
  return list.filter((n) => !n.dismissed);
}

/**
 * Clear all notifications (for demo resets)
 */
export function clearAllNotifications(storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  if (storage) {
    storage.removeItem(STORAGE_KEY_NOTIFICATIONS);
    storage.removeItem(STORAGE_KEY_COOLDOWNS);
  }
}

/**
 * alertService.js
 * 
 * Context-aware weather alert generator and fatigue protection layer for SIH26076 Mausam (Part 12).
 * Integrates with frontend notificationAdapter for clean separation of concerns.
 */

import {
  ingestNotification,
  getStoredNotifications,
  markAsRead,
  markAllAsRead,
  dismissNotification,
  DEFAULT_COOLDOWN_MS,
} from './notificationAdapter.js';

export {
  getStoredNotifications,
  markAsRead,
  markAllAsRead,
  dismissNotification,
};

// Backwards compatibility aliases
export const markNotificationAsRead = markAsRead;
export const markAllNotificationsAsRead = markAllAsRead;

/**
 * Generates proactive context-aware alert based on persona & weather shifts
 */
export function evaluateProactiveAlerts({
  persona = 'fitness',
  rainProbability = 30,
  aqi = 100,
  visibility = 5,
  isStorm = false,
  destination = 'London',
  storage = (typeof window !== 'undefined' ? window.localStorage : null),
}) {
  const alertsToDispatch = [];
  const now = Date.now();

  // 1. Fitness Rain Alert
  if (persona === 'fitness' && rainProbability >= 70) {
    alertsToDispatch.push({
      id: `alert-fitness-rain-${Math.floor(now / DEFAULT_COOLDOWN_MS)}`,
      type: 'FITNESS_RAIN',
      severity: 'WARNING',
      icon: '🌧️',
      title: 'Rain approaching your location',
      message: 'Rain is expected near your running corridor within the next 30 minutes. Outdoor workout conditions may be disrupted.',
      actionLabel: 'View Workout Details',
      timestamp: 'Just now',
      persona: 'fitness',
      targetAnchor: '#tour-insight-card',
    });
  }

  // 2. Commuter Hazard Alert
  if (persona === 'commuter' && (rainProbability >= 65 || visibility < 3.0 || isStorm)) {
    alertsToDispatch.push({
      id: `alert-commuter-hazard-${Math.floor(now / DEFAULT_COOLDOWN_MS)}`,
      type: 'COMMUTER_HAZARD',
      severity: 'SEVERE',
      icon: '🚗',
      title: 'Commute weather hazard developing',
      message: isStorm
        ? 'Heavy thunderstorm with gusty winds and low visibility along highway corridor.'
        : `Reduced visibility (${visibility} km) and slick asphalt. Allow 20–30 mins extra travel time.`,
      actionLabel: 'Check Commute Risk',
      timestamp: 'Just now',
      persona: 'commuter',
      targetAnchor: '#tour-indices-section',
    });
  }

  // 3. Traveler Destination Alert
  if (persona === 'traveler' && (rainProbability >= 60 || isStorm)) {
    alertsToDispatch.push({
      id: `alert-traveler-dest-${Math.floor(now / DEFAULT_COOLDOWN_MS)}`,
      type: 'TRAVELER_DEST',
      severity: 'WARNING',
      icon: '⚠',
      title: `Destination weather changed: ${destination}`,
      message: `Severe precipitation is now forecasted at your saved destination (${destination}). Pack appropriate rain protection.`,
      actionLabel: 'View Destination Details',
      timestamp: 'Just now',
      persona: 'traveler',
      targetAnchor: '#tour-indices-section',
    });
  }

  // 4. Health Air Quality Alert
  if (persona === 'health' && aqi >= 150) {
    alertsToDispatch.push({
      id: `alert-health-aqi-${Math.floor(now / DEFAULT_COOLDOWN_MS)}`,
      type: 'HEALTH_AQI',
      severity: 'SEVERE',
      icon: '🌿',
      title: 'Air quality index deteriorated',
      message: `AQI has surged to ${aqi} (Unhealthy). Asthmatic and vulnerable demographics should restrict outdoor activity.`,
      actionLabel: 'View Respiratory Advisory',
      timestamp: 'Just now',
      persona: 'health',
      targetAnchor: '#tour-indices-section',
    });
  }

  // 5. Agriculture Spray / Rain Alert
  if (persona === 'agriculture' && (rainProbability >= 60 || isStorm)) {
    alertsToDispatch.push({
      id: `alert-agri-spray-${Math.floor(now / DEFAULT_COOLDOWN_MS)}`,
      type: 'AGRI_SPRAY_HAZARD',
      severity: 'WARNING',
      icon: '🌾',
      title: 'Chemical spray window closed',
      message: 'Imminent rainfall will cause agrochemical washoff. Postpone foliar spraying operations.',
      actionLabel: 'View Field Advisory',
      timestamp: 'Just now',
      persona: 'agriculture',
      targetAnchor: '#tour-indices-section',
    });
  }

  // Ingest each alert through notificationAdapter
  alertsToDispatch.forEach((alert) => {
    ingestNotification(alert, storage);
  });

  return getStoredNotifications(storage).filter((n) => !n.dismissed);
}

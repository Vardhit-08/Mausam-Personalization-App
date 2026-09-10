import { PERSONAS, PERSONA_ALIASES } from '../config/constants.js';

/**
 * Calculates the great-circle distance between two geographic points using Haversine formula in kilometers.
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Finds the nearest IMD station from a list of stations.
 */
export function findNearestStation(lat, lon, stations) {
  if (!stations || stations.length === 0) return null;
  let nearest = null;
  let minDistance = Infinity;

  for (const station of stations) {
    const dist = calculateDistance(lat, lon, station.latitude, station.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = { ...station, distanceKm: Math.round(dist * 10) / 10 };
    }
  }

  return nearest;
}

/**
 * Calculates Heat Index in Celsius based on temperature (°C) and relative humidity (%).
 * Uses the Steadman/Rothfusz Heat Index regression formula.
 */
export function calculateHeatIndex(tempC, humidity) {
  const T = (tempC * 9) / 5 + 32; // convert to Fahrenheit
  const R = humidity;

  // Simple Heat Index approximation
  let HI = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (R * 0.094));

  if (HI >= 80) {
    HI =
      -42.379 +
      2.04901523 * T +
      10.14333127 * R -
      0.22475541 * T * R -
      0.00683783 * T * T -
      0.05481717 * R * R +
      0.00122874 * T * T * R +
      0.00085282 * T * R * R -
      0.00000199 * T * T * R * R;
  }

  // Convert back to Celsius
  const heatIndexC = ((HI - 32) * 5) / 9;
  return Math.round(heatIndexC * 10) / 10;
}

/**
 * Normalizes persona name input to canonical persona constant
 */
export function normalizePersona(persona) {
  if (!persona) return PERSONAS.STUDENT;
  const cleaned = String(persona).trim().toLowerCase().replace(/-/g, '_');
  return PERSONA_ALIASES[cleaned] || PERSONAS.STUDENT;
}


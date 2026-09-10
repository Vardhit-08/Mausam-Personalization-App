import { ALERT_TYPES, SEVERITY_LEVELS } from '../config/constants.js';

/**
 * Alert Detection Layer
 * Evaluates NormalizedWeather data against modular thresholds to determine
 * whether a significant weather event has occurred.
 */
export class AlertService {
  /**
   * Modular threshold configurations for the prototype
   */
  static THRESHOLDS = {
    HEAVY_RAINFALL_MM: 15.0,
    EXTREME_HEAT_TEMP_C: 39.0,
    COLDWAVE_TEMP_C: 6.0,
    HIGH_AQI: 180,
    DENSE_FOG_VISIBILITY_KM: 1.0,
    STRONG_WIND_KMH: 35.0,
    SEVERE_WEATHER_CODES: [95, 96, 99], // Thunderstorms, squalls, hail
  };

  /**
   * Detects whether the normalized weather metrics represent a significant alert
   * @param {Object} normalized - NormalizedWeather object
   * @returns {Object} Alert detection result
   */
  static detectAlert(normalized) {
    if (!normalized) {
      return { isSignificant: false, reason: 'No weather data provided' };
    }

    const {
      rainfall,
      temperature,
      aqi,
      visibility,
      windSpeed,
      weatherCode,
      weatherCondition,
      location,
    } = normalized;

    const detectedAlerts = [];

    // 1. Heavy Rainfall Detection
    if (rainfall >= this.THRESHOLDS.HEAVY_RAINFALL_MM || weatherCondition.toLowerCase().includes('heavy rain')) {
      detectedAlerts.push({
        type: ALERT_TYPES.HEAVY_RAINFALL,
        severity: rainfall >= 30 ? SEVERITY_LEVELS.SEVERE : SEVERITY_LEVELS.HIGH,
        title: `Heavy Rain Alert for ${location.city}`,
        description: `Precipitation reached ${rainfall} mm. Waterlogging and slick roads expected.`,
        metric: `${rainfall} mm`,
      });
    }

    // 2. Severe Storm Detection
    if (this.THRESHOLDS.SEVERE_WEATHER_CODES.includes(weatherCode)) {
      detectedAlerts.push({
        type: ALERT_TYPES.SEVERE_WEATHER,
        severity: SEVERITY_LEVELS.SEVERE,
        title: `Severe Thunderstorm Warning for ${location.city}`,
        description: `Active convective storm with lightning and heavy rain reported in ${location.city}.`,
        metric: `Code ${weatherCode}`,
      });
    }

    // 3. High AQI Detection
    if (aqi >= this.THRESHOLDS.HIGH_AQI) {
      detectedAlerts.push({
        type: ALERT_TYPES.HIGH_AQI,
        severity: aqi >= 250 ? SEVERITY_LEVELS.SEVERE : SEVERITY_LEVELS.HIGH,
        title: `Unhealthy Air Quality Alert for ${location.city}`,
        description: `Air Quality Index spiked to ${aqi}. Elevated particulate concentration.`,
        metric: `AQI ${aqi}`,
      });
    }

    // 4. Extreme Heatwave Detection
    if (temperature >= this.THRESHOLDS.EXTREME_HEAT_TEMP_C) {
      detectedAlerts.push({
        type: ALERT_TYPES.EXTREME_HEAT,
        severity: SEVERITY_LEVELS.HIGH,
        title: `Heatwave Warning for ${location.city}`,
        description: `Ambient temperature reached ${temperature}°C. High heat stress risks.`,
        metric: `${temperature}°C`,
      });
    }

    // 5. Coldwave Detection
    if (temperature <= this.THRESHOLDS.COLDWAVE_TEMP_C) {
      detectedAlerts.push({
        type: ALERT_TYPES.COLDWAVE,
        severity: SEVERITY_LEVELS.HIGH,
        title: `Coldwave Alert for ${location.city}`,
        description: `Temperature dipped to ${temperature}°C. Frost conditions possible.`,
        metric: `${temperature}°C`,
      });
    }

    // 6. Dense Fog Detection
    if (visibility <= this.THRESHOLDS.DENSE_FOG_VISIBILITY_KM) {
      detectedAlerts.push({
        type: ALERT_TYPES.DENSE_FOG,
        severity: SEVERITY_LEVELS.HIGH,
        title: `Dense Fog Advisory for ${location.city}`,
        description: `Visibility reduced to ${visibility} km. Severe transit delays likely.`,
        metric: `${visibility} km`,
      });
    }

    // 7. Strong Wind Detection
    if (windSpeed >= this.THRESHOLDS.STRONG_WIND_KMH) {
      detectedAlerts.push({
        type: ALERT_TYPES.STRONG_WIND,
        severity: SEVERITY_LEVELS.MODERATE,
        title: `High Wind Gust Advisory for ${location.city}`,
        description: `Sustained wind velocity of ${windSpeed} km/h recorded.`,
        metric: `${windSpeed} km/h`,
      });
    }

    // Check significance
    if (detectedAlerts.length === 0) {
      return {
        isSignificant: false,
        reason: 'Weather conditions are within normal limits. No alert triggered.',
        location,
      };
    }

    // Sort by severity (SEVERE > HIGH > MODERATE)
    const severityOrder = { SEVERE: 3, HIGH: 2, MODERATE: 1, LOW: 0 };
    detectedAlerts.sort((a, b) => (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0));

    const primary = detectedAlerts[0];

    return {
      isSignificant: true,
      primaryAlert: primary,
      allAlerts: detectedAlerts,
      location,
      weatherSnapshot: {
        temperature,
        rainfall,
        aqi,
        visibility,
        weatherCondition,
      },
      detectedAt: new Date().toISOString(),
    };
  }
}


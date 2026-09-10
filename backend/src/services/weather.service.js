import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { NormalizationService } from './normalization.service.js';
import { calculateDistance } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mockWeatherPath = path.resolve(__dirname, '../data/mock_weather.json');

class WeatherProvider {
  /**
   * Fetches raw weather data from the active provider.
   * Default: Mock JSON provider (swappable with IMD API provider in the future).
   */
  async fetchRaw(lat, lon) {
    throw new Error('WeatherProvider.fetchRaw must be implemented');
  }
}

class MockJsonWeatherProvider extends WeatherProvider {
  constructor() {
    super();
    this.dataset = null;
    this.loadData();
  }

  loadData() {
    try {
      this.dataset = JSON.parse(fs.readFileSync(mockWeatherPath, 'utf8'));
    } catch (err) {
      logger.error('Failed to load mock weather data:', err.message);
      this.dataset = { cities: [], default: {} };
    }
  }

  async fetchRaw(lat, lon) {
    if (!this.dataset) this.loadData();

    const targetLat = Number(lat);
    const targetLon = Number(lon);

    // Find closest city in mock dataset
    const cities = this.dataset.cities || [];
    let closestCity = null;
    let minDistance = Infinity;

    for (const item of cities) {
      const dist = calculateDistance(targetLat, targetLon, item.latitude, item.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        closestCity = item;
      }
    }

    // If within reasonable radius (~200km), return matched city, else default mock
    if (closestCity && minDistance < 300) {
      return { ...closestCity, distanceKm: Math.round(minDistance) };
    }

    return this.dataset.default || cities[0] || {
      city: 'Delhi Region',
      latitude: targetLat,
      longitude: targetLon,
      current: { temperature: 28, humidity: 65, precipitation_mm: 5 }
    };
  }
}

/**
 * Future IMD API Provider stub
 * When IMD API credentials and endpoints are available, this provider can be toggled on
 * without changing the Normalization, Persona, or Notification layers.
 */
class ImdApiWeatherProvider extends WeatherProvider {
  async fetchRaw(lat, lon) {
    // Future implementation: axios.get(`${config.apis.imdBaseUrl}/weather...`)
    throw new Error('IMD API provider is not yet configured. Using Mock JSON provider.');
  }
}

export class WeatherService {
  static provider = new MockJsonWeatherProvider();

  /**
   * Pluggable provider setter to swap between Mock JSON and IMD API
   */
  static setProvider(providerInstance) {
    this.provider = providerInstance;
    logger.info(`[WeatherService] Switched provider to: ${providerInstance.constructor.name}`);
  }

  /**
   * Core entry point for retrieving weather data across the entire system.
   * Retrieves raw data from provider, normalizes it, and returns NormalizedWeather.
   * @param {number|string} lat - Latitude
   * @param {number|string} lon - Longitude
   * @returns {Promise<Object>} NormalizedWeather object
   */
  static async getNormalizedWeather(lat, lon) {
    try {
      const rawData = await this.provider.fetchRaw(lat, lon);
      const normalized = NormalizationService.normalize(rawData, { lat, lon });
      return normalized;
    } catch (error) {
      logger.error('[WeatherService] Error fetching weather:', error.message);
      // Fallback normalization
      return NormalizationService.normalize({
        city: 'Offline Fallback',
        latitude: lat,
        longitude: lon,
        current: { temperature: 26, humidity: 60, precipitation_mm: 0 }
      }, { lat, lon });
    }
  }
}

import { cache } from '../config/cache.js';
import { CACHE_KEYS, CACHE_TTL, PERSONAS, CARD_TYPES } from '../config/constants.js';
import { WeatherService } from './weather.service.js';
import { ScoringService } from './scoring.service.js';
import { normalizePersona } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';

export class AggregatorService {
  /**
   * Retrieves dashboard weather data tailored to persona from NormalizedWeather
   * Endpoint: /api/v1/weather/dashboard
   */
  static async getDashboardData(lat, lon, rawPersona) {
    const persona = normalizePersona(rawPersona);
    const cacheKey = CACHE_KEYS.WEATHER_DASHBOARD(lat, lon, persona);

    const cached = await cache.get(cacheKey);
    if (cached) {
      return { source: 'cache', data: cached };
    }

    try {
      // 1. Fetch normalized weather from WeatherService (abstracted source)
      const normalized = await WeatherService.getNormalizedWeather(lat, lon);

      // 2. Score persona-specific metrics
      let personaMetrics = null;
      switch (persona) {
        case PERSONAS.FARMER:
          personaMetrics = ScoringService.scoreFarmer(normalized);
          break;
        case PERSONAS.TOURIST:
          personaMetrics = ScoringService.scoreTourist(normalized);
          break;
        case PERSONAS.STUDENT:
          personaMetrics = ScoringService.scoreStudent(normalized);
          break;
        case PERSONAS.PARENT:
          personaMetrics = ScoringService.scoreParent(normalized);
          break;
        default:
          personaMetrics = ScoringService.scoreStudent(normalized);
          break;
      }

      const payload = {
        normalizedWeather: normalized,
        persona,
        personaMetrics,
        comfort: ScoringService.computeComfortIndex(normalized.temperature, normalized.humidity),
        timestamp: new Date().toISOString(),
      };

      await cache.set(cacheKey, payload, CACHE_TTL.WEATHER_DATA);
      return { source: 'api', data: payload };
    } catch (error) {
      logger.error('Aggregator Dashboard Error:', error.message);
      throw error;
    }
  }

  /**
   * Generates the structured decision-layer response with composite score cards and plain-language summary
   * Endpoint: GET /api/v1/personalized-home
   */
  static async getPersonalizedHome(lat, lon, rawPersona, userId = 'usr_guest') {
    const persona = normalizePersona(rawPersona);
    const homeCacheKey = CACHE_KEYS.PERSONALIZED_HOME(userId, `${lat}_${lon}_${persona}`);

    const cached = await cache.get(homeCacheKey);
    if (cached) {
      return { source: 'cache', ...cached };
    }

    // 1. Retrieve normalized weather
    const normalized = await WeatherService.getNormalizedWeather(lat, lon);
    const comfort = ScoringService.computeComfortIndex(normalized.temperature, normalized.humidity);

    const cards = [];
    let naturalLanguageSummary = '';

    // Card 1: Overview Weather Card
    cards.push({
      card_type: CARD_TYPES.CURRENT_WEATHER_CARD,
      priority: 1,
      title: `${normalized.location.city} Weather Overview`,
      data: {
        city: normalized.location.city,
        temperature_c: normalized.temperature,
        feels_like_c: normalized.feelsLike,
        condition: normalized.weatherCondition,
        rainfall_mm: normalized.rainfall,
        humidity_percent: normalized.humidity,
        wind_speed_kmh: normalized.windSpeed,
        aqi: normalized.aqi,
      },
    });

    // Card 2: Persona-Specific Decision Card
    switch (persona) {
      case PERSONAS.FARMER: {
        const farmData = ScoringService.scoreFarmer(normalized);
        cards.push({
          card_type: CARD_TYPES.FARM_ADVISORY_CARD,
          priority: 2,
          title: 'Agromet Crop & Soil Guidance',
          data: farmData,
        });

        naturalLanguageSummary = `Soil moisture is ${farmData.soil_moisture_status.toLowerCase()} (${farmData.soil_moisture_m3} m³/m³). ${farmData.irrigation_recommendation}`;
        break;
      }

      case PERSONAS.TOURIST: {
        const touristData = ScoringService.scoreTourist(normalized);
        cards.push({
          card_type: CARD_TYPES.TOURIST_SIGHTSEEING_CARD,
          priority: 2,
          title: 'Tourist Sightseeing & Comfort Guide',
          data: touristData,
        });

        naturalLanguageSummary = `${touristData.travel_advice} Current conditions are ${touristData.comfort_category.toLowerCase()} with ${normalized.temperature}°C.`;
        break;
      }

      case PERSONAS.STUDENT: {
        const studentData = ScoringService.scoreStudent(normalized);
        cards.push({
          card_type: CARD_TYPES.STUDENT_COMMUTE_CARD,
          priority: 2,
          title: 'Campus & Commute Advisory',
          data: studentData,
        });

        naturalLanguageSummary = `${studentData.study_activity_advice} Gear recommendation: ${studentData.rain_protection_required}.`;
        break;
      }

      case PERSONAS.PARENT: {
        const parentData = ScoringService.scoreParent(normalized);
        cards.push({
          card_type: CARD_TYPES.PARENT_SAFETY_CARD,
          priority: 2,
          title: 'Child Outdoor Safety & School Commute',
          data: parentData,
        });

        naturalLanguageSummary = `School commute status: ${parentData.school_commute_status}. ${parentData.health_notice}`;
        break;
      }

      default:
        break;
    }

    // Card 3: Universal Comfort Index Card
    cards.push({
      card_type: CARD_TYPES.COMFORT_INDEX_CARD,
      priority: 3,
      title: 'Thermal Comfort Index',
      data: comfort,
    });

    const responsePayload = {
      user_id: userId,
      persona,
      location: normalized.location,
      natural_language_summary: naturalLanguageSummary,
      cards: cards.sort((a, b) => a.priority - b.priority),
      timestamp: new Date().toISOString(),
    };

    await cache.set(homeCacheKey, responsePayload, CACHE_TTL.PERSONALIZED_HOME);
    return { source: 'api', ...responsePayload };
  }
}

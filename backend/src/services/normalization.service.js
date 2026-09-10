/**
 * Weather Normalization Service
 * Converts raw weather data (from Mock JSON, Open-Meteo, or future IMD API)
 * into a stable, uniform NormalizedWeather structure consumed across the system.
 */
export class NormalizationService {
  /**
   * Normalizes raw weather payload from any data source into a standardized schema
   * @param {Object} rawData - Raw input from Mock JSON, IMD API, etc.
   * @param {Object} context - Optional location or station metadata
   * @returns {Object} NormalizedWeather object
   */
  static normalize(rawData, context = {}) {
    if (!rawData) {
      throw new Error('NormalizationService: rawData is required');
    }

    // 1. Extract location
    const location = {
      city: rawData.city || context.city || 'Unknown Station',
      latitude: Number(rawData.latitude || context.latitude || context.lat || 28.6139),
      longitude: Number(rawData.longitude || context.longitude || context.lon || 77.2090),
      stationCode: rawData.station_code || context.stationCode || 'DEFAULT',
    };

    // 2. Extract current metrics (handling mock schema or Open-Meteo style schema)
    const current = rawData.current || rawData.current_weather || {};
    const hourly = rawData.hourly || {};

    const temperature = Number(
      current.temperature ?? current.temperature_2m ?? rawData.temperature ?? 25.0
    );
    const feelsLike = Number(
      current.feels_like ?? current.apparent_temperature ?? (temperature + (current.humidity ? (current.humidity - 50) * 0.1 : 0))
    );
    const humidity = Number(
      current.humidity ?? hourly.relativehumidity_2m?.[0] ?? rawData.humidity ?? 55
    );
    const rainfall = Number(
      current.precipitation_mm ?? current.precipitation ?? hourly.precipitation?.[0] ?? 0.0
    );
    const windSpeed = Number(
      current.wind_speed_kmh ?? current.windspeed ?? 10.0
    );
    const weatherCode = Number(
      current.weather_code ?? current.weathercode ?? 0
    );
    const visibility = Number(
      current.visibility_km ?? (current.visibility ? current.visibility / 1000 : 10.0)
    );
    const aqi = Number(
      current.aqi ?? rawData.current_aqi ?? hourly.european_aqi?.[0] ?? 75
    );
    const uvIndex = Number(
      current.uv_index ?? hourly.uv_index?.[0] ?? 5.0
    );
    const soilMoisture = Number(
      current.soil_moisture_m3 ?? hourly.soil_moisture_0_to_1cm?.[0] ?? 0.25
    );
    const soilTemperature = Number(
      current.soil_temperature_c ?? hourly.soil_temperature_0cm?.[0] ?? temperature
    );

    // Weather condition text
    const weatherCondition = current.condition || this.mapWeatherCodeToCondition(weatherCode);

    return {
      location,
      temperature: Math.round(temperature * 10) / 10,
      feelsLike: Math.round(feelsLike * 10) / 10,
      humidity: Math.round(humidity),
      rainfall: Math.round(rainfall * 10) / 10,
      windSpeed: Math.round(windSpeed * 10) / 10,
      weatherCondition,
      weatherCode,
      visibility: Math.round(visibility * 10) / 10,
      aqi: Math.round(aqi),
      uvIndex: Math.round(uvIndex * 10) / 10,
      soilMoisture: Math.round(soilMoisture * 100) / 100,
      soilTemperature: Math.round(soilTemperature * 10) / 10,
      hourly: Array.isArray(rawData.hourly) ? rawData.hourly : [],
      timestamp: rawData.timestamp || new Date().toISOString(),
    };
  }

  /**
   * Helper to map standard WMO weather codes to human-readable conditions
   */
  static mapWeatherCodeToCondition(code) {
    if ([95, 96, 99].includes(code)) return 'Thunderstorm';
    if ([71, 73, 75, 77].includes(code)) return 'Snowfall';
    if ([65, 82].includes(code)) return 'Heavy Rain';
    if ([61, 63, 80, 81].includes(code)) return 'Rain Showers';
    if ([51, 53, 55].includes(code)) return 'Drizzle';
    if ([45, 48].includes(code)) return 'Dense Fog';
    if ([1, 2, 3].includes(code)) return 'Partly Cloudy';
    return 'Clear Sky';
  }
}


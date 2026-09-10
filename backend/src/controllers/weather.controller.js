import { AggregatorService } from '../services/aggregator.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class WeatherController {
  /**
   * Weather Aggregator Endpoint
   * Endpoint: GET /api/v1/weather/dashboard
   * Parameters: lat, lon, persona
   */
  static async getDashboard(req, res, next) {
    try {
      const { lat, lon, persona } = req.query;

      if (!lat || !lon || !persona) {
        return ApiResponse.error(res, 'Missing required parameters: lat, lon, persona', 400);
      }

      const result = await AggregatorService.getDashboardData(lat, lon, persona);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Decision Layer Personalized Homepage Endpoint
   * Endpoint: GET /api/v1/personalized-home
   * Parameters: lat, lon, persona (optional: userId from auth)
   */
  static async getPersonalizedHome(req, res, next) {
    try {
      const { lat = '28.6139', lon = '77.2090', persona = 'STUDENT' } = req.query;
      const userId = req.user?.uid || req.query.userId || 'usr_guest';

      const result = await AggregatorService.getPersonalizedHome(lat, lon, persona, userId);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
}


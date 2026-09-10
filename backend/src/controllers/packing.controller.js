import { WeatherService } from '../services/weather.service.js';
import { PackingService } from '../services/packing.service.js';
import { PackingModel } from '../models/packing.model.js';
import { ApiResponse } from '../utils/apiResponse.js';
import stations from '../data/static_stations.json' with { type: 'json' };

export class PackingController {
  static async generateChecklist(req, res, next) {
    try {
      const { destination, startDate, endDate, lat, lon, customItems = [] } = req.body;

      if (!destination) {
        return ApiResponse.error(res, 'Destination is required', 400);
      }

      let targetLat = lat;
      let targetLon = lon;

      // Find coordinates from destination name if not provided
      if (!targetLat || !targetLon) {
        const match = stations.find((s) =>
          s.city.toLowerCase().includes(destination.toLowerCase()) ||
          destination.toLowerCase().includes(s.city.toLowerCase())
        );
        if (match) {
          targetLat = match.latitude;
          targetLon = match.longitude;
        } else {
          // Default to New Delhi coordinates
          targetLat = 28.6139;
          targetLon = 77.2090;
        }
      }

      const forecast = await WeatherService.getExtendedForecast(targetLat, targetLon);
      const packingResult = PackingService.generatePackingList(forecast, destination);

      const userId = req.user?.uid || 'usr_guest';
      const checklistRecord = await PackingModel.create(userId, {
        destination,
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        generatedItems: packingResult.items.map((i) => i.item),
        customItems,
      });

      return ApiResponse.success(
        res,
        {
          ...checklistRecord,
          weather_summary: packingResult.weather_summary,
          detailed_recommendations: packingResult.items,
        },
        'Packing checklist generated successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async getUserChecklists(req, res, next) {
    try {
      const userId = req.user?.uid || 'usr_guest';
      const checklists = await PackingModel.listByUser(userId);
      return ApiResponse.success(res, checklists, 'Packing checklists retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateCustomItems(req, res, next) {
    try {
      const { id } = req.params;
      const { customItems } = req.body;
      const userId = req.user?.uid || 'usr_guest';

      if (!Array.isArray(customItems)) {
        return ApiResponse.error(res, 'customItems must be an array of strings', 400);
      }

      const updated = await PackingModel.updateCustomItems(id, userId, customItems);
      if (!updated) {
        return ApiResponse.error(res, 'Checklist not found or unauthorized', 404);
      }

      return ApiResponse.success(res, updated, 'Custom packing items updated');
    } catch (error) {
      next(error);
    }
  }
}


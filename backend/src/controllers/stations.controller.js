import { findNearestStation } from '../utils/helpers.js';
import { ApiResponse } from '../utils/apiResponse.js';
import stations from '../data/static_stations.json' with { type: 'json' };

export class StationsController {
  static async listStations(req, res, next) {
    try {
      const { search } = req.query;
      let results = stations;

      if (search) {
        const query = search.toLowerCase();
        results = stations.filter(
          (s) =>
            s.station_name.toLowerCase().includes(query) ||
            s.city.toLowerCase().includes(query) ||
            s.state.toLowerCase().includes(query) ||
            s.station_code.includes(query)
        );
      }

      return ApiResponse.success(res, results, 'Stations retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getNearestStation(req, res, next) {
    try {
      const { lat, lon } = req.query;

      if (!lat || !lon) {
        return ApiResponse.error(res, 'lat and lon are required query parameters', 400);
      }

      const nearest = findNearestStation(Number(lat), Number(lon), stations);
      return ApiResponse.success(res, nearest, 'Nearest station found');
    } catch (error) {
      next(error);
    }
  }
}


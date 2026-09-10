import { UserModel } from '../models/user.model.js';
import { LocationModel } from '../models/location.model.js';
import { PreferenceModel } from '../models/preference.model.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class UserController {
  static async getProfile(req, res, next) {
    try {
      const uid = req.user.uid;
      let user = await UserModel.getById(uid);
      if (!user) {
        user = await UserModel.upsert(uid, {
          email: req.user.email,
          fullName: req.user.name || 'Mausam User',
        });
      }
      return ApiResponse.success(res, user, 'User profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const uid = req.user.uid;
      const updated = await UserModel.upsert(uid, req.body);
      return ApiResponse.success(res, updated, 'User profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getSavedLocations(req, res, next) {
    try {
      const uid = req.user.uid;
      const locations = await LocationModel.listByOwner(uid);
      return ApiResponse.success(res, locations, 'Saved locations retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async addSavedLocation(req, res, next) {
    try {
      const uid = req.user.uid;
      const { label, latitude, longitude, city } = req.body;

      if (!latitude || !longitude) {
        return ApiResponse.error(res, 'Latitude and longitude are required', 400);
      }

      const newLocation = await LocationModel.add(uid, { label, latitude, longitude, city });
      return ApiResponse.success(res, newLocation, 'Location saved successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async deleteSavedLocation(req, res, next) {
    try {
      const uid = req.user.uid;
      const { id } = req.params;
      const deleted = await LocationModel.delete(id, uid);

      if (!deleted) {
        return ApiResponse.error(res, 'Location not found or not owned by user', 404);
      }
      return ApiResponse.success(res, null, 'Location removed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getPreferences(req, res, next) {
    try {
      const uid = req.user.uid;
      const prefs = await PreferenceModel.getByUser(uid);
      return ApiResponse.success(res, prefs, 'Preferences retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updatePreferences(req, res, next) {
    try {
      const uid = req.user.uid;
      const updated = await PreferenceModel.update(uid, req.body);
      return ApiResponse.success(res, updated, 'Preferences updated successfully');
    } catch (error) {
      next(error);
    }
  }
}


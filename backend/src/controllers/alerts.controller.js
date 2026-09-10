import { AlertModel } from '../models/alert.model.js';
import { NotificationService } from '../services/notification.service.js';
import { WeatherService } from '../services/weather.service.js';
import { NormalizationService } from '../services/normalization.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AlertsController {
  /**
   * List alerts for the user
   */
  static async listAlerts(req, res, next) {
    try {
      const userId = req.user?.uid || 'usr_guest';
      const alerts = await AlertModel.listByUser(userId);
      return ApiResponse.success(res, alerts, 'Alerts retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark alert as read
   */
  static async markRead(req, res, next) {
    try {
      const { id } = req.params;
      await AlertModel.markAsRead(id);
      return ApiResponse.success(res, null, 'Alert marked as read');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process weather update through the complete decoupled notification pipeline:
   * Weather -> Alert Detection -> Is Significant? -> Persona Relevance -> Affected Users -> Message Gen -> FCM
   */
  static async processWeatherAlert(req, res, next) {
    try {
      const { lat = 28.6139, lon = 77.2090, weatherData } = req.body;

      let normalized;
      if (weatherData) {
        normalized = NormalizationService.normalize(weatherData, { lat, lon });
      } else {
        normalized = await WeatherService.getNormalizedWeather(lat, lon);
      }

      const pipelineReport = await NotificationService.processWeatherAlertPipeline(normalized);
      return ApiResponse.success(res, pipelineReport, 'Notification pipeline executed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Trigger manual test alert (backwards compatible)
   */
  static async triggerTestAlert(req, res, next) {
    try {
      const { persona = 'STUDENT', severity = 'HIGH', message } = req.body;
      const userId = req.user?.uid || 'usr_guest';

      const result = await NotificationService.sendAlertNotification({
        userId,
        persona,
        title: 'Manual Test Alert',
        message: message || 'Test alert: Significant weather condition detected.',
        severity,
        type: 'MANUAL_TEST_ALERT',
      });

      return ApiResponse.success(res, result, 'Test alert processed', 201);
    } catch (error) {
      next(error);
    }
  }
}

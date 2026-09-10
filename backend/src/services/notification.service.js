import { AlertService } from './alert.service.js';
import { PersonaService } from './persona.service.js';
import { MessageService } from './message.service.js';
import { FcmService } from './fcm.service.js';
import { UserModel } from '../models/user.model.js';
import { AlertModel } from '../models/alert.model.js';
import { db } from '../config/firebase.js';
import { logger } from '../utils/logger.js';

/**
 * Notification Pipeline Orchestrator
 * Implements the redesigned architecture:
 * Weather Update -> Alert Detection -> Is Significant? (NO: STOP / YES: continue)
 * -> Persona Relevance -> Find Affected Users -> Generate Message -> FCM Delivery
 */
export class NotificationService {
  /**
   * Processes normalized weather update through the complete alert and targeted notification pipeline
   * @param {Object} normalizedWeather - Output from WeatherNormalizer
   * @returns {Promise<Object>} Execution report of the notification pipeline
   */
  static async processWeatherAlertPipeline(normalizedWeather) {
    const city = normalizedWeather.location?.city || 'Unknown Location';
    logger.info(`[NotificationPipeline] Processing weather update for: ${city}`);

    // Step 1: Alert Detection Layer
    const alertResult = AlertService.detectAlert(normalizedWeather);

    // Step 2: Significance Check
    if (!alertResult.isSignificant) {
      logger.info(`[NotificationPipeline] Alert not significant for ${city}. Pipeline stopped.`);
      return {
        isSignificant: false,
        status: 'STOPPED_NOT_SIGNIFICANT',
        reason: alertResult.reason,
        city,
      };
    }

    logger.info(`[NotificationPipeline] Significant Alert Detected: [${alertResult.primaryAlert.severity}] ${alertResult.primaryAlert.title}`);

    // Step 3: Persona Relevance Engine
    const relevantPersonas = PersonaService.getRelevantPersonas(alertResult);
    const personaNames = relevantPersonas.map((p) => p.persona);
    logger.info(`[NotificationPipeline] Relevant Personas identified: ${personaNames.join(', ')}`);

    if (relevantPersonas.length === 0) {
      return {
        isSignificant: true,
        status: 'STOPPED_NO_RELEVANT_PERSONAS',
        alert: alertResult.primaryAlert,
      };
    }

    // Step 4: Find Affected Users (filtered by Persona, Location, Notification Eligibility)
    const affectedUsers = await UserModel.findAffectedUsers({
      relevantPersonas: personaNames,
      city: normalizedWeather.location?.city,
      latitude: normalizedWeather.location?.latitude,
      longitude: normalizedWeather.location?.longitude,
    });

    logger.info(`[NotificationPipeline] Found ${affectedUsers.length} affected user(s) matching criteria.`);

    // Step 5 & 6: Message Generation & FCM Delivery for each affected user
    const deliveries = [];

    for (const user of affectedUsers) {
      // Step 5: Persona-specific Message Generation
      const personalizedMsg = MessageService.generateMessage(
        user.activePersona,
        alertResult,
        normalizedWeather,
        user
      );

      // Step 6: Isolated FCM Delivery
      const deliveryResult = await FcmService.sendToDevice(user.fcmToken, {
        title: personalizedMsg.title,
        body: personalizedMsg.body,
        data: {
          persona: user.activePersona,
          severity: personalizedMsg.severity,
          action: personalizedMsg.action,
          city,
        },
      });

      // Persist in alerts_log
      const alertLogEntry = {
        user: user.uid,
        userName: user.fullName,
        persona: user.activePersona,
        type: alertResult.primaryAlert.type,
        title: personalizedMsg.title,
        message: personalizedMsg.body,
        action: personalizedMsg.action,
        severity: personalizedMsg.severity,
        city,
        isRead: false,
        delivered: deliveryResult.delivered || deliveryResult.isMock,
        createdAt: new Date().toISOString(),
      };

      try {
        await db.collection('alerts_log').add(alertLogEntry);
      } catch (err) {
        logger.warn('Failed to persist alert in alerts_log:', err.message);
      }

      deliveries.push({
        userId: user.uid,
        userName: user.fullName,
        persona: user.activePersona,
        message: personalizedMsg,
        fcmResult: deliveryResult,
      });
    }

    return {
      isSignificant: true,
      status: 'DELIVERED',
      alert: alertResult.primaryAlert,
      relevantPersonas,
      affectedUsersCount: affectedUsers.length,
      deliveries,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Backwards compatible helper for manual test triggers
   */
  static async sendAlertNotification({ userId, persona, fcmToken, title, message, severity = 'HIGH', type = 'WEATHER_ALERT' }) {
    const alertRecord = {
      user: userId || 'anonymous',
      persona: persona || 'STUDENT',
      type,
      message,
      severity,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    try {
      await db.collection('alerts_log').add(alertRecord);
    } catch (err) {
      logger.warn('Failed to persist alert in alerts_log:', err.message);
    }

    const delivery = await FcmService.sendToDevice(fcmToken, { title, body: message });
    return { success: true, delivered: delivery.delivered, alert: alertRecord };
  }
}

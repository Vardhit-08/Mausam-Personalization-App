import { messaging } from '../config/firebase.js';
import { logger } from '../utils/logger.js';

/**
 * FCM Delivery Service
 * Dedicated purely to push notification delivery via Firebase Cloud Messaging.
 * Does NOT contain persona relevance, threshold, or message generation logic.
 */
export class FcmService {
  /**
   * Dispatches a push notification to a single device token
   * @param {string} token - FCM registration token
   * @param {Object} messagePayload - { title, body, data }
   * @returns {Promise<Object>} Delivery result
   */
  static async sendToDevice(token, { title, body, data = {} }) {
    if (!token) {
      return { success: false, delivered: false, error: 'No FCM token provided' };
    }

    if (!messaging) {
      logger.info(`[FcmService] Mock Delivery to [${token}]: "${title}" - "${body}"`);
      return {
        success: true,
        delivered: false,
        isMock: true,
        mockDeliveredTo: token,
        title,
        body,
      };
    }

    try {
      const payload = {
        token,
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          deliveredAt: new Date().toISOString(),
        },
      };

      const response = await messaging.send(payload);
      logger.info(`[FcmService] Successfully delivered notification via FCM: ${response}`);
      return { success: true, delivered: true, messageId: response };
    } catch (error) {
      logger.warn(`[FcmService] Failed to deliver FCM notification to ${token}: ${error.message}`);
      return { success: false, delivered: false, error: error.message };
    }
  }

  /**
   * Dispatches notifications to multiple device tokens
   */
  static async sendToMultiple(tokens = [], messagePayload) {
    const results = [];
    for (const token of tokens) {
      const res = await this.sendToDevice(token, messagePayload);
      results.push(res);
    }
    return results;
  }
}


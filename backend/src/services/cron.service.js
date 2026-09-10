import cron from 'node-cron';
import { WeatherService } from './weather.service.js';
import { NotificationService } from './notification.service.js';
import { db } from '../config/firebase.js';
import { logger } from '../utils/logger.js';

/**
 * Cron / Scheduler Service
 * Responsible ONLY for triggering weather update checks.
 * Does NOT contain persona-specific, threshold, or message generation logic.
 *
 * Flow:
 * Cron Trigger -> Weather Update -> Normalization -> Alert Pipeline
 */
export class CronService {
  constructor() {
    this.task = null;
  }

  /**
   * Starts the 10-minute periodic weather update check
   */
  start() {
    logger.info('[CronService] Initializing weather update trigger scheduler (every 10m)...');

    this.task = cron.schedule('*/10 * * * *', async () => {
      logger.info('[CronService] Triggering scheduled weather update cycle...');
      await this.runWeatherUpdateCycle();
    });

    // Optional dev check 5s after startup
    setTimeout(() => {
      this.runWeatherUpdateCycle().catch((err) =>
        logger.warn('[CronService] Startup check error:', err.message)
      );
    }, 5000);
  }

  stop() {
    if (this.task) {
      this.task.stop();
      logger.info('[CronService] Scheduler stopped.');
    }
  }

  /**
   * Discovers locations dynamically from active users and saved locations in DB,
   * fetches normalized weather, and feeds them into the notification pipeline.
   */
  async runWeatherUpdateCycle() {
    try {
      // 1. Discover unique locations from users in the system
      const usersSnapshot = await db.collection('users').get();
      const locationMap = new Map();

      usersSnapshot.forEach((doc) => {
        const user = doc.data();
        if (user.city && user.latitude && user.longitude) {
          locationMap.set(user.city, {
            city: user.city,
            latitude: user.latitude,
            longitude: user.longitude,
          });
        }
      });

      // Default fallback location if no users have set locations yet
      if (locationMap.size === 0) {
        locationMap.set('New Delhi', { city: 'New Delhi', latitude: 28.6139, longitude: 77.2090 });
      }

      // 2. Process each discovered location
      for (const [cityName, loc] of locationMap.entries()) {
        try {
          // Weather Service handles provider abstraction and returns NormalizedWeather
          const normalized = await WeatherService.getNormalizedWeather(loc.latitude, loc.longitude);

          // Feed into the decoupled alert & targeted notification pipeline
          await NotificationService.processWeatherAlertPipeline(normalized);
        } catch (err) {
          logger.warn(`[CronService] Error processing weather update for ${cityName}:`, err.message);
        }
      }
    } catch (err) {
      logger.warn('[CronService] Update cycle error:', err.message);
    }
  }
}

export const cronService = new CronService();

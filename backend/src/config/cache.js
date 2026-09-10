import NodeCache from 'node-cache';
import Redis from 'ioredis';
import { config } from './env.js';

class CacheManager {
  constructor() {
    this.memoryCache = new NodeCache({ stdTTL: config.redis.ttl, checkperiod: 120 });
    this.redisClient = null;
    this.usingRedis = false;

    if (config.redis.isConfigured) {
      try {
        this.redisClient = new Redis(config.redis.url, {
          lazyConnect: true,
          retryStrategy(times) {
            if (times > 3) return null; // stop retrying after 3 attempts
            return Math.min(times * 200, 1000);
          },
        });

        this.redisClient.connect()
          .then(() => {
            this.usingRedis = true;
            console.log('[CacheManager] Successfully connected to Redis.');
          })
          .catch((err) => {
            console.warn('[CacheManager] Redis connection failed, falling back to in-memory NodeCache:', err.message);
            this.usingRedis = false;
          });

        this.redisClient.on('error', (err) => {
          if (this.usingRedis) {
            console.warn('[CacheManager] Redis error, using in-memory fallback:', err.message);
          }
          this.usingRedis = false;
        });
      } catch (err) {
        console.warn('[CacheManager] Redis initialization error, using in-memory NodeCache:', err.message);
        this.usingRedis = false;
      }
    } else {
      console.log('[CacheManager] Using in-memory NodeCache (15-min TTL default).');
    }
  }

  async get(key) {
    if (this.usingRedis && this.redisClient) {
      try {
        const data = await this.redisClient.get(key);
        return data ? JSON.parse(data) : null;
      } catch (err) {
        console.warn(`[CacheManager] Redis GET error for ${key}, checking in-memory cache:`, err.message);
      }
    }
    return this.memoryCache.get(key) || null;
  }

  async set(key, value, ttlSeconds = config.redis.ttl) {
    if (this.usingRedis && this.redisClient) {
      try {
        await this.redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        return true;
      } catch (err) {
        console.warn(`[CacheManager] Redis SET error for ${key}, falling back to in-memory:`, err.message);
      }
    }
    return this.memoryCache.set(key, value, ttlSeconds);
  }

  async has(key) {
    if (this.usingRedis && this.redisClient) {
      try {
        const exists = await this.redisClient.exists(key);
        return exists === 1;
      } catch (err) {
        // fallback
      }
    }
    return this.memoryCache.has(key);
  }

  async del(key) {
    if (this.usingRedis && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (err) {
        // ignore
      }
    }
    return this.memoryCache.del(key);
  }

  getDriver() {
    return this.usingRedis ? 'redis' : 'node-cache';
  }
}

export const cache = new CacheManager();


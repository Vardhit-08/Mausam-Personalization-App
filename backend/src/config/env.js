import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  isDev: (process.env.NODE_ENV || 'development') === 'development',

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : '',
    databaseURL: process.env.FIREBASE_DATABASE_URL || '',
    isConfigured: Boolean(
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ),
  },

  redis: {
    url: process.env.REDIS_URL || '',
    ttl: 900, // 15 minutes default
    isConfigured: Boolean(process.env.REDIS_URL),
  },

  apis: {
    openMeteo: process.env.OPEN_METEO_BASE_URL || 'https://api.open-meteo.com/v1',
    airQuality: process.env.AIR_QUALITY_BASE_URL || 'https://air-quality-api.open-meteo.com/v1',
    marine: process.env.MARINE_BASE_URL || 'https://marine-api.open-meteo.com/v1',
    imdBaseUrl: process.env.IMD_API_BASE_URL || '',
    imdApiKey: process.env.IMD_API_KEY || '',
    cpcbApiKey: process.env.CPCB_API_KEY || '',
    aiApiKey: process.env.AI_API_KEY || '',
  },

  mongodb: {
    uri: process.env.MONGODB_URI || '',
    isConfigured: Boolean(process.env.MONGODB_URI),
  },
};


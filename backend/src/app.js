import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import apiV1Router from './routes/index.js';
import docsRouter from './routes/docs.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { cache } from './config/cache.js';
import { config } from './config/env.js';

const app = express();

// Security and utility middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: config.env,
    cacheDriver: cache.getDriver(),
    firebaseMode: config.firebase.isConfigured ? 'live' : 'mock/dev',
  });
});

// Root API Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Mausam Persona Weather Aggregator & Decision Gateway',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health',
    endpoints: {
      dashboard: '/api/v1/weather/dashboard?lat=28.6139&lon=77.2090&persona=FARMER',
      personalizedHome: '/api/v1/personalized-home?persona=STUDENT&lat=28.6139&lon=77.2090',
      stations: '/api/v1/stations',
      nearestStation: '/api/v1/stations/nearest?lat=28.6139&lon=77.2090',
      processAlert: '/api/v1/alerts/process',
      alerts: '/api/v1/alerts',
    },
    supportedPersonas: ['FARMER', 'TOURIST', 'STUDENT', 'PARENT'],
  });
});

// Interactive Swagger Documentation
app.use('/api-docs', docsRouter);

// Mount API v1
app.use('/api/v1', apiV1Router);

// 404 & Global Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;


import { Router } from 'express';
import { WeatherController } from '../controllers/weather.controller.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';
import { validateRequired } from '../middlewares/validator.middleware.js';

const router = Router();

// /api/v1/weather/dashboard
router.get(
  '/dashboard',
  validateRequired(['lat', 'lon', 'persona'], 'query'),
  WeatherController.getDashboard
);

// /api/v1/personalized-home
router.get(
  '/personalized-home',
  optionalAuth,
  WeatherController.getPersonalizedHome
);

export default router;


import { Router } from 'express';
import weatherRoutes from './weather.routes.js';
import userRoutes from './user.routes.js';
import packingRoutes from './packing.routes.js';
import alertsRoutes from './alerts.routes.js';
import stationsRoutes from './stations.routes.js';

const router = Router();

// Mount all API v1 domain sub-routes
router.use('/weather', weatherRoutes);
router.use('/', weatherRoutes); // Allows direct /api/v1/personalized-home access
router.use('/users', userRoutes);
router.use('/packing', packingRoutes);
router.use('/alerts', alertsRoutes);
router.use('/stations', stationsRoutes);

export default router;


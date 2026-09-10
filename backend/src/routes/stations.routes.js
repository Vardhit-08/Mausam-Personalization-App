import { Router } from 'express';
import { StationsController } from '../controllers/stations.controller.js';

const router = Router();

// /api/v1/stations
router.get('/', StationsController.listStations);

// /api/v1/stations/nearest?lat=...&lon=...
router.get('/nearest', StationsController.getNearestStation);

export default router;


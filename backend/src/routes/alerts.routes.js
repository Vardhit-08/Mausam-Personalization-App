import { Router } from 'express';
import { AlertsController } from '../controllers/alerts.controller.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(optionalAuth);

// List alerts
router.get('/', AlertsController.listAlerts);

// Mark as read
router.patch('/:id/read', AlertsController.markRead);

// Process weather update through the decoupled alert & notification pipeline
router.post('/process', AlertsController.processWeatherAlert);

// Trigger manual test alert
router.post('/test', AlertsController.triggerTestAlert);

export default router;


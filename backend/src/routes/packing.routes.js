import { Router } from 'express';
import { PackingController } from '../controllers/packing.controller.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';
import { validateRequired } from '../middlewares/validator.middleware.js';

const router = Router();

router.use(optionalAuth);

// Generate packing checklist based on forecast
router.post(
  '/generate',
  validateRequired(['destination'], 'body'),
  PackingController.generateChecklist
);

// List user checklists
router.get('/checklists', PackingController.getUserChecklists);

// Update custom items
router.patch('/checklists/:id/custom-items', PackingController.updateCustomItems);

export default router;


import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateRequired } from '../middlewares/validator.middleware.js';

const router = Router();

// Protect user routes
router.use(authenticate);

// Profile
router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);

// Saved Locations
router.get('/saved-locations', UserController.getSavedLocations);
router.post(
  '/saved-locations',
  validateRequired(['latitude', 'longitude'], 'body'),
  UserController.addSavedLocation
);
router.delete('/saved-locations/:id', UserController.deleteSavedLocation);

// Preferences
router.get('/preferences', UserController.getPreferences);
router.put('/preferences', UserController.updatePreferences);

export default router;


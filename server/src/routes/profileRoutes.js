import { Router } from 'express';
import * as profileController from '../controllers/profileController.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All profile routes require authentication
router.use(authenticate);

router.get('/', profileController.getProfile);
router.put('/', validate(profileController.updateProfileSchema), profileController.updateProfile);

router.post('/allergies', validate(profileController.addAllergySchema), profileController.addAllergy);
router.put('/allergies/batch', validate(profileController.batchAllergiesSchema), profileController.setAllergiesBatch);
router.delete('/allergies/:id', profileController.removeAllergy);

router.put('/preferences', validate(profileController.updatePreferencesSchema), profileController.updatePreferences);

export default router;

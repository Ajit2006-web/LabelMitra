import { Router } from 'express';
import * as scanController from '../controllers/scanController.js';
import { authenticate } from '../middleware/auth.js';
import { panelUploadMiddleware } from '../middleware/upload.js';

const router = Router();

// Multi-panel image upload and OCR processing (multer consumes stream first, then auth validates token)
router.post('/upload', panelUploadMiddleware, authenticate, scanController.uploadAndScan);

// All subsequent routes require authentication
router.use(authenticate);

// Retrieve specific scan session details and OCR results
router.get('/:id', scanController.getScan);

// List user scan history
router.get('/', scanController.listUserScans);

export default router;

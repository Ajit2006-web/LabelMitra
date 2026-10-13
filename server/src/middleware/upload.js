import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.resolve('uploads/scans');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `panel-${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Only JPEG, PNG, and WebP are allowed.`), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per image
  },
});

// Multi-panel field configuration supporting dedicated slots
export const panelUploadMiddleware = upload.fields([
  { name: 'front', maxCount: 1 },
  { name: 'nutrition', maxCount: 1 },
  { name: 'ingredients', maxCount: 1 },
  { name: 'side', maxCount: 1 },
]);

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import scanRoutes from './routes/scanRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middlewares
app.use(cors({
  origin: true, // Allow frontend during local dev
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded package images
app.use('/uploads', express.static(path.resolve('uploads')));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    application: 'LabelMitra',
    tagline: 'Your Friendly Guide to Food Labels',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/scans', scanRoutes);

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling
app.use(errorHandler);

export default app;

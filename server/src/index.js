import app from './app.js';
import { config } from './config/env.js';
import prisma from './config/database.js';

async function startServer() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('[Database] Connected to PostgreSQL successfully.');

    app.listen(config.port, () => {
      console.log(`[LabelMitra Server] Running on http://localhost:${config.port} in ${config.nodeEnv} mode`);
      console.log(`[LabelMitra Server] Health check available at http://localhost:${config.port}/api/health`);
    });
  } catch (error) {
    console.error('[LabelMitra Server] Failed to connect to database:', error);
    process.exit(1);
  }
}

startServer();

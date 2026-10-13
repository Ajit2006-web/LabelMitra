import request from 'supertest';
import path from 'path';
import fs from 'fs';
import app from '../src/app.js';
import prisma from '../src/config/database.js';

describe('Phase 2: Image Upload & OCR Pipeline Test Suite', () => {
  const testUser = {
    email: `ocr_tester_${Date.now()}@labelmitra.test`,
    password: 'Password123!',
    fullName: 'OCR Test User',
  };

  let authToken = '';
  let userId = '';
  let createdScanId = '';
  const dummyImagePath = path.resolve('tests/test_panel.png');

  beforeAll(async () => {
    await prisma.$connect();

    // Create a 1x1 dummy PNG buffer for test file uploads
    const dummyPngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    fs.writeFileSync(dummyImagePath, dummyPngBuffer);

    // Register user & obtain auth token
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    authToken = res.body.data.token;
    userId = res.body.data.user.id;
  });

  afterAll(async () => {
    if (fs.existsSync(dummyImagePath)) {
      fs.unlinkSync(dummyImagePath);
    }

    if (userId) {
      await prisma.scan.deleteMany({ where: { userId } });
      await prisma.user.deleteMany({ where: { id: userId } });
    }

    await prisma.$disconnect();
  });

  describe('1. Authentication Guard', () => {
    it('should reject unauthenticated upload requests', async () => {
      const res = await request(app)
        .post('/api/scans/upload')
        .attach('front', dummyImagePath);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Multi-Panel Upload & OCR Processing', () => {
    it('should reject scan upload with no files attached', async () => {
      const res = await request(app)
        .post('/api/scans/upload')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No packaging panel images were provided');
    });

    it('should process multi-panel upload (front, nutrition, ingredients) and return OCR results', async () => {
      const res = await request(app)
        .post('/api/scans/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('front', dummyImagePath)
        .attach('nutrition', dummyImagePath)
        .attach('ingredients', dummyImagePath);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.scan).toBeDefined();
      expect(res.body.data.scan.id).toBeDefined();
      expect(res.body.data.ocrResults).toBeInstanceOf(Array);
      expect(res.body.data.ocrResults.length).toBe(3);

      const panelSides = res.body.data.ocrResults.map((r) => r.imageSide);
      expect(panelSides).toContain('FRONT');
      expect(panelSides).toContain('NUTRITION');
      expect(panelSides).toContain('INGREDIENTS');

      // Confidence score check
      expect(res.body.data.compositeConfidence).toBeGreaterThan(0);
      expect(res.body.data.status).toBeDefined();

      createdScanId = res.body.data.scan.id;
    });
  });

  describe('3. Scan Retrieval & User History', () => {
    it('should retrieve scan session with individual panel OCR results and bounding boxes', async () => {
      const res = await request(app)
        .get(`/api/scans/${createdScanId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdScanId);
      expect(res.body.data.ocrResults.length).toBe(3);

      const firstResult = res.body.data.ocrResults[0];
      expect(firstResult.rawText).toBeDefined();
      expect(firstResult.confidenceScore).toBeDefined();
      expect(firstResult.boundingBoxes).toBeInstanceOf(Array);
    });

    it('should list all scans in user history', async () => {
      const res = await request(app)
        .get('/api/scans')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should return 404 when querying an invalid scan id', async () => {
      const res = await request(app)
        .get('/api/scans/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});

import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { jest } from '@jest/globals';
import app from '../src/app.js';
import prisma from '../src/config/database.js';

describe('Phase 2: Image Upload & OCR Pipeline Test Suite', () => {
  const testUser = {
    email: `ocr_tester_${Date.now()}@labelmitra.test`,
    password: 'Password123!',
    fullName: 'OCR Test User',
  };

  const otherUser = {
    email: `ocr_other_${Date.now()}@labelmitra.test`,
    password: 'Password123!',
    fullName: 'Other User',
  };

  let authToken = '';
  let userId = '';
  let otherToken = '';
  let otherUserId = '';
  let createdScanId = '';
  const dummyImagePath = path.resolve('tests/test_panel.png');
  const uploadedFilesTracked = new Set();

  beforeAll(async () => {
    await prisma.$connect();

    // Create a 1x1 dummy PNG buffer for test file uploads
    const dummyPngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    fs.writeFileSync(dummyImagePath, dummyPngBuffer);

    // Register primary user & obtain auth token
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    authToken = res.body.data.token;
    userId = res.body.data.user.id;

    // Register secondary user for data isolation testing
    const otherRes = await request(app)
      .post('/api/auth/register')
      .send(otherUser);

    otherToken = otherRes.body.data.token;
    otherUserId = otherRes.body.data.user.id;
  });

  afterAll(async () => {
    // Restore global fetch if it was mocked
    if (global.fetch && global.fetch.mockRestore) {
      global.fetch.mockRestore();
    }

    if (fs.existsSync(dummyImagePath)) {
      fs.unlinkSync(dummyImagePath);
    }

    // Clean up uploaded image files in uploads/scans created by tests
    for (const filePath of uploadedFilesTracked) {
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {
          // ignore cleanup errors
        }
      }
    }

    // Clean up database records
    const userIds = [userId, otherUserId].filter(Boolean);
    if (userIds.length > 0) {
      await prisma.ocrResult.deleteMany({
        where: { scan: { userId: { in: userIds } } },
      });
      await prisma.scan.deleteMany({
        where: { userId: { in: userIds } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: userIds } },
      });
    }

    await prisma.$disconnect();
  });

  describe('1. Authentication Guard', () => {
    it('should reject unauthenticated upload requests with 401', async () => {
      const res = await request(app)
        .post('/api/scans/upload')
        .attach('front', dummyImagePath);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject upload requests with invalid bearer token with 401', async () => {
      const res = await request(app)
        .post('/api/scans/upload')
        .set('Authorization', 'Bearer invalid_or_expired_jwt_token')
        .attach('front', dummyImagePath);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject unauthenticated scan retrieval by id with 401', async () => {
      const res = await request(app).get('/api/scans/sample-scan-id');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject unauthenticated scan listing with 401', async () => {
      const res = await request(app).get('/api/scans');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Multi-Panel Upload & Expected Response Structure', () => {
    it('should reject scan upload with no files attached with 400', async () => {
      const res = await request(app)
        .post('/api/scans/upload')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No packaging panel images were provided');
    });

    it('should successfully upload all 4 panels (front, nutrition, ingredients, side) and return expected structure', async () => {
      const res = await request(app)
        .post('/api/scans/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('front', dummyImagePath)
        .attach('nutrition', dummyImagePath)
        .attach('ingredients', dummyImagePath)
        .attach('side', dummyImagePath);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Packaging images preprocessed and OCR extraction completed successfully.');

      const { scan, ocrResults, compositeConfidence, status } = res.body.data;

      // Scan header assertions
      expect(scan).toBeDefined();
      expect(scan.id).toBeDefined();
      expect(scan.userId).toBe(userId);
      expect(scan.status).toBe(status);
      expect(Number(scan.ocrConfidence)).toBe(compositeConfidence);
      expect(scan.extractedData).toBeDefined();
      expect(scan.extractedData.panels_count).toBe(4);
      expect(scan.extractedData.composite_raw_text).toContain('--- [PANEL: FRONT] ---');
      expect(scan.extractedData.composite_raw_text).toContain('--- [PANEL: NUTRITION] ---');
      expect(scan.extractedData.composite_raw_text).toContain('--- [PANEL: INGREDIENTS] ---');
      expect(scan.extractedData.composite_raw_text).toContain('--- [PANEL: SIDE] ---');

      // Phase 3: Structured product extraction assertions
      expect(scan.extractedData.product_identity).toBeDefined();
      expect(scan.extractedData.statutory_declarations).toBeDefined();
      expect(scan.extractedData.statutory_declarations.fssai_license.value).toBe('10014047000120');
      expect(scan.extractedData.statutory_declarations.net_quantity.value).toBe(250);
      expect(scan.extractedData.ingredients).toBeDefined();
      expect(scan.extractedData.ingredients.items.length).toBeGreaterThan(0);
      expect(scan.extractedData.nutrition).toBeDefined();
      expect(scan.extractedData.nutrition.nutrients.energy.value).toBe(454);
      expect(scan.extractedData.extraction_summary).toBeDefined();

      // Overall summary assertions
      expect(scan.overallSummary).toBeDefined();
      expect(scan.overallSummary.composite_confidence).toBe(compositeConfidence);
      expect(scan.overallSummary.panels_processed.length).toBe(4);

      // OCR Results assertions
      expect(ocrResults).toBeInstanceOf(Array);
      expect(ocrResults.length).toBe(4);

      const panelSides = ocrResults.map((r) => r.imageSide);
      expect(panelSides).toEqual(expect.arrayContaining(['FRONT', 'NUTRITION', 'INGREDIENTS', 'SIDE']));

      for (const result of ocrResults) {
        expect(result.id).toBeDefined();
        expect(result.scanId).toBe(scan.id);
        expect(result.engineUsed).toBeDefined();
        expect(result.rawText.length).toBeGreaterThan(0);
        expect(result.confidenceScore).toBeDefined();
        expect(Number(result.confidenceScore)).toBeGreaterThan(0);
        expect(result.boundingBoxes).toBeInstanceOf(Array);
        expect(result.qualityMetrics).toBeDefined();
        expect(result.qualityMetrics.quality_status).toBe('OPTIMAL');

        // Track image file path for disk cleanup
        if (result.imagePath) {
          uploadedFilesTracked.add(path.resolve(result.imagePath));
        }
      }

      createdScanId = scan.id;
    });

    it('should verify scan and OCR records are persisted in the PostgreSQL database', async () => {
      expect(createdScanId).toBeDefined();

      const persistedScan = await prisma.scan.findUnique({
        where: { id: createdScanId },
        include: { ocrResults: true },
      });

      expect(persistedScan).not.toBeNull();
      expect(persistedScan.userId).toBe(userId);
      expect(persistedScan.ocrResults.length).toBe(4);
      expect(['COMPLETED', 'NEEDS_VERIFICATION']).toContain(persistedScan.status);
      expect(Number(persistedScan.ocrConfidence)).toBeGreaterThan(0);

      // Verify individual OCR result relations
      for (const ocr of persistedScan.ocrResults) {
        expect(ocr.scanId).toBe(createdScanId);
        expect(ocr.rawText).toBeTruthy();
        expect(Number(ocr.confidenceScore)).toBeGreaterThan(0);
      }
    });
  });

  describe('3. OCR Fallback & External Microservice Integration', () => {
    it('should gracefully use NativeOCR-Adapter fallback when AI microservice is unreachable', async () => {
      // The AI service is offline during test run; verify that fallback handles individual panels predictably
      const res = await request(app)
        .post('/api/scans/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('front', dummyImagePath);

      expect(res.status).toBe(201);
      const frontOcr = res.body.data.ocrResults[0];

      expect(frontOcr.engineUsed).toBe('NativeOCR-Adapter');
      expect(frontOcr.imageSide).toBe('FRONT');
      expect(frontOcr.rawText).toContain('LabelMitra Packaged Food Product');
      expect(frontOcr.rawText).toContain('100% Vegetarian');
      expect(frontOcr.qualityMetrics.quality_status).toBe('OPTIMAL');

      if (frontOcr.imagePath) {
        uploadedFilesTracked.add(path.resolve(frontOcr.imagePath));
      }
    });

    it('should parse external AI microservice response when microservice returns valid OCR data', async () => {
      // Mock global fetch to simulate a healthy external FastAPI microservice response
      const mockFetch = jest.spyOn(global, 'fetch').mockImplementation(async () => ({
        ok: true,
        json: async () => ({
          success: true,
          filename: 'panel.png',
          quality_metrics: {
            quality_status: 'OPTIMAL',
            blur_score: 180.0,
            is_blurry: false,
          },
          ocr_result: {
            engine: 'PaddleOCR',
            raw_text: 'External PaddleOCR Extracted Text\nFSSAI Lic. 10014047000120',
            confidence_score: 96.5,
            lines: [
              { text: 'External PaddleOCR Extracted Text', box: [[10, 10], [200, 10], [200, 40], [10, 40]] },
            ],
          },
        }),
      }));

      try {
        const res = await request(app)
          .post('/api/scans/upload')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('front', dummyImagePath);

        expect(res.status).toBe(201);
        const ocr = res.body.data.ocrResults[0];

        expect(ocr.engineUsed).toBe('PaddleOCR');
        expect(ocr.rawText).toContain('External PaddleOCR Extracted Text');
        expect(Number(ocr.confidenceScore)).toBe(96.5);
        expect(ocr.boundingBoxes.length).toBe(1);

        if (ocr.imagePath) {
          uploadedFilesTracked.add(path.resolve(ocr.imagePath));
        }
      } finally {
        mockFetch.mockRestore();
      }
    });
  });

  describe('4. Composite-Confidence Rule & Status Determination', () => {
    it('should mark scan as COMPLETED when composite confidence is >= 60.0%', async () => {
      // High confidence test (fallback yields > 90% confidence)
      const res = await request(app)
        .post('/api/scans/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('front', dummyImagePath);

      expect(res.status).toBe(201);
      expect(res.body.data.compositeConfidence).toBeGreaterThanOrEqual(60.0);
      expect(res.body.data.status).toBe('COMPLETED');
      expect(res.body.data.scan.status).toBe('COMPLETED');

      if (res.body.data.ocrResults[0]?.imagePath) {
        uploadedFilesTracked.add(path.resolve(res.body.data.ocrResults[0].imagePath));
      }
    });

    it('should mark scan as NEEDS_VERIFICATION when composite confidence is < 60.0%', async () => {
      // Mock microservice returning low confidence (< 60.0%)
      const mockFetch = jest.spyOn(global, 'fetch').mockImplementation(async () => ({
        ok: true,
        json: async () => ({
          success: true,
          filename: 'panel.png',
          quality_metrics: {
            quality_status: 'SUB_OPTIMAL',
            blur_score: 35.0,
            is_blurry: true,
          },
          ocr_result: {
            engine: 'PaddleOCR',
            raw_text: 'Partially degraded text on blurred label',
            confidence_score: 45.0,
            lines: [],
          },
        }),
      }));

      try {
        const res = await request(app)
          .post('/api/scans/upload')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('front', dummyImagePath);

        expect(res.status).toBe(201);
        expect(res.body.data.compositeConfidence).toBe(45.0);
        expect(res.body.data.status).toBe('NEEDS_VERIFICATION');
        expect(res.body.data.scan.status).toBe('NEEDS_VERIFICATION');

        // Confirm status in database
        const dbScan = await prisma.scan.findUnique({
          where: { id: res.body.data.scan.id },
        });
        expect(dbScan.status).toBe('NEEDS_VERIFICATION');

        if (res.body.data.ocrResults[0]?.imagePath) {
          uploadedFilesTracked.add(path.resolve(res.body.data.ocrResults[0].imagePath));
        }
      } finally {
        mockFetch.mockRestore();
      }
    });
  });

  describe('5. Scan Retrieval, User History & Data Isolation', () => {
    it('should retrieve scan session with individual panel OCR results and bounding boxes', async () => {
      const res = await request(app)
        .get(`/api/scans/${createdScanId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdScanId);
      expect(res.body.data.ocrResults.length).toBe(4);

      const firstResult = res.body.data.ocrResults[0];
      expect(firstResult.rawText).toBeDefined();
      expect(firstResult.confidenceScore).toBeDefined();
      expect(firstResult.boundingBoxes).toBeInstanceOf(Array);
    });

    it('should list all scans in user history ordered by creation date', async () => {
      const res = await request(app)
        .get('/api/scans')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      // Verify chronological descending order
      if (res.body.data.length > 1) {
        const date0 = new Date(res.body.data[0].createdAt).getTime();
        const date1 = new Date(res.body.data[1].createdAt).getTime();
        expect(date0).toBeGreaterThanOrEqual(date1);
      }
    });

    it('should return 404 when querying an invalid scan id', async () => {
      const res = await request(app)
        .get('/api/scans/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should prevent other users from accessing another user scan session (404 isolation)', async () => {
      const res = await request(app)
        .get(`/api/scans/${createdScanId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Scan record not found or does not belong to you');
    });
  });
});

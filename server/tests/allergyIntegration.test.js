/**
 * LabelMitra - Personalized Allergy Matching Integration Test Suite (Phase 4 Step 4)
 */

import request from 'supertest';
import path from 'path';
import fs from 'fs';
import app from '../src/app.js';
import prisma from '../src/config/database.js';

describe('Phase 4: Allergy Matching Integration & Privacy Isolation', () => {
  const userA = {
    email: `allergy_user_a_${Date.now()}@labelmitra.test`,
    password: 'Password123!',
    fullName: 'Allergy User A',
  };

  const userB = {
    email: `allergy_user_b_${Date.now()}@labelmitra.test`,
    password: 'Password123!',
    fullName: 'Allergy User B',
  };

  let tokenA = '';
  let userAId = '';
  let tokenB = '';
  let userBId = '';
  let scanIdA = '';
  const dummyImagePath = path.resolve('tests/allergy_test_panel.png');

  beforeAll(async () => {
    await prisma.$connect();

    const dummyPngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    fs.writeFileSync(dummyImagePath, dummyPngBuffer);

    // Register User A
    const resA = await request(app).post('/api/auth/register').send(userA);
    tokenA = resA.body.data.token;
    userAId = resA.body.data.user.id;

    // Register User B
    const resB = await request(app).post('/api/auth/register').send(userB);
    tokenB = resB.body.data.token;
    userBId = resB.body.data.user.id;

    // Add Peanut allergy to User A
    await request(app)
      .post('/api/profile/allergies')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        allergenName: 'Peanut',
        severity: 'Severe',
        notes: 'Strict anaphylactic reaction',
      });

    // Add Milk allergy to User B
    await request(app)
      .post('/api/profile/allergies')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        allergenName: 'Milk',
        severity: 'Moderate',
      });
  });

  afterAll(async () => {
    try {
      if (fs.existsSync(dummyImagePath)) fs.unlinkSync(dummyImagePath);
      if (userAId) await prisma.user.delete({ where: { id: userAId } }).catch(() => {});
      if (userBId) await prisma.user.delete({ where: { id: userBId } }).catch(() => {});
    } catch {
      // Ignore cleanup errors
    }
  });

  it('evaluates personalized allergy assessment at scan time for User A', async () => {
    const res = await request(app)
      .post('/api/scans/upload')
      .set('Authorization', `Bearer ${tokenA}`)
      .attach('ingredients', dummyImagePath)
      .attach('front', dummyImagePath);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const scan = res.body.data.scan;
    scanIdA = scan.id;

    expect(scan.extractedData).toBeDefined();
    expect(scan.extractedData.personalized_allergy_assessment).toBeDefined();

    const assessment = scan.extractedData.personalized_allergy_assessment;
    expect(assessment.disclaimer).toContain('does not constitute medical advice');
    expect(scan.overallSummary.allergy_assessment_summary).toBeDefined();
  });

  it('fetches scan details and dynamically personalizes assessment for User A', async () => {
    const res = await request(app)
      .get(`/api/scans/${scanIdA}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.extractedData.personalized_allergy_assessment).toBeDefined();
  });

  it('strictly enforces data isolation: User B cannot access User A scan record or allergies', async () => {
    const res = await request(app)
      .get(`/api/scans/${scanIdA}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Scan record not found or does not belong to you');
  });
});

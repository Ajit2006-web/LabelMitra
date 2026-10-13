import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/database.js';

describe('Phase 1: Authentication & User Profile Test Suite', () => {
  const testUser = {
    email: `test_user_${Date.now()}@labelmitra.test`,
    password: 'Password123!',
    fullName: 'Test Mitra User',
    dietaryPreference: 'VEGAN',
  };

  let authToken = '';
  let userId = '';
  let createdAllergyId = '';

  beforeAll(async () => {
    // Ensure DB connected
    await prisma.$connect();
  });

  afterAll(async () => {
    // Clean up test data
    if (userId) {
      await prisma.user.deleteMany({
        where: { id: userId },
      });
    }
    await prisma.$disconnect();
  });

  describe('1. Health Check Endpoint', () => {
    it('should return 200 with application details', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.application).toBe('LabelMitra');
      expect(res.body.status).toBe('healthy');
    });
  });

  describe('2. User Registration (/api/auth/register)', () => {
    it('should fail with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email-format',
          password: 'Password123!',
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
    });

    it('should fail with password less than 6 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'valid@labelmitra.test',
          password: '123',
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should successfully register a new user and return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());

      authToken = res.body.data.token;
      userId = res.body.data.user.id;
    });

    it('should reject duplicate registration with 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. User Login (/api/auth/login)', () => {
    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject login for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'does_not_exist@labelmitra.test',
          password: 'Password123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should login successfully and return JWT token and profile data', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.profile.fullName).toBe(testUser.fullName);
      expect(res.body.data.user.profile.dietaryPreference).toBe('VEGAN');
    });
  });

  describe('4. Token Verification (/api/auth/me)', () => {
    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('should reject invalid bearer token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token_here');
      expect(res.status).toBe(401);
    });

    it('should return authenticated user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(userId);
      expect(res.body.data.profile.dietaryPreference).toBe('VEGAN');
    });
  });

  describe('5. Profile Management (/api/profile)', () => {
    it('should retrieve user profile', async () => {
      const res = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile).toBeDefined();
      expect(res.body.data.profile.fullName).toBe(testUser.fullName);
    });

    it('should update profile dietary preference and age group', async () => {
      const res = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fullName: 'Mitra Updated Name',
          ageGroup: '26-40',
          dietaryPreference: 'VEGETARIAN',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fullName).toBe('Mitra Updated Name');
      expect(res.body.data.dietaryPreference).toBe('VEGETARIAN');
      expect(res.body.data.ageGroup).toBe('26-40');
    });
  });

  describe('6. Allergy Profile Management (/api/profile/allergies)', () => {
    it('should add a single allergy to profile', async () => {
      const res = await request(app)
        .post('/api/profile/allergies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          allergenName: 'Peanut',
          severity: 'Severe',
          notes: 'Anaphylactic reaction to groundnuts and peanut oil',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.allergenName).toBe('Peanut');
      expect(res.body.data.severity).toBe('Severe');

      createdAllergyId = res.body.data.id;
    });

    it('should batch update allergies list', async () => {
      const res = await request(app)
        .put('/api/profile/allergies/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          allergies: [
            { allergenName: 'Peanut', severity: 'Severe' },
            { allergenName: 'Soy', severity: 'Moderate' },
            { allergenName: 'Tree nuts', severity: 'Mild' },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(3);
      const names = res.body.data.map(a => a.allergenName);
      expect(names).toContain('Peanut');
      expect(names).toContain('Soy');
      expect(names).toContain('Tree nuts');
    });

    it('should delete an individual allergy', async () => {
      // Fetch current allergies to get valid ID
      const profileRes = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${authToken}`);

      const soyAllergy = profileRes.body.data.allergies.find(a => a.allergenName === 'Soy');
      expect(soyAllergy).toBeDefined();

      const deleteRes = await request(app)
        .delete(`/api/profile/allergies/${soyAllergy.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      // Verify deletion in profile
      const afterRes = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${authToken}`);

      const remainingNames = afterRes.body.data.allergies.map(a => a.allergenName);
      expect(remainingNames).not.toContain('Soy');
    });
  });

  describe('7. Nutrition Preferences Management (/api/profile/preferences)', () => {
    it('should update user nutrition preferences', async () => {
      const res = await request(app)
        .put('/api/profile/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          preferences: {
            LOW_SUGAR: true,
            LOW_SODIUM: true,
            HIGH_PROTEIN: true,
            NO_ARTIFICIAL_SWEETENERS: true,
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);

      const profileRes = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${authToken}`);

      const prefMap = {};
      profileRes.body.data.preferences.forEach(p => {
        prefMap[p.preferenceKey] = p.preferenceValue;
      });

      expect(prefMap.LOW_SUGAR).toBe('true');
      expect(prefMap.LOW_SODIUM).toBe('true');
    });
  });
});

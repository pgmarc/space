import dotenv from 'dotenv';
import request from 'supertest';
import { getApp, shutdownApp } from './utils/testApp';
import { Server } from 'http';
import { describe, it, expect, beforeAll, afterAll, afterEach, test } from 'vitest';

dotenv.config();

describe('Contract API Test Suite', function () {
  let app: Server;

  const testUserId = "9cd3c5c9-f5df-4307-a5b7-b51386228180";

  beforeAll(async function () {
    app = await getApp();
  });

  describe('GET /contracts', function () {
    it('Should return 200 and the contracts', async function () {
      const response = await request(app)
        .get('/api/contracts')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });

    // TODO: Test Contract filters
  });

  describe('GET /contracts/:userId', function () {
    it('Should return 200 and the contract for the given userId', async function () {
      const response = await request(app)
        .get(`/api/contracts/${testUserId}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.userContact.userId).toBe(testUserId);
      expect(response.body).toHaveProperty('billingPeriod');
      expect(response.body).toHaveProperty('usageLevels');
      expect(response.body).toHaveProperty('contractedServices');
      expect(response.body).toHaveProperty('subscriptionPlans');
      expect(response.body).toHaveProperty('subscriptionAddOns');
      expect(response.body).toHaveProperty('history');
    });

    it('Should return 404 if the contract is not found', async function () {
      const response = await request(app)
        .get('/api/contracts/invalid-user-id')
        .expect(404);

      expect(response.body).toBeDefined();
      expect(response.body.error).toContain('not found');
    });
  });

  afterAll(async function () {
    await shutdownApp();
  });
});

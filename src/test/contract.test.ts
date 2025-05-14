import dotenv from 'dotenv';
import request from 'supertest';
import { getApp, shutdownApp } from './utils/testApp';
import { Server } from 'http';
import { describe, it, expect, beforeAll, afterAll, afterEach, test } from 'vitest';
import {
  createRandomContract,
  generateContract,
  getAllContracts,
  getContractByUserId,
} from './utils/contracts/contracts';
import { generateNovation } from './utils/contracts/generators';
import { addDays } from 'date-fns';

dotenv.config();

describe('Contract API Test Suite', function () {
  let app: Server;

  const testUserId = '9cd3c5c9-f5df-4307-a5b7-b51386228180';

  beforeAll(async function () {
    app = await getApp();
  });

  describe('GET /contracts', function () {
    it('Should return 200 and the contracts', async function () {
      const response = await request(app).get('/api/contracts').expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });

    // TODO: Test Contract filters
  });

  describe('POST /contracts', function () {
    it('Should return 201 and the created contract', async function () {
      const contractToCreate = await generateContract(undefined, app);
      const response = await request(app).post(`/api/contracts`).send(contractToCreate);

      expect(response.status).toBe(201);
      expect(response.body).toBeDefined();
      expect(response.body.userContact.userId).toBe(contractToCreate.userContact.userId);
      expect(response.body).toHaveProperty('billingPeriod');
      expect(response.body).toHaveProperty('usageLevels');
      expect(response.body).toHaveProperty('contractedServices');
      expect(response.body).toHaveProperty('subscriptionPlans');
      expect(response.body).toHaveProperty('subscriptionAddOns');
      expect(response.body).toHaveProperty('history');
      expect(new Date(response.body.billingPeriod.endDate)).toEqual(
        addDays(response.body.billingPeriod.startDate, response.body.billingPeriod.renewalDays)
      );
    });
  });

  describe('GET /contracts/:userId', function () {
    it('Should return 200 and the contract for the given userId', async function () {
      const response = await request(app).get(`/api/contracts/${testUserId}`).expect(200);

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
      const response = await request(app).get('/api/contracts/invalid-user-id').expect(404);

      expect(response.body).toBeDefined();
      expect(response.body.error).toContain('not found');
    });
  });

  describe('PUT /contracts/:userId', function () {
    it('Should return 200 and the novated contract', async function () {
      const newContract = await createRandomContract(app);
      const newContractFullData = await getContractByUserId(newContract.userContact.userId, app);

      const novation = await generateNovation();

      const response = await request(app)
        .put(`/api/contracts/${newContract.userContact.userId}`)
        .send(novation)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.userContact.userId).toBe(newContract.userContact.userId);
      expect(response.body).toHaveProperty('billingPeriod');
      expect(response.body).toHaveProperty('usageLevels');
      expect(response.body).toHaveProperty('contractedServices');
      expect(response.body).toHaveProperty('subscriptionPlans');
      expect(response.body).toHaveProperty('subscriptionAddOns');
      expect(response.body).toHaveProperty('history');
      expect(response.body.history.length).toBe(1);
      expect(newContractFullData.billingPeriod.startDate).not.toEqual(
        response.body.billingPeriod.startDate
      );
      expect(new Date(response.body.billingPeriod.endDate)).toEqual(
        addDays(response.body.billingPeriod.startDate, response.body.billingPeriod.renewalDays)
      );
    });
  });

  describe('DELETE /contracts', function () {
    it('Should return 204 and delete all contracts', async function () {
      const servicesBefore = await getAllContracts(app);
      expect(servicesBefore.length).toBeGreaterThan(0);

      await request(app).delete('/api/contracts').expect(204);

      const servicesAfter = await getAllContracts(app);
      expect(servicesAfter.length).toBe(0);
    });
  });

  afterAll(async function () {
    await shutdownApp();
  });
});

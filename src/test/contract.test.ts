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
  incrementAllUsageLevel,
  incrementUsageLevel,
} from './utils/contracts/contracts';
import { generateNovation } from './utils/contracts/generators';
import { addDays } from 'date-fns';
import { UsageLevel } from '../main/types/models/Contract';
import { TestContract } from './types/models/Contract';

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

      const contract: TestContract = response.body;

      expect(contract).toBeDefined();
      expect(contract.userContact.userId).toBe(testUserId);
      expect(contract).toHaveProperty('billingPeriod');
      expect(contract).toHaveProperty('usageLevels');
      expect(contract).toHaveProperty('contractedServices');
      expect(contract).toHaveProperty('subscriptionPlans');
      expect(contract).toHaveProperty('subscriptionAddOns');
      expect(contract).toHaveProperty('history');
      expect(Object.values(Object.values(contract.usageLevels)[0])[0].consumed).toBeTruthy();
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

  describe('DELETE /contracts/:userId', function () {
    it('Should return 204', async function () {
      const newContract = await createRandomContract(app);

      await request(app).delete(`/api/contracts/${newContract.userContact.userId}`).expect(204);
    });
    it('Should return 404 with invalid userId', async function () {
      const response = await request(app).delete(`/api/contracts/invalid-user-id`).expect(404);

      expect(response.body).toBeDefined();
      expect(response.body.error.toLowerCase()).toContain('not found');
    });
  });

  describe('PUT /contracts/:userId/usageLevels', function () {
    it('Should return 200 and the novated contract: Given usage level increment', async function () {
      const newContract: TestContract = await createRandomContract(app);

      const serviceKey = Object.keys(newContract.usageLevels)[0];
      const usageLevelKey = Object.keys(newContract.usageLevels[serviceKey])[0];
      const usageLevel = newContract.usageLevels[serviceKey][usageLevelKey];

      expect(usageLevel.consumed).toBe(0);

      const response = await request(app)
        .put(`/api/contracts/${newContract.userContact.userId}/usageLevels`)
        .send({
          [serviceKey]: {
            [usageLevelKey]: 5,
          },
        });

      expect(response.status).toBe(200);

      const updatedContract: TestContract = response.body;

      expect(updatedContract).toBeDefined();
      expect(updatedContract.userContact.userId).toBe(newContract.userContact.userId);
      expect(updatedContract.usageLevels[serviceKey][usageLevelKey].consumed).toBe(5);
    });

    it('Should return 200 and the novated contract: Given reset only', async function () {
      let newContract: TestContract = await createRandomContract(app);

      Object.values(newContract.usageLevels)
        .map((s: Record<string, UsageLevel>) => Object.values(s))
        .flat()
        .forEach((ul: UsageLevel) => {
          expect(ul.consumed).toBe(0);
        });

      newContract = await incrementAllUsageLevel(
        newContract.userContact.userId,
        newContract.usageLevels,
        app
      );

      Object.values(newContract.usageLevels)
        .map((s: Record<string, UsageLevel>) => Object.values(s))
        .flat()
        .forEach((ul: UsageLevel) => {
          expect(ul.consumed).toBeGreaterThan(0);
        });

      const response = await request(app)
        .put(`/api/contracts/${newContract.userContact.userId}/usageLevels?reset=true`)
        .expect(200);

      const updatedContract: TestContract = response.body;

      expect(updatedContract).toBeDefined();
      expect(updatedContract.userContact.userId).toBe(newContract.userContact.userId);

      // All RENEWABLE limits are reset to 0
      Object.values(updatedContract.usageLevels)
        .map((s: Record<string, UsageLevel>) => Object.values(s))
        .flat()
        .forEach((ul: UsageLevel) => {
          if (ul.resetTimeStamp) {
            expect(ul.consumed).toBe(0);
          }
        });

      // All NON_RENEWABLE limits are not reset
      Object.values(updatedContract.usageLevels)
        .map((s: Record<string, UsageLevel>) => Object.values(s))
        .flat()
        .forEach((ul: UsageLevel) => {
          if (!ul.resetTimeStamp) {
            expect(ul.consumed).toBeGreaterThan(0);
          }
        });
    });

    it('Should return 200 and the novated contract: Given reset and disabled renewableOnly', async function () {
      let newContract: TestContract = await createRandomContract(app);

      Object.values(newContract.usageLevels)
        .map((s: Record<string, UsageLevel>) => Object.values(s))
        .flat()
        .forEach((ul: UsageLevel) => {
          expect(ul.consumed).toBe(0);
        });

      newContract = await incrementAllUsageLevel(
        newContract.userContact.userId,
        newContract.usageLevels,
        app
      );

      Object.values(newContract.usageLevels)
        .map((s: Record<string, UsageLevel>) => Object.values(s))
        .flat()
        .forEach((ul: UsageLevel) => {
          expect(ul.consumed).toBeGreaterThan(0);
        });

      const response = await request(app)
        .put(
          `/api/contracts/${newContract.userContact.userId}/usageLevels?reset=true&renewableOnly=false`
        )
        .expect(200);

      const updatedContract: TestContract = response.body;

      expect(updatedContract).toBeDefined();
      expect(updatedContract.userContact.userId).toBe(newContract.userContact.userId);

      // All usage levels are reset to 0
      Object.values(updatedContract.usageLevels)
        .map((s: Record<string, UsageLevel>) => Object.values(s))
        .flat()
        .forEach((ul: UsageLevel) => {
          expect(ul.consumed).toBe(0);
        });
    });

    it('Should return 200 and the novated contract: Given usageLimit', async function () {
      let newContract: TestContract = await createRandomContract(app);

      Object.values(newContract.usageLevels)
        .map((s: Record<string, UsageLevel>) => Object.values(s))
        .flat()
        .forEach((ul: UsageLevel) => {
          expect(ul.consumed).toBe(0);
        });

      newContract = await incrementAllUsageLevel(
        newContract.userContact.userId,
        newContract.usageLevels,
        app
      );

      Object.values(newContract.usageLevels)
        .map((s: Record<string, UsageLevel>) => Object.values(s))
        .flat()
        .forEach((ul: UsageLevel) => {
          expect(ul.consumed).toBeGreaterThan(0);
        });

      const serviceKey = Object.keys(newContract.usageLevels)[0];
      const sampleUsageLimitKey = Object.keys(newContract.usageLevels[serviceKey])[0];

      const response = await request(app)
        .put(
          `/api/contracts/${newContract.userContact.userId}/usageLevels?usageLimit=${sampleUsageLimitKey}`
        );

      expect(response.status).toBe(200);
        
      const updatedContract: TestContract = response.body;

      expect(updatedContract).toBeDefined();
      expect(updatedContract.userContact.userId).toBe(newContract.userContact.userId);

      // Check if all usage levels are greater than 0, except the one specified in the query
      Object.entries(updatedContract.usageLevels).forEach(([serviceKey, usageLimits]) => {
        Object.entries(usageLimits).forEach(([usageLimitKey, usageLevel]) => {
          if (usageLimitKey === sampleUsageLimitKey) {
            expect(usageLevel.consumed).toBe(0);
          } else {
            expect(usageLevel.consumed).toBeGreaterThan(0);
          }
        });
      });
    });

    it('Should return 404: Given reset and usageLimit', async function () {

      const newContract: TestContract = await createRandomContract(app);

      await request(app)
        .put(
          `/api/contracts/${newContract.userContact.userId}/usageLevels?reset=true&usageLimit=test`
        ).expect(400);
    });

    it('Should return 404: Given invalid usageLimit', async function () {

      const newContract: TestContract = await createRandomContract(app);

      await request(app)
        .put(
          `/api/contracts/${newContract.userContact.userId}/usageLevels?usageLimit=invalid-usage-limit`
        ).expect(404);
    });

    it('Should return 422: Given invalid body', async function () {

      const newContract: TestContract = await createRandomContract(app);

      await request(app)
        .put(
          `/api/contracts/${newContract.userContact.userId}/usageLevels`
        )
        .send({
          test: "invalid object"
        })
        .expect(422);
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

import dotenv from 'dotenv';
import request from 'supertest';
import { getApp, shutdownApp } from './utils/testApp';
import { Server } from 'http';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { generateFakeUser, userCredentials } from './utils/testData';
import { getLoggedInAdmin, getLoggedInUser, getNewloggedInUser } from './utils/auth';

dotenv.config();

describe('Get public user information', function () {
  let app: Server;

  beforeAll(async function () {
    app = await getApp();
  });

  describe('GET /services', function () {
    it('Should return 200 and the services', async function () {
      const response = await request(app).get('/api/services');
      expect(response.status).toEqual(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  })

  describe('GET /services/{serviceName}', function () {
    it('Should return 200: Given existent service name in lower case', async function () {
      const response = await request(app).get('/api/services/zoom');
      expect(response.status).toEqual(200);
      expect(Array.isArray(response.body)).toBe(false);
      expect(response.body.name.toLowerCase()).toBe("zoom");
    });

    it('Should return 200: Given existent service name in upper case', async function () {
      const response = await request(app).get('/api/services/ZOOM');
      expect(response.status).toEqual(200);
      expect(Array.isArray(response.body)).toBe(false);
      expect(response.body.name.toLowerCase()).toBe("zoom");
    });

    it('Should return 404 due to service not found', async function () {
      const response = await request(app).get('/api/services/unexistent-service');
      expect(response.status).toEqual(404);
      expect(response.body.error).toBe("Service unexistent-service not found");
    });
  })

  describe('GET /services/{serviceName}/pricings', function () {
    it('Should return 200: Given existent service name in lower case', async function () {
      const response = await request(app).get('/api/services/zoom/pricings');
      expect(response.status).toEqual(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].features).toBeDefined();
      expect(Object.keys(response.body[0].features).length).toBeGreaterThan(0);
      expect(response.body[0].usageLimits).toBeDefined();
      expect(response.body[0].plans).toBeDefined();
      expect(response.body[0].addOns).toBeDefined();
    });

    it('Should return 200: Given existent service name in upper case', async function () {
      const response = await request(app).get('/api/services/ZOOM/pricings');
      expect(response.status).toEqual(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].features).toBeDefined();
      expect(Object.keys(response.body[0].features).length).toBeGreaterThan(0);
      expect(response.body[0].usageLimits).toBeDefined();
      expect(response.body[0].plans).toBeDefined();
      expect(response.body[0].addOns).toBeDefined();
    });

    it('Should return 404 due to service not found', async function () {
      const response = await request(app).get('/api/services/unexistent-service/pricings');
      expect(response.status).toEqual(404);
      expect(response.body.error).toBe("Service unexistent-service not found");
    });
  })

  afterAll(async function () {
    await shutdownApp();
  });
});

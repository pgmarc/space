import request from 'supertest';
import { baseUrl, getApp, shutdownApp } from './utils/testApp';
import { Server } from 'http';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Features API Test Suite', function () {
  let app: Server;

  beforeAll(async function () {
    app = await getApp();
  });

  describe('GET /features', function () {
    it('Should return 200 and the features', async function () {
      const response = await request(app).get(`${baseUrl}/features?show=all`);
      
      expect(response.status).toEqual(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  afterAll(async function () {
    await shutdownApp();
  });
});

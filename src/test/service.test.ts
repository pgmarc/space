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
    });
  })

  afterAll(async function () {
    await shutdownApp();
  });
});

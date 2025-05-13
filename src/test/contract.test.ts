import dotenv from 'dotenv';
import request from 'supertest';
import { getApp, shutdownApp } from './utils/testApp';
import { Server } from 'http';
import { describe, it, expect, beforeAll, afterAll, afterEach, test } from 'vitest';
import { ExpectedPricingType } from '../main/utils/pricing-yaml2json';
import { createRandomService, createService, getPricingFile } from './utils/services/service';
import { zoomPricingPath } from './utils/services/ServiceTestData';
import { retrievePricingFromPath } from 'pricing4ts/server';

dotenv.config();

describe('Contract API Test Suite', function () {
  let app: Server;

  const testUserId = "9cd3c5c9-f5df-4307-a5b7-b51386228180";

  beforeAll(async function () {
    app = await getApp();
  });

  describe('GET /contracts', function () {
    it('Should return 200 and the services', async function () {
      // TODO: Add a test for the contract API
    });
  });

  afterAll(async function () {
    await shutdownApp();
  });
});

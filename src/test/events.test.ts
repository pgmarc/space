import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { io, Socket } from 'socket.io-client';
import request from 'supertest';
import { baseUrl, getApp, shutdownApp } from './utils/testApp';
import { Server } from 'http';
import { cleanupAuthResources, getTestAdminApiKey, getTestAdminUser } from './utils/auth';
import { getRandomPricingFile } from './utils/services/service';

describe('Events API Test Suite', function () {
  let app: Server;
  let adminApiKey: string;
  let socketClient: Socket;
  let pricingNamespace: Socket;

  beforeAll(async function () {
    app = await getApp();
    // Get admin user and api key for testing
    await getTestAdminUser();
    adminApiKey = await getTestAdminApiKey();

    // Create a socket.io client for testing
    socketClient = io(`ws://localhost:3000`, {
      path: '/events',
      autoConnect: false,
    });

    // Create a namespace client for pricing events
    pricingNamespace = socketClient.io.socket('/pricings');
  });

  afterEach(async function () {
    // Disconnect socket after each test to ensure clean state
    if (pricingNamespace.connected) {
      pricingNamespace.disconnect();
    }
  });

  afterAll(async function () {
    // Ensure socket disconnection
    if (pricingNamespace.connected) {
      pricingNamespace.disconnect();
    }

    // Cleanup authentication resources
    await cleanupAuthResources();
    await shutdownApp();
  });

  describe('WebSocket Connection', function () {
    it('Should connect to the WebSocket server successfully', async () => {
      await new Promise((resolve, reject) => {
        // Set up connection event handler before connecting
        pricingNamespace.on('connect', () => {
          expect(pricingNamespace.connected).toBe(true);
          resolve(true);
        });

        // Set up error handler
        pricingNamespace.on('connect_error', err => {
          reject(err);
        });

        // Connect to the WebSocket server
        pricingNamespace.connect();
      });
    });
  });

  describe('Events API Endpoints', function () {
    it('Should return status 200 when checking event service status', async function () {
      const response = await request(app)
        .get(`${baseUrl}/events/status`)
        .set('x-api-key', adminApiKey);

      expect(response.status).toEqual(200);
      expect(response.body).toBeDefined();
      expect(response.body.status).toBeDefined();
    });

    it('Should emit test event via API endpoint', async () => {
      await new Promise<void>((resolve, reject) => {
        // Connect to the WebSocket server
        pricingNamespace.connect();

        // Set up message event handler
        pricingNamespace.on('message', data => {
          try {
            expect(data).toBeDefined();
            expect(data.code).toEqual('PRICING_CHANGE');
            expect(data.details).toBeDefined();
            expect(data.details.serviceName).toEqual('test-service');
            expect(data.details.pricingVersion).toEqual('2025');
            resolve();
          } catch (error) {
            reject(error);
          }
        });

        // Wait for connection before sending test event
        pricingNamespace.on('connect', async () => {
          try {
            // Send test event via API
            await request(app)
              .post(`${baseUrl}/events/test-event`)
              .set('x-api-key', adminApiKey)
              .send({
                serviceName: 'test-service',
                pricingVersion: '2025',
              });
          } catch (error) {
            reject(error);
          }
        });

        // Handle connection errors
        pricingNamespace.on('connect_error', err => {
          reject(err);
        });
      });
    });
  });

  describe('Pricing Change Events', function () {
    it('Should emit event when uploading a new pricing file', async () => {
      await new Promise<void>(async (resolve, reject) => {
        // Connect to the WebSocket server
        pricingNamespace.connect();

        // Set up message event handler
        pricingNamespace.on('message', data => {
          try {
            expect(data).toBeDefined();
            expect(data.code).toEqual('PRICING_CHANGE');
            expect(data.details).toBeDefined();
            expect(data.details.serviceName).toBeDefined();
            expect(data.details.pricingVersion).toBeDefined();
            resolve();
          } catch (error) {
            reject(error);
          }
        });

        // Wait for connection before uploading pricing
        pricingNamespace.on('connect', async () => {
          try {
            const pricingFile = await getRandomPricingFile();

            // Upload a pricing file which should trigger an event
            await request(app)
              .post(`${baseUrl}/services`)
              .set('x-api-key', adminApiKey)
              .attach('pricingFile', pricingFile);
          } catch (error) {
            reject(error);
          }
        });

        // Handle connection errors
        pricingNamespace.on('connect_error', err => {
          reject(err);
        });
      });
    });

    it('Should emit event when changing pricing availability', async () => {
      await new Promise<void>(async (resolve, reject) => {
        // This test requires an existing service with at least two pricings
        const serviceName = 'Zoom'; // Assuming Zoom service exists with multiple pricings
        const pricingVersion = '2025'; // Use a version we know exists

        // Connect to the WebSocket server
        pricingNamespace.connect();

        // Set up message event handler
        pricingNamespace.on('message', data => {
          try {
            expect(data).toBeDefined();
            expect(data.code).toEqual('PRICING_CHANGE');
            expect(data.details).toBeDefined();
            expect(data.details.serviceName).toEqual(serviceName);
            expect(data.details.pricingVersion).toEqual(pricingVersion);
            resolve();
          } catch (error) {
            reject(error);
          }
        });

        // Wait for connection before changing pricing availability
        pricingNamespace.on('connect', async () => {
          try {
            // First, check if service exists and has the required pricing
            const serviceResponse = await request(app)
              .get(`${baseUrl}/services/${serviceName}`)
              .set('x-api-key', adminApiKey);

            if (
              serviceResponse.status !== 200 ||
              !serviceResponse.body.activePricings[pricingVersion]
            ) {
              // Skip test if service or pricing doesn't exist
              console.log('Skipping test: Required service or pricing version not found');
              pricingNamespace.disconnect();
              resolve();
              return;
            }

            // Archive the pricing (requires a fallback subscription)
            await request(app)
              .put(`${baseUrl}/services/${serviceName}/pricings/${pricingVersion}/archive`)
              .set('x-api-key', adminApiKey)
              .send({
                fallBackSubscription: {
                  subscriptionPlan: 'basic',
                  subscriptionAddOns: [],
                },
              });
          } catch (error) {
            reject(error);
          }
        });

        // Handle connection errors
        pricingNamespace.on('connect_error', err => {
          reject(err);
        });
      });
    });

    it('Should emit event when deleting a pricing', async () => {
      await new Promise<void>(async (resolve, reject) => {
        // This test requires an existing service with at least two pricings
        const serviceName = 'Zoom'; // Assuming Zoom service exists with multiple pricings
        const pricingVersion = '2024'; // Use a different version to avoid conflicts with other tests

        // Connect to the WebSocket server
        pricingNamespace.connect();

        // Set up message event handler
        pricingNamespace.on('message', data => {
          try {
            expect(data).toBeDefined();
            expect(data.code).toEqual('PRICING_CHANGE');
            expect(data.details).toBeDefined();
            expect(data.details.serviceName).toEqual(serviceName);
            expect(data.details.pricingVersion).toEqual(pricingVersion);
            resolve();
          } catch (error) {
            reject(error);
          }
        });

        // Wait for connection before deleting pricing
        pricingNamespace.on('connect', async () => {
          try {
            // First, check if service exists and has the required pricing
            const serviceResponse = await request(app)
              .get(`${baseUrl}/services/${serviceName}`)
              .set('x-api-key', adminApiKey);

            if (
              serviceResponse.status !== 200 ||
              (!serviceResponse.body.activePricings[pricingVersion] &&
                !serviceResponse.body.archivedPricings[pricingVersion])
            ) {
              // Skip test if service or pricing doesn't exist
              console.log('Skipping test: Required service or pricing version not found');
              pricingNamespace.disconnect();
              resolve();
              return;
            }

            // If service has only one pricing, we can't delete it
            if (
              Object.keys(serviceResponse.body.activePricings).length === 1 &&
              serviceResponse.body.activePricings[pricingVersion]
            ) {
              console.log('Skipping test: Cannot delete the only active pricing');
              pricingNamespace.disconnect();
              resolve();
              return;
            }

            // Delete the pricing
            await request(app)
              .delete(`${baseUrl}/services/${serviceName}/pricings/${pricingVersion}`)
              .set('x-api-key', adminApiKey);
          } catch (error) {
            reject(error);
          }
        });

        // Handle connection errors
        pricingNamespace.on('connect_error', err => {
          reject(err);
        });
      });
    });
  });
});

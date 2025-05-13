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

describe('Services API Test Suite', function () {
  let app: Server;

  const testService = "Zoom";

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
  });

  describe('POST /services', function () {
    it('Should return 201 and the created service: Given Pricing2Yaml file in the request', async function () {
      const pricingFilePath = getPricingFile();
      const response = await request(app)
        .post('/api/services')
        .attach('pricing', pricingFilePath);
      expect(response.status).toEqual(201);
      expect(response.body).toBeDefined();
      expect(Object.keys(response.body.activePricings).length).greaterThan(0);
      expect((Object.values(response.body.activePricings)[0] as any).id).toBeDefined();
      expect((Object.values(response.body.activePricings)[0] as any).url).toBeUndefined();
      expect(response.body.archivedPricings).toBeUndefined();
    });

    it('Should return 201 and the created service: Given Pricing2Yaml file in the request', async function () {
      const createdService = await createService();
      expect(Object.keys(createdService.activePricings).length).greaterThan(0);
      expect((Object.values(createdService.activePricings)[0] as any).id).toBeDefined();
      expect((Object.values(createdService.activePricings)[0] as any).url).toBeUndefined();
      expect(createdService.archivedPricings).toBeUndefined();
    });

    it('Should return 201 and the created service: Given Pricing2Yaml file in the request', async function () {
      const createdService = await createService("github");
      expect(Object.keys(createdService.activePricings).length).greaterThan(0);
      expect((Object.values(createdService.activePricings)[0] as any).id).toBeDefined();
      expect((Object.values(createdService.activePricings)[0] as any).url).toBeUndefined();
      expect(createdService.archivedPricings).toBeUndefined();
    });

    it('Should return 201 and the created service: Given url in the request', async function () {
      const response = await request(app)
        .post('/api/services')
        .send({
          pricing: "https://sphere.score.us.es/static/collections/63f74bf8eeed64058364b52e/IEEE TSC 2025/notion/2025.yml",
        });
      expect(response.status).toEqual(201);
      expect(response.body).toBeDefined();
      expect(Object.keys(response.body.activePricings).length).greaterThan(0);
      expect((Object.values(response.body.activePricings)[0] as any).id).toBeUndefined();
      expect((Object.values(response.body.activePricings)[0] as any).url).toBeDefined();
      expect(response.body.archivedPricings).toBeUndefined();
    });
  });

  describe('GET /services/{serviceName}', function () {
    it('Should return 200: Given existent service name in lower case', async function () {
      const response = await request(app).get(`/api/services/${testService.toLowerCase()}`);
      expect(response.status).toEqual(200);
      expect(Array.isArray(response.body)).toBe(false);
      expect(response.body.name.toLowerCase()).toBe("zoom");
    });

    it('Should return 200: Given existent service name in upper case', async function () {
      const response = await request(app).get(`/api/services/${testService.toUpperCase()}`);
      expect(response.status).toEqual(200);
      expect(Array.isArray(response.body)).toBe(false);
      expect(response.body.name.toLowerCase()).toBe(testService.toLowerCase());
    });

    it('Should return 404 due to service not found', async function () {
      const response = await request(app).get('/api/services/unexistent-service');
      expect(response.status).toEqual(404);
      expect(response.body.error).toBe("Service unexistent-service not found");
    });
  });

  describe('PUT /services/{serviceName}', function () {
    it('Should return 200 and the updated pricing', async function () {
      
      const newName = "New Zoom";
      
      const responseBefore = await request(app).get(`/api/services/${testService}`);
      expect(responseBefore.status).toEqual(200);
      expect(responseBefore.body.name.toLowerCase()).toBe(testService.toLowerCase());

      const responseUpdate = await request(app).put(`/api/services/${testService}`).send({name: newName});
      expect(responseUpdate.status).toEqual(200);
      expect(responseUpdate.body).toBeDefined();
      expect(responseUpdate.body.name).toEqual(newName);

      const responseAfter = await request(app).get(`/api/services/${newName}`);
      expect(responseAfter.status).toEqual(200);
      expect(responseAfter.body.name.toLowerCase()).toBe(newName.toLowerCase());

      await request(app).put(`/api/services/${testService.toLowerCase()}`).send({name: testService});
    });

    it('Should return 200: Given existent service name in upper case', async function () {
      const response = await request(app).get(`/api/services/${testService.toUpperCase()}`);
      expect(response.status).toEqual(200);
      expect(Array.isArray(response.body)).toBe(false);
      expect(response.body.name.toLowerCase()).toBe(testService.toLowerCase());
    });

    it('Should return 404 due to service not found', async function () {
      const response = await request(app).get('/api/services/unexistent-service');
      expect(response.status).toEqual(404);
      expect(response.body.error).toBe("Service unexistent-service not found");
    });
  });

  describe('DELETE /services/{serviceName}', function () {
    it('Should return 204', async function () {
      
      const createdService = await createRandomService();
      
      const responseBefore = await request(app).get(`/api/services/${createdService.name}`);
      expect(responseBefore.status).toEqual(200);
      expect(responseBefore.body.name.toLowerCase()).toBe(createdService.name.toLowerCase());

      const responseDelete = await request(app).delete(`/api/services/${createdService.name}`);
      expect(responseDelete.status).toEqual(204);

      const responseAfter = await request(app).get(`/api/services/${createdService.name}`);
      expect(responseAfter.status).toEqual(404);
    });
  });

  describe('GET /services/{serviceName}/pricings', function () {
    it('Should return 200: Given existent service name in lower case', async function () {
      const response = await request(app).get(`/api/services/${testService}/pricings`);
      expect(response.status).toEqual(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].features).toBeDefined();
      expect(Object.keys(response.body[0].features).length).toBeGreaterThan(0);
      expect(response.body[0].usageLimits).toBeDefined();
      expect(response.body[0].plans).toBeDefined();
      expect(response.body[0].addOns).toBeDefined();

      const serviceResponse = await request(app).get(`/api/services/${testService}`);
      expect(serviceResponse.status).toEqual(200);
      expect(serviceResponse.body.name.toLowerCase()).toBe(testService.toLowerCase());
      expect(response.body.map((p: ExpectedPricingType) => p.version).sort()).toEqual(Object.keys(serviceResponse.body.activePricings).sort());
    });

    it('Should return 200: Given existent service name in lower case and "archived" in query', async function () {
      const response = await request(app).get(`/api/services/${testService}/pricings?pricingStatus=archived`);
      expect(response.status).toEqual(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].features).toBeDefined();
      expect(Object.keys(response.body[0].features).length).toBeGreaterThan(0);
      expect(response.body[0].usageLimits).toBeDefined();
      expect(response.body[0].plans).toBeDefined();
      expect(response.body[0].addOns).toBeDefined();

      const serviceResponse = await request(app).get(`/api/services/${testService}`);
      expect(serviceResponse.status).toEqual(200);
      expect(serviceResponse.body.name.toLowerCase()).toBe(testService.toLowerCase());
      expect(response.body.map((p: ExpectedPricingType) => p.version).sort()).toEqual(Object.keys(serviceResponse.body.archivedPricings).sort());
    });

    it('Should return 200: Given existent service name in upper case', async function () {
      const response = await request(app).get(`/api/services/${testService}/pricings`);
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
  });

  describe('POST /services/{serviceName}/pricings', function () {
    
    const versionToAdd = "2025";
    
    it('Should return 200', async function () {
      const responseBefore = await request(app).get(`/api/services/${testService}`);
      expect(responseBefore.status).toEqual(200);
      expect(responseBefore.body.activePricings).toBeDefined();

      const previousActivePricingsAmount = Object.keys(responseBefore.body.activePricings).length;
      
      const newPricingVersion = zoomPricingPath;
      
      const response = await request(app).post(`/api/services/${testService}/pricings`).attach('pricing', newPricingVersion);
      expect(response.status).toEqual(201);
      expect(responseBefore.body.activePricings).toBeDefined();
      const newActivePricingsAmount = Object.keys(response.body.activePricings).length;
      expect(newActivePricingsAmount).toBeGreaterThan(previousActivePricingsAmount);

      // Check if the new pricing is the latest in activePricings
      const parsedPricing = retrievePricingFromPath(newPricingVersion);
      expect(Object.keys(response.body.activePricings)[newActivePricingsAmount - 1]).toBe(parsedPricing.version);
    });

    it('Should return 200 given a pricing with a link', async function () {
      const responseBefore = await request(app).get(`/api/services/${testService}`);
      expect(responseBefore.status).toEqual(200);
      expect(responseBefore.body.activePricings).toBeDefined();

      const previousActivePricingsAmount = Object.keys(responseBefore.body.activePricings).length;
      
      const response = await request(app).post(`/api/services/${testService}/pricings`).send({ pricing: "https://sphere.score.us.es/static/collections/63f74bf8eeed64058364b52e/IEEE TSC 2025/zoom/2025.yml"});
      
      expect(response.status).toEqual(201);
      expect(responseBefore.body.activePricings).toBeDefined();
      expect(Object.keys(response.body.activePricings).length).toBeGreaterThan(previousActivePricingsAmount);
    });

    afterEach(async function () {
      await request(app).delete(`/api/services/${testService}/pricings/${versionToAdd}`);
    });
  });

  describe('GET /services/{serviceName}/pricings/{pricingVersion}', function () {
    it('Should return 200: Given existent service name and pricing version', async function () {
      const response = await request(app).get(`/api/services/${testService}/pricings/2024`);
      expect(response.status).toEqual(200);
      expect(response.body.features).toBeDefined();
      expect(Object.keys(response.body.features).length).toBeGreaterThan(0);
      expect(response.body.usageLimits).toBeDefined();
      expect(response.body.plans).toBeDefined();
      expect(response.body.addOns).toBeDefined();
      expect(response.body.id).toBeUndefined();
      expect(response.body._serviceName).toBeUndefined();
      expect(response.body._id).toBeUndefined();
    });

    it('Should return 200: Given existent service name in upper case and pricing version', async function () {
      const response = await request(app).get(`/api/services/${testService}/pricings/2024`);
      expect(response.status).toEqual(200);
      expect(response.body.features).toBeDefined();
      expect(Object.keys(response.body.features).length).toBeGreaterThan(0);
      expect(response.body.usageLimits).toBeDefined();
      expect(response.body.plans).toBeDefined();
      expect(response.body.addOns).toBeDefined();
      expect(response.body.id).toBeUndefined();
      expect(response.body._serviceName).toBeUndefined();
      expect(response.body._id).toBeUndefined();
    });

    it('Should return 404 due to service not found', async function () {
      const response = await request(app).get('/api/services/unexistent-service/pricings/2024');
      expect(response.status).toEqual(404);
      expect(response.body.error).toBe("Service unexistent-service not found");
    });

    it('Should return 404 due to pricing not found', async function () {
      const response = await request(app).get(`/api/services/${testService}/pricings/unexistent-version`);
      expect(response.status).toEqual(404);
      expect(response.body.error).toBe(`Pricing version unexistent-version not found for service ${testService}`);
    });
  });

  describe('PUT /services/{serviceName}/pricings/{pricingVersion}', function () {
    
    const versionToArchive = "2024";
    
    it('Should return 200: Changing visibility using default value', async function () {
      const responseBefore = await request(app).get(`/api/services/${testService}`);
      expect(responseBefore.status).toEqual(200);
      expect(responseBefore.body.activePricings).toBeDefined();
      expect(Object.keys(responseBefore.body.activePricings).includes(versionToArchive)).toBeTruthy();
      expect(Object.keys(responseBefore.body.archivedPricings).includes(versionToArchive)).toBeFalsy();
      
      const responseUpdate = await request(app).put(`/api/services/${testService}/pricings/${versionToArchive}`);
      expect(responseUpdate.status).toEqual(200);
      expect(responseUpdate.body.activePricings).toBeDefined();
      expect(Object.keys(responseUpdate.body.activePricings).includes(versionToArchive)).toBeFalsy();
      expect(Object.keys(responseUpdate.body.archivedPricings).includes(versionToArchive)).toBeTruthy();
    });

    it('Should return 200: Changing visibility using "archived"', async function () {
      const responseBefore = await request(app).get(`/api/services/${testService}`);
      expect(responseBefore.status).toEqual(200);
      expect(responseBefore.body.activePricings).toBeDefined();
      expect(Object.keys(responseBefore.body.activePricings).includes(versionToArchive)).toBeTruthy();
      expect(Object.keys(responseBefore.body.archivedPricings).includes(versionToArchive)).toBeFalsy();
      
      const responseUpdate = await request(app).put(`/api/services/${testService}/pricings/${versionToArchive}?availability=archived`);
      expect(responseUpdate.status).toEqual(200);
      expect(responseUpdate.body.activePricings).toBeDefined();
      expect(Object.keys(responseUpdate.body.activePricings).includes(versionToArchive)).toBeFalsy();
      expect(Object.keys(responseUpdate.body.archivedPricings).includes(versionToArchive)).toBeTruthy();
    });

    it('Should return 200: Changing visibility using "active"', async function () {
      const responseBefore = await request(app).put(`/api/services/${testService}/pricings/${versionToArchive}`);
      expect(responseBefore.status).toEqual(200);
      expect(responseBefore.body.activePricings).toBeDefined();
      expect(Object.keys(responseBefore.body.activePricings).includes(versionToArchive)).toBeFalsy();
      expect(Object.keys(responseBefore.body.archivedPricings).includes(versionToArchive)).toBeTruthy();

      const responseUpdate = await request(app).put(`/api/services/${testService}/pricings/${versionToArchive}?availability=active`);
      expect(responseUpdate.status).toEqual(200);
      expect(responseUpdate.body.activePricings).toBeDefined();
      expect(Object.keys(responseUpdate.body.activePricings).includes(versionToArchive)).toBeTruthy();
      expect(Object.keys(responseUpdate.body.archivedPricings).includes(versionToArchive)).toBeFalsy();
    });

    it('Should return 400: Changing visibility using "invalidValue"', async function () {  
      const responseUpdate = await request(app).put(`/api/services/${testService}/pricings/${versionToArchive}?availability=invalidValue`);
      expect(responseUpdate.status).toEqual(400);
      expect(responseUpdate.body.error).toBe("Invalid availability status. Either provide \"active\" or \"archived\"");
    });

    it('Should return 400: Changing visibility to archived when is the last activePricing', async function () {
      await request(app).put(`/api/services/${testService}/pricings/${versionToArchive}`);
      
      const lastVersionToArchive = "2023";
      
      const responseUpdate = await request(app).put(`/api/services/${testService}/pricings/${lastVersionToArchive}`);
      expect(responseUpdate.status).toEqual(400);
      expect(responseUpdate.body.error).toBe(`You cannot archive the last active pricing for service ${testService}`);
    });

    afterEach(async function () {
      await request(app).put(`/api/services/${testService}/pricings/${versionToArchive}?availability=active`);
    });
  });

  describe('DELETE /services/{serviceName}/pricings/{pricingVersion}', function () {
    it('Should return 204', async function () {

      const versionToDelete = "2025";

      const responseBefore = await request(app).post(`/api/services/${testService}/pricings`).attach('pricing', zoomPricingPath);
      expect(responseBefore.status).toEqual(201);
      expect(responseBefore.body.activePricings).toBeDefined();
      expect(Object.keys(responseBefore.body.activePricings).includes(versionToDelete)).toBeTruthy();

      const responseDelete = await request(app).delete(`/api/services/${testService}/pricings/${versionToDelete}`);
      expect(responseDelete.status).toEqual(204);

      const responseAfter = await request(app).get(`/api/services/${testService}`);
      expect(responseAfter.status).toEqual(200);
      expect(responseAfter.body.activePricings).toBeDefined();
      expect(Object.keys(responseAfter.body.activePricings).includes(versionToDelete)).toBeFalsy();
    });

    it('Should return 404: Given an invalid pricing version', async function () {

      const versionToDelete = "invalid";

      const responseDelete = await request(app).delete(`/api/services/${testService}/pricings/${versionToDelete}`);
      expect(responseDelete.status).toEqual(404);
      expect(responseDelete.body.error).toBe(`Pricing version invalid not found for service ${testService}`);
    });

    it('Should return 400: Given last active pricing', async function () {

      await request(app).delete(`/api/services/${testService}/pricings/2023`);

      const responseDelete = await request(app).delete(`/api/services/${testService}/pricings/2024`);
      expect(responseDelete.status).toEqual(400);
      expect(responseDelete.body.error).toBe(`You cannot delete the last active pricing for service ${testService}`);
    });
  });

  describe('DELETE /services', function () {
    it('Should return 200', async function () {
      // Checks if there are services to delete
      const responseIndexBeforeDelete = await request(app)
        .get('/api/services');

      expect(responseIndexBeforeDelete.status).toEqual(200);
      expect(Array.isArray(responseIndexBeforeDelete.body)).toBe(true);
      expect(responseIndexBeforeDelete.body.length).greaterThan(0);

      // Deletes all services
      const responseDelete = await request(app)
        .delete('/api/services');
      expect(responseDelete.status).toEqual(200);

      // Checks if there are no services after delete
      const responseIndexAfterDelete = await request(app)
        .get('/api/services');

      expect(responseIndexAfterDelete.status).toEqual(200);
      expect(Array.isArray(responseIndexAfterDelete.body)).toBe(true);
      expect(responseIndexAfterDelete.body.length).toBe(0);
    });
  });

  afterAll(async function () {
    await shutdownApp();
  });
});

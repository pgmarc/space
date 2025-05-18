import request from 'supertest';
import { baseUrl, getApp, shutdownApp } from './utils/testApp';
import { Server } from 'http';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { LeanFeature } from '../main/types/models/FeatureEvaluation';
import { LeanService } from '../main/types/models/Service';
import { testUserId } from './utils/contracts/ContractTestData';
import { createRandomContract } from './utils/contracts/contracts';
import { v4 as uuidv4 } from 'uuid';

function isActivePricing(pricingVersion: string, service: LeanService): boolean {
  return Object.keys(service.activePricings).some(
    (activePricingVersion: string) => activePricingVersion === pricingVersion
  );
}

function isArchivedPricing(pricingVersion: string, service: LeanService): boolean {
  return Object.keys(service.archivedPricings).some(
    (archivedPricingVersion: string) => archivedPricingVersion === pricingVersion
  );
}

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
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('Should filter features by featureName', async function () {
      const featureName = 'meetings';
      const response = await request(app).get(`${baseUrl}/features?featureName=${featureName}`);

      expect(response.status).toEqual(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(
        response.body.some((feature: LeanFeature) => feature.info.name === featureName)
      ).toBeTruthy();
    });

    it('Should filter features by serviceName', async function () {
      const serviceName = 'zoom';
      const response = await request(app).get(`${baseUrl}/features?serviceName=${serviceName}`);

      expect(response.status).toEqual(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(
        response.body.every(
          (feature: LeanFeature) => feature.service.toLowerCase() === serviceName.toLowerCase()
        )
      ).toBeTruthy();
    });

    it('Should filter features by pricingVersion', async function () {
      const pricingVersion = '2024';
      const response = await request(app).get(
        `${baseUrl}/features?pricingVersion=${pricingVersion}`
      );

      expect(response.status).toEqual(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(
        response.body.every((feature: LeanFeature) => feature.pricingVersion === pricingVersion)
      ).toBeTruthy();
    });

    it('Should paginate results using page parameter', async function () {
      const page = 1;
      const limit = 5;
      const response = await request(app).get(`${baseUrl}/features?page=${page}&limit=${limit}`);

      expect(response.status).toEqual(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeLessThanOrEqual(limit);
    });

    it('Should paginate results using offset parameter', async function () {
      const offset = 2;
      const limit = 5;
      const response = await request(app).get(
        `${baseUrl}/features?offset=${offset}&limit=${limit}`
      );

      expect(response.status).toEqual(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeLessThanOrEqual(limit);
    });

    it('Should sort results by featureName in ascending order', async function () {
      const response = await request(app).get(`${baseUrl}/features?sort=featureName&order=asc`);

      expect(response.status).toEqual(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBeTruthy();

      // Check if sorted correctly
      const sortedFeatures = [...response.body].sort((a, b) =>
        a.info.name.localeCompare(b.info.name)
      );
      expect(response.body).toEqual(sortedFeatures);
    });

    it('Should sort results by serviceName in descending order', async function () {
      const response = await request(app).get(`${baseUrl}/features?sort=serviceName&order=desc`);

      expect(response.status).toEqual(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBeTruthy();

      // Check if sorted correctly
      const sortedFeatures = [...response.body].sort((a, b) => b.service.localeCompare(a.service));
      expect(response.body).toEqual(sortedFeatures);
    });

    it('Should show only active features by default', async function () {
      const response = await request(app).get(`${baseUrl}/features`);
      const responseServices = await request(app).get(`${baseUrl}/services`);

      const services = responseServices.body;

      expect(response.status).toEqual(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBeTruthy();
      // For each feature, check that its pricing version is active for its corresponding service
      expect(
        response.body.every((feature: LeanFeature) => {
          const service = services.find((s: LeanService) => s.name === feature.service);
          return service && isActivePricing(feature.pricingVersion, service);
        })
      ).toBeTruthy();
    });

    it('Should show only archived features when specified', async function () {
      const response = await request(app).get(`${baseUrl}/features?show=archived`);
      const responseServices = await request(app).get(`${baseUrl}/services`);

      const services = responseServices.body;

      expect(response.status).toEqual(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(
        response.body.every((feature: LeanFeature) => {
          const service = services.find((s: LeanService) => s.name === feature.service);
          return service && isArchivedPricing(feature.pricingVersion, service);
        })
      ).toBeTruthy();
    });

    it('Should combine multiple query parameters correctly', async function () {
      const serviceName = 'zoom';
      const limit = 5;
      const sort = 'featureName';

      const response = await request(app).get(
        `${baseUrl}/features?serviceName=${serviceName}&limit=${limit}&sort=${sort}`
      );

      expect(response.status).toEqual(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeLessThanOrEqual(limit);
      expect(
        response.body.every(
          (feature: LeanFeature) => feature.service.toLowerCase() === serviceName.toLowerCase()
        )
      ).toBeTruthy();

      // Check if sorted correctly
      const sortedFeatures = [...response.body].sort((a, b) =>
        a.info.name.localeCompare(b.info.name)
      );
      expect(response.body).toEqual(sortedFeatures);
    });

    it('Should handle invalid query parameters gracefully', async function () {
      const response = await request(app).get(`${baseUrl}/features?invalidParam=value`);

      expect(response.status).toEqual(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });

  describe('GET /features/:userId', function () {
    it('Should return 200 and the feature evaluation for a user', async function () {
      const createServiceResponse = await request(app)
        .post(`${baseUrl}/services`)
        .attach('pricing', 'src/test/data/pricings/petclinic-2025.yml');

      const petclinicService = createServiceResponse.body;

      const createContractResponse = await request(app)
        .post(`${baseUrl}/contracts`)
        .send({
          userContact: {
            userId: uuidv4(),
            username: 'tUser',
          },
          billingPeriod: {
            autoRenew: true,
            renewalDays: 365,
          },
          contractedServices: {
            [petclinicService.name]: Object.keys(petclinicService.activePricings)[0],
          },
          subscriptionPlans: {
            [petclinicService.name]: "GOLD"
          },
          subscriptionAddOns: {
            [petclinicService.name]: {
              petAdoptionCentre: 1,
              extraPets: 2,
              extraVisits: 6
            }
          }
        });

      const newContract = createContractResponse.body;

      const response = await request(app).get(
        `${baseUrl}/features/${newContract.userContact.userId}`
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        "petclinic-pets": true,
        "petclinic-visits": true,
        "petclinic-calendar": true,
        "petclinic-vetSelection": true,
        "petclinic-consultations": false,
        "petclinic-petsDashboard": false,
        "petclinic-lowSupportPriority": true,
        "petclinic-mediumSupportPriority": true,
        "petclinic-highSupportPriority": false,
        "petclinic-slaCoverage": true,
        "petclinic-petAdoptionCentre": true,
        "petclinic-smartClinicReports": false,
      })
    });
  });

  afterAll(async function () {
    await shutdownApp();
  });
});

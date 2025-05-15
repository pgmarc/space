import fs from 'fs';
import request from 'supertest';
import { baseUrl, getApp } from '../testApp';
import { clockifyPricingPath, githubPricingPath, zoomPricingPath } from './ServiceTestData';
import { generatePricingFile } from './pricing';
import { faker } from '@faker-js/faker';
import { TestService } from '../../types/models/Service';
import { TestPricing } from '../../types/models/Pricing';

function getRandomPricingFile(name?: string) {
  return generatePricingFile(name);
}

async function getAllServices(app?: any): Promise<TestService[]> {
  let appCopy = app;

  if (!app) {
    appCopy = getApp();
  }

  const services = await request(appCopy).get(`${baseUrl}/services`);

  return services.body;
}

async function getPricingFromService(
  serviceName: string,
  pricingVersion: string,
  app?: any
): Promise<TestPricing> {
  let appCopy = app;

  if (!app) {
    appCopy = getApp();
  }

  const pricing = await request(appCopy).get(
    `${baseUrl}/services/${serviceName}/pricings/${pricingVersion}`
  );

  return pricing.body;
}

async function getRandomService(app?: any): Promise<TestService> {
  let appCopy = app;

  if (!app) {
    appCopy = await getApp();
  }

  const response = await request(appCopy).get(`${baseUrl}/services`);

  if (response.status !== 200) {
    throw new Error(`Failed to get services data: ${response.text}`);
  }

  const services = response.body;

  if (!services || services.length === 0) {
    throw new Error('No services found');
  }

  const randomIndex = Math.floor(Math.random() * services.length);
  const randomService = services[randomIndex];

  if (!randomService) {
    throw new Error('Random service not found');
  }

  return randomService;
}

async function getService(serviceName: string, app?: any): Promise<TestService> {
  let appCopy = app;

  if (!app) {
    appCopy = await getApp();
  }

  const response = await request(appCopy).get(`${baseUrl}/services/${serviceName}`);

  if (response.status !== 200) {
    throw new Error(`Failed to get service data: ${response.text}`);
  }

  const service = response.body;

  if (!service) {
    throw new Error(`Service not found: ${serviceName}`);
  }

  return service;
}

/**
 * Asynchronously creates a service by sending a POST request to the `${baseUrl}/services` endpoint
 * with a pricing file attached. The pricing file path is determined based on the provided
 * service name.
 *
 * @param testService - The name of the service to create. Supported values are:
 *   - `'github'`: Uses the `githubPricingPath` file.
 *   - `'zoom'`: Uses the `zoomPricingPath` file.
 *   - `'clockify'`: Uses the `clockifyPricingPath` file.
 *   - If the service name does not match any of the above, the default is `clockifyPricingPath`.
 *
 * @returns A promise that resolves to the created service object if the request is successful.
 *
 * @throws An error if:
 *   - The pricing file does not exist at the determined path.
 *   - The service creation request fails (response status is not 201).
 */
async function createService(testService?: string) {
  let pricingFilePath;

  switch ((testService ?? '').toLowerCase()) {
    case 'github':
      pricingFilePath = githubPricingPath;
      break;
    case 'zoom':
      pricingFilePath = zoomPricingPath;
      break;
    case 'clockify':
      pricingFilePath = clockifyPricingPath;
      break;
    default:
      pricingFilePath = clockifyPricingPath;
  }

  if (fs.existsSync(pricingFilePath)) {
    const app = await getApp();

    const response = await request(app)
      .post(`${baseUrl}/services`)
      .attach('pricing', pricingFilePath);

    if (response.status !== 201) {
      throw new Error(`Failed to create service: ${response.text}`);
    }
    const service = response.body;

    return service;
  } else {
    throw new Error(`File not found at ${pricingFilePath}`);
  }
}

async function createRandomService(app?: any) {
  let appCopy = app;

  if (!app) {
    appCopy = await getApp();
  }

  const pricingFilePath = await generatePricingFile(
    faker.word.noun({ length: { min: 3, max: 10 } })
  );
  const response = await request(appCopy)
    .post(`${baseUrl}/services`)
    .attach('pricing', pricingFilePath);

  if (response.status !== 201) {
    throw new Error(`Failed to create service: ${response.text}`);
  }
  const service = response.body;

  return service;
}

async function deletePricingFromService(
  serviceName: string,
  pricingVersion: string,
  app?: any
): Promise<void> {
  let appCopy = app;

  if (!app) {
    appCopy = await getApp();
  }

  const response = await request(appCopy).delete(
    `${baseUrl}/services/${serviceName}/pricings/${pricingVersion}`
  );

  if (response.status !== 204 && response.status !== 404) {
    throw new Error(`Failed to delete pricing: ${response.text}`);
  }
}

export {
  getAllServices,
  getRandomPricingFile,
  getService,
  getPricingFromService,
  getRandomService,
  createService,
  createRandomService,
  deletePricingFromService,
};

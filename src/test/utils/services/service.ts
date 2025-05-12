import fs from 'fs';
import request from 'supertest';
import { getApp } from '../testApp';
import { clockifyPricingPath, githubPricingPath, zoomPricingPath } from './ServiceTestData';
import { faker } from '@faker-js/faker';
import { Feature, UsageLimit, Plan, AddOn, Pricing } from '../../../types/models/Pricing';


function getPricingFile(){
  const filePath = zoomPricingPath;
  if (fs.existsSync(filePath)) {
    return filePath;
  } else {
    throw new Error(`File not found at ${filePath}`);
  }
}

/**
 * Asynchronously creates a service by sending a POST request to the `/api/services` endpoint
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
async function createService(testService?: string){
  let pricingFilePath;

  switch((testService ?? "").toLowerCase()){
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
            .post('/api/services')
            .attach('pricing', pricingFilePath);
    
    if (response.status !== 201) {
      throw new Error(`Failed to create service: ${response.text}`);
    }
    const service = response.body;

    return service;
  }else {
    throw new Error(`File not found at ${pricingFilePath}`);
  }
}

export function generateFeature(name: string): Feature {
  
  const featureType = faker.helpers.arrayElement(['BOOLEAN', 'TEXT', 'NUMERIC']);
  
  return {
    name: name ?? faker.word.words(1),
    description: faker.lorem.sentence(),
    valueType: faker.helpers.arrayElement(['BOOLEAN', 'TEXT', 'NUMERIC']),
    defaultValue: true,
    value: undefined,
    type: faker.helpers.arrayElement([
      'INFORMATION', 'INTEGRATION', 'DOMAIN', 'AUTOMATION',
      'MANAGEMENT', 'GUARANTEE', 'SUPPORT', 'PAYMENT',
    ]),
    integrationType: faker.helpers.arrayElement([
      'API', 'EXTENSION', 'IDENTITY_PROVIDER', 'WEB_SAAS',
      'MARKETPLACE', 'EXTERNAL_DEVICE', undefined,
    ]),
    pricingUrls: [faker.internet.url()],
    automationType: faker.helpers.arrayElement([
      'BOT', 'FILTERING', 'TRACKING', 'TASK_AUTOMATION', undefined,
    ]),
    paymentType: faker.helpers.arrayElement([
      'CARD', 'GATEWAY', 'INVOICE', 'ACH', 'WIRE_TRANSFER', 'OTHER', undefined,
    ]),
    docUrl: faker.internet.url(),
    expression: faker.lorem.words(3),
    serverExpression: faker.lorem.words(2),
    render: faker.helpers.arrayElement(['AUTO', 'ENABLED', 'DISABLED']),
    tag: faker.word.noun(),
  };
}


export {getPricingFile, createService};
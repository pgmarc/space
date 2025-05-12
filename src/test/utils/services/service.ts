import fs from 'fs';
import request from 'supertest';
import { getApp } from '../testApp';
import { clockifyPricingPath, githubPricingPath, zoomPricingPath } from './ServiceTestData';

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

export {getPricingFile, createService};
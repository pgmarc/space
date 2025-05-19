import { faker } from '@faker-js/faker';
import { ContractToCreate, UsageLevel } from '../../../main/types/models/Contract';
import { baseUrl, getApp, useApp } from '../testApp';
import request from 'supertest';
import { generateContract, generateContractAndService } from './generators';
import { TestContract } from '../../types/models/Contract';

async function getAllContracts(app?: any): Promise<any[]> {
  
  let copyApp = await useApp(app);
  
  const response = await request(copyApp)
    .get(`${baseUrl}/contracts`);

  if (response.status !== 200) {
    throw new Error(`Failed to fetch contracts. Status: ${response.status}. Body: ${response.body}`);
  }

  return response.body;
}

async function getContractByUserId(userId: string, app?: any): Promise<TestContract> {
  
  let copyApp = await useApp(app);
  
  const response = await request(copyApp)
    .get(`${baseUrl}/contracts/${userId}`)
    .expect(200);

  return response.body;
}

async function getRandomContract(app?: any): Promise<any[]> {
  
  const contracts = await getAllContracts(app);

  const randomIndex = faker.number.int({ min: 0, max: contracts.length - 1 });

  return contracts[randomIndex];
}

async function createRandomContract(app?: any): Promise<TestContract> {
  let copyApp = await useApp(app);
  
  const {contract} = await generateContractAndService(undefined, copyApp);
  
  const response = await request(copyApp)
    .post(`${baseUrl}/contracts`)
    .send(contract);
  
  if (response.status !== 201) {
    throw new Error(`Failed to create contract. Status: ${response.status}. Body: ${response.body}`);
  }

  return response.body;
}

async function createRandomContracts(amount: number, app?: any): Promise<TestContract[]> {
  let copyApp = await useApp(app);

  const createdContracts: TestContract[] = [];
  
  const {contract, services} = await generateContractAndService(undefined, copyApp);
  
  let response = await request(copyApp)
  .post(`${baseUrl}/contracts`)
  .send(contract);

  if (response.status !== 201) {
    throw new Error(`Failed to create contract. Status: ${response.status}. Body: ${response.body}`);
  }
  
  createdContracts.push(response.body);

  for (let i = 0; i < amount - 1; i++) {
    const generatedContract = await generateContract(services, undefined, copyApp);
    
    response = await request(copyApp)
      .post(`${baseUrl}/contracts`)
      .send(generatedContract);

    if (response.status !== 201) {
      throw new Error(`Failed to create contract. Status: ${response.status}. Body: ${response.body}`);
    }

    createdContracts.push(response.body);
  }

  return createdContracts;
}

async function incrementUsageLevel(userId: string, serviceName: string, usageLimitName: string, app?: any): Promise<TestContract> {
  let copyApp = await useApp(app);
  
  const response = await request(copyApp)
    .put(`${baseUrl}/contracts/${userId}/usageLevels`)
    .send({
      [serviceName]: {
        [usageLimitName]: 5
      }
    })
    .expect(200);

  return response.body;
}

async function incrementAllUsageLevel(userId: string, usageLevels: Record<string, Record<string, UsageLevel>>, app?: any): Promise<TestContract> {
  let copyApp = await useApp(app);
  
  const updatedUsageLevels = Object.keys(usageLevels).reduce((acc, serviceName) => {
    acc[serviceName] = Object.keys(usageLevels[serviceName]).reduce((innerAcc, usageLimitName) => {
      innerAcc[usageLimitName] = 5;
      return innerAcc;
    }, {} as Record<string, number>);
    return acc;
  }, {} as Record<string, Record<string, number>>);

  const response = await request(copyApp)
    .put(`${baseUrl}/contracts/${userId}/usageLevels`)
    .send(updatedUsageLevels)
    .expect(200);

  return response.body;
}

export { createRandomContracts, getContractByUserId, getAllContracts, getRandomContract, createRandomContract, incrementAllUsageLevel, incrementUsageLevel };
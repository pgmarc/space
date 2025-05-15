import { faker } from '@faker-js/faker';
import { ContractToCreate, UsageLevel } from '../../../main/types/models/Contract';
import { getApp, useApp } from '../testApp';
import request from 'supertest';
import { generateContract } from './generators';
import { TestContract } from '../../types/models/Contract';

async function getAllContracts(app?: any): Promise<any[]> {
  
  let copyApp = await useApp(app);
  
  const response = await request(copyApp)
    .get('/api/contracts')
    .expect(200);

  return response.body;
}

async function getContractByUserId(userId: string, app?: any): Promise<TestContract> {
  
  let copyApp = await useApp(app);
  
  const response = await request(copyApp)
    .get(`/api/contracts/${userId}`)
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
  
  const contract = await generateContract(undefined, copyApp);
  
  const response = await request(copyApp)
    .post('/api/contracts')
    .send(contract)
    .expect(201);

  return response.body;
}

async function incrementUsageLevel(userId: string, serviceName: string, usageLimitName: string, app?: any): Promise<TestContract> {
  let copyApp = await useApp(app);
  
  const response = await request(copyApp)
    .put(`/api/contracts/${userId}/usageLevels`)
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
    .put(`/api/contracts/${userId}/usageLevels`)
    .send(updatedUsageLevels)
    .expect(200);

  return response.body;
}

export { generateContract, getContractByUserId, getAllContracts, getRandomContract, createRandomContract, incrementAllUsageLevel, incrementUsageLevel };
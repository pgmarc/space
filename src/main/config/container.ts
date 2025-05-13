// deno-lint-ignore-file no-explicit-any
import process from "node:process";

import { asClass, asValue, AwilixContainer,createContainer } from "awilix";
import dotenv from "dotenv";

import MongooseServiceRepository from "../repositories/mongoose/ServiceRepository";
import MongooseUserRepository from "../repositories/mongoose/UserRepository";
import MongoosePricingRepository from "../repositories/mongoose/PricingRepository";
import MongooseContractRepository from "../repositories/mongoose/ContractRepository";

import CacheService from "../services/CacheService";
import ServiceService from "../services/ServiceService";
import UserService from "../services/UserService";
import ContractService from "../services/ContractService";

dotenv.config();

function initContainer(databaseType: string): AwilixContainer {
  const container: AwilixContainer = createContainer();
  let userRepository, serviceRepository, pricingRepository, contractRepository;
  switch (databaseType) {
    case "mongoDB":
      userRepository = new MongooseUserRepository();
      serviceRepository = new MongooseServiceRepository();
      pricingRepository = new MongoosePricingRepository();
      contractRepository = new MongooseContractRepository();
      break;
    default:
      throw new Error(`Unsupported database type: ${databaseType}`);
  }
  container.register({
    userRepository: asValue(userRepository),
    serviceRepository: asValue(serviceRepository),
    pricingRepository: asValue(pricingRepository),
    contractRepository: asValue(contractRepository),
    userService: asClass(UserService).singleton(),
    serviceService: asClass(ServiceService).singleton(),
    cacheService: asClass(CacheService).singleton(),
    contractService: asClass(ContractService).singleton(),
  });
  return container;
}

let container: AwilixContainer | null = null;
if (!container) { container = initContainer(process.env.DATABASE_TECHNOLOGY ?? ""); }

export default container as AwilixContainer;
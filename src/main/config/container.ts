// deno-lint-ignore-file no-explicit-any
import process from "node:process";

import { asClass, asValue, AwilixContainer,createContainer } from "awilix";
import dotenv from "dotenv";

import MongooseServiceRepository from "../repositories/mongoose/ServiceRepository";
import MongooseUserRepository from "../repositories/mongoose/UserRepository";

import CacheService from "../services/CacheService";
import ServiceService from "../services/ServiceService";
import UserService from "../services/UserService";

dotenv.config();

function initContainer(databaseType: string): AwilixContainer {
  const container: AwilixContainer = createContainer();
  let userRepository, serviceRepository, pricingCollectionRepository;
  switch (databaseType) {
    case "mongoDB":
      userRepository = new MongooseUserRepository();
      serviceRepository = new MongooseServiceRepository();
      break;
    default:
      throw new Error(`Unsupported database type: ${databaseType}`);
  }
  container.register({
    userRepository: asValue(userRepository),
    serviceRepository: asValue(serviceRepository),
    pricingCollectionRepository: asValue(pricingCollectionRepository),
    userService: asClass(UserService).singleton(),
    serviceService: asClass(ServiceService).singleton(),
    cacheService: asClass(CacheService).singleton(),
  });
  return container;
}

let container: AwilixContainer | null = null;
if (!container) { container = initContainer(process.env.DATABASE_TECHNOLOGY ?? ""); }

export default container as AwilixContainer;
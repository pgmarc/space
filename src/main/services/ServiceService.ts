import { retrievePricingFromPath } from 'pricing4ts/server';
import container from '../config/container';
import ServiceRepository, { ServiceQueryFilters } from '../repositories/mongoose/ServiceRepository';
import { parsePricingToSpacePricingObject } from '../utils/pricing-yaml2json';
import { Pricing, retrievePricingFromYaml } from 'pricing4ts';
import fetch from 'node-fetch';
import https from 'https';
import path from 'path';
import fs from 'fs';
import PricingRepository from '../repositories/mongoose/PricingRepository';
import { validatePricingData } from './validation/PricingServiceValidation';
import { LeanService } from '../types/models/Service';
import { ExpectedPricingType } from '../types/models/Pricing';
import { LeanContract } from '../types/models/Contract';
import ContractRepository from '../repositories/mongoose/ContractRepository';
import { performNovation } from '../utils/contracts/novation';
// import CacheService from "./CacheService";

class ServiceService {
  private readonly serviceRepository: ServiceRepository;
  private readonly pricingRepository: PricingRepository;
  private readonly contractRepository: ContractRepository;
  // private cacheService: CacheService;

  constructor() {
    this.serviceRepository = container.resolve('serviceRepository');
    this.pricingRepository = container.resolve('pricingRepository');
    this.contractRepository = container.resolve('contractRepository');
    // this.cacheService = container.resolve('cacheService');
  }

  async index(queryParams: ServiceQueryFilters) {
    const services = await this.serviceRepository.findAll(queryParams);
    return services;
  }

  async indexPricings(serviceName: string, pricingStatus: string) {
    const service = await this.serviceRepository.findByName(serviceName);

    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    const pricingsToReturn =
      pricingStatus === 'active' ? service.activePricings : service.archivedPricings;

    const versionsToRetrieve = Object.keys(pricingsToReturn);

    const versionsToRetrieveLocally = versionsToRetrieve.filter(
      version => pricingsToReturn[version]?.id
    );
    const versionsToRetrieveRemotely = versionsToRetrieve.filter(
      version => !pricingsToReturn[version]?.id
    );

    const locallySavedPricings =
      (await this.serviceRepository.findPricingsByServiceName(
        service.name,
        versionsToRetrieveLocally
      )) ?? [];

    const remotePricings = [];

    for (const version of versionsToRetrieveRemotely) {
      remotePricings.push(await this._getPricingFromUrl(pricingsToReturn[version].url));
    }

    return (locallySavedPricings as unknown as ExpectedPricingType[]).concat(remotePricings);
  }

  async show(serviceName: string) {
    const service = await this.serviceRepository.findByName(serviceName);

    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    return service;
  }

  async showPricing(serviceName: string, pricingVersion: string) {
    const service = await this.serviceRepository.findByName(serviceName);

    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    const pricingLocator =
      service.activePricings[pricingVersion] || service.archivedPricings[pricingVersion];

    if (!pricingLocator) {
      throw new Error(`Pricing version ${pricingVersion} not found for service ${serviceName}`);
    }

    if (!pricingLocator.id && !pricingLocator.url) {
      throw new Error(
        `Neither Pricing URL or id found for version ${pricingVersion} in service ${serviceName}`
      );
    }

    if (pricingLocator.id) {
      return await this.pricingRepository.findById(pricingLocator.id);
    } else {
      return await this._getPricingFromUrl(pricingLocator.url);
    }
  }

  async create(receivedPricing: any, pricingType: 'file' | 'url') {
    try {
      if (pricingType === 'file') {
        return await this._createFromFile(receivedPricing);
      } else {
        return await this._createFromUrl(receivedPricing);
      }
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  async addPricingToService(
    serviceName: string,
    receivedPricing: any,
    pricingType: 'file' | 'url'
  ) {
    try {
      if (pricingType === 'file') {
        return await this._createFromFile(receivedPricing, serviceName);
      } else {
        return await this._createFromUrl(receivedPricing, serviceName);
      }
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  async _createFromFile(pricingFile: any, serviceName?: string) {
    let service: LeanService | null = null;

    // Step 1: Parse and validate pricing

    const uploadedPricing: Pricing = await this._getPricingFromPath(pricingFile.path);

    // Step 1.1: Load the service if already exists
    if (serviceName) {
      service = await this.serviceRepository.findByName(serviceName);
      if (!service) {
        throw new Error(`Service ${serviceName} not found`);
      }

      if (
        service.activePricings[uploadedPricing.version] ||
        service.archivedPricings[uploadedPricing.version]
      ) {
        throw new Error(
          `Pricing version ${uploadedPricing.version} already exists for service ${serviceName}`
        );
      }
    }

    const pricingData: ExpectedPricingType & { _serviceName: string } = {
      _serviceName: uploadedPricing.saasName,
      ...parsePricingToSpacePricingObject(uploadedPricing),
    };

    const validationErrors: string[] = validatePricingData(pricingData);

    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
    }

    // Step 2: Save the pricing data to the database
    const savedPricing = await this.pricingRepository.create(pricingData);
    if (!savedPricing) {
      throw new Error(`Pricing ${uploadedPricing.version} not saved`);
    }
    // Step 3:
    // - If the service does not exist, creates it
    // - If the service exists, updates it with the new pricing
    if (!service) {
      const serviceData = {
        name: uploadedPricing.saasName,
        activePricings: {
          [uploadedPricing.version]: {
            id: savedPricing.id,
          },
        },
      };

      service = await this.serviceRepository.create(serviceData);
    } else {
      const updatedService = await this.serviceRepository.update(service.name, {
        [`activePricings.${uploadedPricing.version}`]: {
          id: savedPricing.id,
        },
      });

      service = updatedService;
    }

    // Step 4: Link the pricing to the service
    // await this.pricingRepository.addServiceNameToPricing(
    //   savedPricing.id!.toString(),
    //   service!.name.toString()
    // );

    // Step 5: If everythign was ok, remove the uploaded file

    const directory = path.dirname(pricingFile.path);
    if (fs.readdirSync(directory).length === 1) {
      fs.rmdirSync(directory, { recursive: true });
    } else {
      fs.rmSync(pricingFile.path);
    }

    // Step 6: Return the saved service
    return service;
  }

  async _createFromUrl(pricingUrl: string, serviceName?: string) {
    const uploadedPricing: Pricing = await this._getPricingFromRemoteUrl(pricingUrl);

    if (!serviceName) {
      // Create a new service
      const serviceData = {
        name: uploadedPricing.saasName,
        activePricings: {
          [uploadedPricing.version]: {
            url: pricingUrl,
          },
        },
      };

      const service = await this.serviceRepository.create(serviceData);
      return service;
    } else {
      // Update an existing service
      const service = await this.serviceRepository.findByName(serviceName);
      if (!service) {
        throw new Error(`Service ${serviceName} not found`);
      }

      if (
        service.activePricings[uploadedPricing.version] ||
        service.archivedPricings[uploadedPricing.version]
      ) {
        throw new Error(
          `Pricing version ${uploadedPricing.version} already exists for service ${serviceName}`
        );
      }

      const updatedService = await this.serviceRepository.update(service.name, {
        [`activePricings.${uploadedPricing.version}`]: {
          url: pricingUrl,
        },
      });

      return updatedService;
    }
  }

  async update(serviceName: string, newServiceData: any) {
    const service = await this.serviceRepository.findByName(serviceName);

    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    const updatedService = await this.serviceRepository.update(service.name, newServiceData);

    return updatedService;
  }

  async updatePricingAvailability(
    serviceName: string,
    pricingVersion: string,
    newAvailability: 'active' | 'archived'
  ) {
    const service = await this.serviceRepository.findByName(serviceName);

    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    if (
      (newAvailability === 'active' && service.activePricings[pricingVersion]) ||
      (newAvailability === 'archived' && service.archivedPricings[pricingVersion])
    ) {
      return service;
    }

    if (
      newAvailability === 'archived' &&
      Object.keys(service.activePricings).length === 1 &&
      service.activePricings[pricingVersion]
    ) {
      throw new Error(`You cannot archive the last active pricing for service ${serviceName}`);
    }

    const pricingLocator =
      service.activePricings[pricingVersion] ?? service.archivedPricings[pricingVersion];

    if (!pricingLocator) {
      throw new Error(`Pricing version ${pricingVersion} not found for service ${serviceName}`);
    }

    let updatedService;

    // TODO: Novate all contracts to the latest version

    if (newAvailability === 'active') {
      updatedService = await this.serviceRepository.update(service.name, {
        [`activePricings.${pricingVersion}`]: pricingLocator,
        [`archivedPricings.${pricingVersion}`]: undefined,
      });
    } else {
      updatedService = await this.serviceRepository.update(service.name, {
        [`activePricings.${pricingVersion}`]: undefined,
        [`archivedPricings.${pricingVersion}`]: pricingLocator,
      });
    }

    return updatedService;
  }

  async prune() {
    const result = await this.serviceRepository.prune();
    return result;
  }

  async disable(serviceName: string) {
    const service = await this.serviceRepository.findByName(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    const contractNovationResult = await this._removeServiceFromContracts(service.name);

    if (!contractNovationResult) {
      throw new Error(`Failed to remove service ${serviceName} from contracts`);
    }

    const result = await this.serviceRepository.disable(service.name);

    return result;
  }

  async destroyPricing(serviceName: string, pricingVersion: string) {
    const service = await this.serviceRepository.findByName(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    if (
      Object.keys(service.activePricings).length === 1 &&
      service.activePricings[pricingVersion]
    ) {
      throw new Error(`You cannot delete the last active pricing for service ${serviceName}`);
    }

    const pricingLocator =
      service.activePricings[pricingVersion] || service.archivedPricings[pricingVersion];

    if (!pricingLocator) {
      throw new Error(`Pricing version ${pricingVersion} not found for service ${serviceName}`);
    }

    if (pricingLocator.id) {
      await this.pricingRepository.destroy(pricingLocator.id);
    }

    const result = await this.serviceRepository.update(service.name, {
      [`activePricings.${pricingVersion}`]: undefined,
      [`archivedPricings.${pricingVersion}`]: undefined,
    });

    return result;
  }

  async _getPricingFromUrl(url: string) {
    const isLocalUrl = url.startsWith('public/');
    return parsePricingToSpacePricingObject(
      await (isLocalUrl ? this._getPricingFromPath(url) : this._getPricingFromRemoteUrl(url))
    );
  }

  async _getPricingFromPath(path: string) {
    const pricing = retrievePricingFromPath(path);
    return pricing;
  }

  async _getPricingFromRemoteUrl(url: string) {
    const agent = new https.Agent({ rejectUnauthorized: false });
    const response = await fetch(url, { agent });
    if (!response.ok) {
      throw new Error(`Failed to fetch pricing from URL: ${url}, status: ${response.status}`);
    }
    const remotePricingYaml = await response.text();
    return retrievePricingFromYaml(remotePricingYaml);
  }

  async _removeServiceFromContracts(serviceName: string): Promise<boolean> {
    const contracts: LeanContract[] = await this.contractRepository.findAll({});
    const novatedContracts: LeanContract[] = [];
    const contractsToDisable: LeanContract[] = [];

    for (const contract of contracts) {
      // Remove this service from the subscription objects
      const newSubscription: Record<string, any> = {
        contractedServices: {},
        subscriptionPlans: {},
        subscriptionAddOns: {},
      };

      // Rebuild subscription objects without the service to be removed
      for (const key in contract.contractedServices) {
        if (key !== serviceName) {
          newSubscription.contractedServices[key] = contract.contractedServices[key];
        }
      }

      for (const key in contract.subscriptionPlans) {
        if (key !== serviceName) {
          newSubscription.subscriptionPlans[key] = contract.subscriptionPlans[key];
        }
      }

      for (const key in contract.subscriptionAddOns) {
        if (key !== serviceName) {
          newSubscription.subscriptionAddOns[key] = contract.subscriptionAddOns[key];
        }
      }

      // Check if objects have the same content by comparing their JSON string representation
      const hasContractChanged = JSON.stringify(contract.contractedServices) !== JSON.stringify(newSubscription.contractedServices);

      // If objects are equal, skip this contract
      if (!hasContractChanged) {
        continue;
      } 

      const newContract = performNovation(contract, newSubscription);

      if (contract.usageLevels[serviceName]) {
        delete contract.usageLevels[serviceName];
      }

      if (Object.keys(newSubscription.contractedServices).length === 0) {
        newContract.usageLevels = {};
        newContract.billingPeriod = {
          startDate: new Date(),
          endDate: new Date(),
          autoRenew: false,
          renewalDays: 0,
        };

        contractsToDisable.push(newContract);
        continue;
      }

      novatedContracts.push(newContract);
    }

    const resultNovations = await this.contractRepository.bulkUpdate(novatedContracts);
    const resultDisables = await this.contractRepository.bulkUpdate(contractsToDisable, true);

    return resultNovations && resultDisables;
  }
}

export default ServiceService;

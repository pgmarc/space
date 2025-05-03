import { retrievePricingFromPath } from "pricing4ts/server";
import container from "../config/container";
import ServiceRepository, { ServiceQueryFilters } from "../repositories/mongoose/ServiceRepository";
import { ExpectedPricingType, parsePricingToSpacePricingObject } from "../utils/pricing-yaml2json";
import { retrievePricingFromYaml } from "pricing4ts";
import fetch from "node-fetch";
import https from "https";
import path from "path";
// import CacheService from "./CacheService";
// import { processFileUris } from "./FileService";

class ServiceService {
    
    private serviceRepository: ServiceRepository;
    // private cacheService: CacheService;

    constructor () {
      this.serviceRepository = container.resolve('serviceRepository');
      // this.cacheService = container.resolve('cacheService');
    }

    async index (queryParams: ServiceQueryFilters) {
      const services = await this.serviceRepository.findAll(queryParams);
      return services;
    }

    async indexPricings (serviceName: string, pricingStatus: string) {
      const service = await this.serviceRepository.findByName(serviceName);
      
      if (!service) {
        throw new Error(`Service ${serviceName} not found`);
      }
      
      const pricingsToReturn = pricingStatus === 'active' ? service.activePricings : service.archivedPricings;

      const versionsToRetrieve = Object.keys(pricingsToReturn);
      
      const versionsToRetrieveLocally = versionsToRetrieve.filter((version) => pricingsToReturn[version]?.id);
      const versionsToRetrieveRemotely = versionsToRetrieve.filter((version) => !pricingsToReturn[version]?.id);

      const locallySavedPricings = await this.serviceRepository.findPricingsByServiceId(service.id, versionsToRetrieveLocally) ?? [];
      
      const remotePricings = []

      for (const version of versionsToRetrieveRemotely) {
        const pricingUrl = pricingsToReturn[version].url;

        if (!pricingUrl) {
          throw new Error(`Neither Pricing URL or id found for version ${version} in service ${serviceName}`);
        }

        const isLocalUrl = pricingUrl.startsWith('/');
        let remotePricing;
        if (isLocalUrl) {
          // Handle local URL
            remotePricing = retrievePricingFromPath("public/" + pricingUrl);
        } else {
          // Handle remote URL
          const agent = new https.Agent({ rejectUnauthorized: false });
          const response = await fetch(pricingUrl, { agent });
          if (!response.ok) {
            throw new Error(`Failed to fetch pricing from URL: ${pricingUrl}, status: ${response.status}`);
          }
          const remotePricingYaml = await response.text();
          remotePricing = retrievePricingFromYaml(remotePricingYaml);
        }

        const parsedPricing = parsePricingToSpacePricingObject(remotePricing);
        remotePricings.push(parsedPricing);
      }
      
      return (locallySavedPricings as unknown as ExpectedPricingType[]).concat(remotePricings);
    }
  
    async show (serviceName: string) {
      const service = await this.serviceRepository.findByName(serviceName);
      
      if (!service) {
        throw new Error(`Service ${serviceName} not found`);
      }
      
      return service;
    }

    async create (pricingFile: any, owner: string, collectionId?: string) {
      // TODO: Implement method
      return null;
    }

    async update () {
      // TODO: Implement method
      return null;
    }
  
    async destroy () {
      // TODO: Implement method
      return null;
    }
  }
  
  export default ServiceService;
  
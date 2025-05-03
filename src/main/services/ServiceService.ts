import { retrievePricingFromPath } from 'pricing4ts/server';
import container from '../config/container';
import ServiceRepository, { ServiceQueryFilters } from '../repositories/mongoose/ServiceRepository';
import { ExpectedPricingType, parsePricingToSpacePricingObject } from '../utils/pricing-yaml2json';
import { retrievePricingFromYaml } from 'pricing4ts';
import fetch from 'node-fetch';
import https from 'https';
import path from 'path';
import PricingRepository from '../repositories/mongoose/PricingRepository';
// import CacheService from "./CacheService";
// import { processFileUris } from "./FileService";

class ServiceService {
  private serviceRepository: ServiceRepository;
  private pricingRepository: PricingRepository;
  // private cacheService: CacheService;

  constructor() {
    this.serviceRepository = container.resolve('serviceRepository');
    this.pricingRepository = container.resolve('pricingRepository');
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
      (await this.serviceRepository.findPricingsByServiceId(
        service.id,
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
      return await this.pricingRepository.findById(pricingLocator.id);;
    } else {
      return await this._getPricingFromUrl(pricingLocator.url);
    }
  }

  async create(pricingFile: any, owner: string, collectionId?: string) {
    // TODO: Implement method
    return null;
  }

  async update() {
    // TODO: Implement method
    return null;
  }

  async destroy() {
    // TODO: Implement method
    return null;
  }

  async _getPricingFromUrl(url: string) {
    const isLocalUrl = url.startsWith('/');
    return parsePricingToSpacePricingObject(await (isLocalUrl ? this._getPricingFromPath(url) : this._getPricingFromRemoteUrl(url)));
  }

  async _getPricingFromPath(path: string) {
    const pricing = retrievePricingFromPath("public/" + path);
    return pricing;
  }

  async _getPricingFromRemoteUrl(url: string) {
    const agent = new https.Agent({ rejectUnauthorized: false });
    const response = await fetch(url, { agent });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch pricing from URL: ${url}, status: ${response.status}`
      );
    }
    const remotePricingYaml = await response.text();
    return retrievePricingFromYaml(remotePricingYaml);
  }
}

export default ServiceService;

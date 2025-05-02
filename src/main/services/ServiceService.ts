import container from "../config/container";
import ServiceRepository, { ServiceQueryFilters } from "../repositories/mongoose/ServiceRepository";
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
  
    async show () {
      // TODO: Implement method
      return null;
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
  
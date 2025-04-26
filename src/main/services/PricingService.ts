import container from "../config/container";
import PricingRepository from "../repositories/mongoose/PricingRepository";
// import CacheService from "./CacheService";
// import { processFileUris } from "./FileService";

class PricingService {
    
    private pricingRepository: PricingRepository;
    // private cacheService: CacheService;

    constructor () {
      this.pricingRepository = container.resolve('pricingRepository');
      // this.cacheService = container.resolve('cacheService');
    }

    async index () {
      const pricings = await this.pricingRepository.findAll();
      return pricings;
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
  
  export default PricingService;
  
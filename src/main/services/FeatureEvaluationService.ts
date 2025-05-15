import container from '../config/container';
import ServiceRepository from '../repositories/mongoose/ServiceRepository';
import { FeatureIndexQueryParams, LeanFeature } from '../types/models/FeatureEvaluation';
import { LeanPricing } from '../types/models/Pricing';
import ServiceService from './ServiceService';

class FeatureEvaluationService {
  private readonly serviceService: ServiceService;
  private readonly serviceRepository: ServiceRepository;

  constructor() {
    this.serviceRepository = container.resolve('serviceRepository');
    this.serviceService = container.resolve('serviceService');
  }

  async index(queryParams: FeatureIndexQueryParams): Promise<LeanFeature[]> {
    const {
      featureName,
      serviceName,
      pricingVersion,
      page = 1,
      offset = 0,
      limit = 20,
      sort = 'serviceName',
      order = 'asc',
      show = 'active',
    } = queryParams || {};

    // Step 1: Generate an object that clasifies pricing details by version and service (i.e. Record<string, Record<string, LeanPricing>>)
    const pricings = await this._getPricingsToReturn(show);

    // Step 2: Parse pricings to a list of features
    const features: LeanFeature[] = this._parsePricingsToFeatures(
      pricings,
      featureName,
      serviceName,
      pricingVersion
    );

    // Step 3: Sort features based on the sort and order parameters
    this._sortFeatures(features, sort, order);

    const startIndex = offset === 0 ? (page - 1) * limit : offset;
    const paginatedFeatures = features.slice(startIndex, startIndex + limit);

    return paginatedFeatures;
  }

  _parsePricingsToFeatures(
    pricings: Record<string, Record<string, LeanPricing>>,
    featureName?: string,
    serviceName?: string,
    pricingVersion?: string
  ): LeanFeature[] {
    let features = [];

    for (const pricingServiceName in pricings) {
      const shouldAddService =
        !serviceName || serviceName.toLowerCase().includes(serviceName.toLowerCase());

      if (!shouldAddService) {
        continue;
      }

      for (const version in pricings[pricingServiceName]) {
        const shouldAddVersion =
          !pricingVersion || version.toLowerCase().includes(pricingVersion.toLowerCase());

        if (!shouldAddVersion) {
          continue;
        }

        for (const feature of Object.values(pricings[pricingServiceName][version].features)) {
          const shouldAddFeature =
            !featureName || feature.name.toLowerCase().includes(featureName.toLowerCase());

          if (!shouldAddFeature) {
            continue;
          }

          const featureToAdd: LeanFeature = {
            info: feature,
            service: pricingServiceName,
            pricingVersion: version,
          };

          features.push(featureToAdd);
        }
      }
    }

    return features;
  }

  _sortFeatures(
    features: LeanFeature[],
    sort: 'featureName' | 'serviceName',
    order: 'asc' | 'desc'
  ): void {
    if (sort === 'featureName') {
      features.sort((a, b) => {
        const featureA = a.info.name.toLowerCase();
        const featureB = b.info.name.toLowerCase();
        if (featureA < featureB) {
          return order === 'asc' ? -1 : 1;
        }
        if (featureA > featureB) {
          return order === 'asc' ? 1 : -1;
        }
        return 0;
      });
    } else if (sort === 'serviceName') {
      features.sort((a, b) => {
        const serviceA = a.service.toLowerCase();
        const serviceB = b.service.toLowerCase();
        if (serviceA < serviceB) {
          return order === 'asc' ? -1 : 1;
        }
        if (serviceA > serviceB) {
          return order === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
  }

  async _getPricingsToReturn(
    show: 'active' | 'archived' | 'all'
  ): Promise<Record<string, Record<string, LeanPricing>>> {
    const pricingsToReturn: Record<string, Record<string, LeanPricing>> = {};

    // Step 1: Return all services
    const services = await this.serviceRepository.findAllNoQueries();

    if (!services) {
      return {};
    }

    for (const service of services) {
      const serviceName = service.name;
      pricingsToReturn[serviceName] = {};

      // Step 2: Given the show parameter, discover all pricings that must be identified by id, and do the same for url
      let pricingsWithIdToCheck: string[] = [];
      let pricingsWithUrlToCheck: string[] = [];

      if (show === 'active' || show === 'all') {
        pricingsWithIdToCheck = pricingsWithIdToCheck.concat(
          Object.entries(service.activePricings)
            .filter(([_, pricing]) => pricing.id)
            .map(([version, _]) => version)
        );
        pricingsWithUrlToCheck = pricingsWithUrlToCheck.concat(
          Object.entries(service.activePricings)
            .filter(([_, pricing]) => pricing.url)
            .map(([version, _]) => version)
        );
      }

      if (show === 'archived' || show === 'all') {
        pricingsWithIdToCheck = pricingsWithIdToCheck.concat(
          Object.entries(service.archivedPricings)
            .filter(([_, pricing]) => pricing.id)
            .map(([version, _]) => version)
        );
        pricingsWithUrlToCheck = pricingsWithUrlToCheck.concat(
          Object.entries(service.archivedPricings)
            .filter(([_, pricing]) => pricing.url)
            .map(([version, _]) => version)
        );
      }

      // Step 3: For each group (id and url) parse the versions to actual ExpectedPricingType objects
      let pricingsWithId = await this.serviceRepository.findPricingsByServiceName(
        serviceName,
        pricingsWithIdToCheck
      );
      pricingsWithId ??= [];

      for (const pricing of pricingsWithId) {
        pricingsToReturn[serviceName][pricing.version] = pricing;
      }

      for (const version of pricingsWithUrlToCheck) {
        const pricing = await this.serviceService._getPricingFromUrl(
          (service.activePricings[version] ?? service.archivedPricings[version]).url
        );
        pricingsToReturn[serviceName][version] = pricing;
      }
    }

    return pricingsToReturn;
  }
}

export default FeatureEvaluationService;

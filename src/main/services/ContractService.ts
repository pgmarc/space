import container from '../config/container';
import { ContractToCreate, LeanContract, UsageLevel } from '../types/models/Contract';
import ContractRepository from '../repositories/mongoose/ContractRepository';
import { validateContractQueryFilters } from './validation/ContractServiceValidation';
import ServiceService from './ServiceService';
import { LeanPeriod, LeanPricing } from '../types/models/Pricing';
import { addDays, addHours, addMinutes, addMonths, addSeconds, addYears } from 'date-fns';
import { isSubscriptionValid } from '../controllers/validation/ContractValidation';

class ContractService {
  private readonly contractRepository: ContractRepository;
  private readonly serviceService: ServiceService;

  constructor() {
    this.contractRepository = container.resolve('contractRepository');
    this.serviceService = container.resolve('serviceService');
  }

  async index(queryParams: any) {
    const errors = validateContractQueryFilters(queryParams);

    if (errors.length > 0) {
      throw new Error(
        'Errors where found during validation of query params: ' + errors.join(' | ')
      );
    }

    const contracts: LeanContract[] = await this.contractRepository.findAll(queryParams);
    return contracts;
  }

  async show(userId: string): Promise<LeanContract> {
    const contract = await this.contractRepository.findByUserId(userId);
    if (!contract) {
      throw new Error(`Contract with userId ${userId} not found`);
    }
    return contract;
  }

  async create(contractData: ContractToCreate): Promise<LeanContract> {
    const startDate = new Date();
    const renewalDays = contractData.billingPeriod?.renewalDays ?? 30; // Default to 30 days if not provided
    const endDate = addDays(new Date(startDate), renewalDays);

    const contractDataToCreate: LeanContract = {
      ...contractData,
      billingPeriod: {
        startDate: startDate,
        endDate: endDate,
        autoRenew: contractData.billingPeriod?.autoRenew ?? false,
        renewalDays: renewalDays,
      },
      usageLevels: (await this._createUsageLevels(contractData.contractedServices)) || {},
      history: [],
    };
    try{
      await isSubscriptionValid({
        contractedServices: contractData.contractedServices,
        subscriptionPlans: contractData.subscriptionPlans,
        subscriptionAddOns: contractData.subscriptionAddOns,
      });
    }catch (error) {
      throw new Error(`Invalid subscription: ${error}`);
    }

    const contract = await this.contractRepository.create(contractDataToCreate);
    return contract;
  }

  async novate(userId: string, newSubscription: any): Promise<LeanContract> {
    const contract = await this.contractRepository.findByUserId(userId);
    if (!contract) {
      throw new Error(`Contract with userId ${userId} not found`);
    }

    contract.history.push({
      startDate: contract.billingPeriod.startDate,
      endDate: new Date(),
      contractedServices: contract.contractedServices,
      subscriptionPlans: contract.subscriptionPlans,
      subscriptionAddOns: contract.subscriptionAddOns,
    });

    const newContract: LeanContract = {
      ...contract,
      contractedServices: newSubscription.contractedServices,
      subscriptionPlans: newSubscription.subscriptionPlans,
      subscriptionAddOns: newSubscription.subscriptionAddOns,
    };

    const startDate = new Date();
    const renewalDays = newContract.billingPeriod?.renewalDays ?? 30; // Default to 30 days if not provided
    const endDate = addDays(new Date(startDate), renewalDays);
    
    newContract.billingPeriod = {
      startDate: startDate,
      endDate: endDate,
      autoRenew: newSubscription.billingPeriod?.autoRenew ?? false,
      renewalDays: renewalDays,
    };

    const result = await this.contractRepository.update(userId, newContract);

    if (!result) {
      throw new Error(`Failed to update contract for userId ${userId}`);
    }

    return result;
  }

  async prune(): Promise<number> {
    const result: number = await this.contractRepository.prune();

    return result;
  }

  async destroy(userId: string): Promise<void> {
    const contract = await this.contractRepository.findByUserId(userId);
    if (!contract) {
      throw new Error(`Contract with userId ${userId} not found`);
    }

    await this.contractRepository.destroy(userId);
  }

  async _createUsageLevels(services: Record<string, string>): Promise<Record<string, UsageLevel>> {
    const usageLevels: Record<string, UsageLevel> = {};

    for (const serviceName in services) {
      const pricing: LeanPricing = await this.serviceService.showPricing(
        serviceName,
        services[serviceName]
      );
      if (!pricing.usageLimits) {
        continue;
      }

      for (const usageLimit of Object.values(pricing.usageLimits)) {
        const mustBeTracked = usageLimit.period || usageLimit.trackable;

        if (mustBeTracked) {
          if (usageLimit.type === 'RENEWABLE') {
            if (!usageLimit.period) {
              throw new Error(
                `Usage limit ${usageLimit.name} must have a period defined, since it is RENEWABLE`
              );
            }

            const resetTimeStamp = new Date();
            this._addPeriodToDate(resetTimeStamp, usageLimit.period);

            usageLevels[usageLimit.name] = {
              resetTimeStamp: resetTimeStamp,
              consumed: 0,
            };
          } else {
            usageLevels[usageLimit.name] = {
              consumed: 0,
            };
          }
        }
      }
    }
    return usageLevels;
  }

  _addPeriodToDate(currentDate: Date, period: LeanPeriod): void {
    switch (period.unit) {
      case 'SEC':
        addSeconds(currentDate, period.value);
        break;
      case 'MIN':
        addMinutes(currentDate, period.value);
        break;
      case 'HOUR':
        addHours(currentDate, period.value);
        break;
      case 'DAY':
        addDays(currentDate, period.value);
        break;
      case 'MONTH':
        addMonths(currentDate, period.value);
        break;
      case 'YEAR':
        addYears(currentDate, period.value);
        break;
      default:
        throw new Error(`Invalid period unit: ${period.unit}`);
    }
  }
}

export default ContractService;

import container from '../config/container';
import {
  ContractToCreate,
  LeanContract,
  Subscription,
  UsageLevel,
  UsageLevelsResetQuery,
  UserContact,
} from '../types/models/Contract';
import ContractRepository from '../repositories/mongoose/ContractRepository';
import { validateContractQueryFilters } from './validation/ContractServiceValidation';
import ServiceService from './ServiceService';
import { LeanPeriod, LeanPricing } from '../types/models/Pricing';
import { addDays, addHours, addMinutes, addMonths, addSeconds, addYears } from 'date-fns';
import { isSubscriptionValid } from '../controllers/validation/ContractValidation';
import { performNovation } from '../utils/contracts/novation';

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
    try {
      await isSubscriptionValid({
        contractedServices: contractData.contractedServices,
        subscriptionPlans: contractData.subscriptionPlans,
        subscriptionAddOns: contractData.subscriptionAddOns,
      });
    } catch (error) {
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

    const newContract = performNovation(contract, newSubscription);

    const result = await this.contractRepository.update(userId, newContract);

    if (!result) {
      throw new Error(`Failed to update contract for userId ${userId}`);
    }

    return result;
  }

  async renew(userId: string): Promise<LeanContract>{
    const contract = await this.contractRepository.findByUserId(userId);
    
    if (!contract) {
      throw new Error(`Contract with userId ${userId} not found`);
    }

    if (!contract.billingPeriod.autoRenew) {
      throw new Error(`Contract with userId ${userId} is not set to auto-renew. It must be renewed manually.`);
    }

    const newEndDate = addDays(new Date(contract.billingPeriod.endDate), contract.billingPeriod.renewalDays);
    contract.billingPeriod.endDate = newEndDate;

    const result = await this.contractRepository.update(userId, contract);

    if (!result) {
      throw new Error(`Failed to update contract for userId ${userId}`);
    }

    return result;
  }

  async novateUserContact(
    userId: string,
    userContact: Omit<UserContact, 'userId'>
  ): Promise<LeanContract> {
    const contract = await this.contractRepository.findByUserId(userId);
    if (!contract) {
      throw new Error(`Contract with userId ${userId} not found`);
    }

    contract.userContact = {
      ...contract.userContact,
      ...userContact,
    };

    const result = await this.contractRepository.update(userId, contract);

    if (!result) {
      throw new Error(`Failed to update contract for userId ${userId}`);
    }

    return result;
  }

  async novateBillingPeriod(
    userId: string,
    newBillingPeriod: { endDate: Date; autoRenew: boolean; renewalDays: number }
  ): Promise<LeanContract> {
    const contract = await this.contractRepository.findByUserId(userId);
    if (!contract) {
      throw new Error(`Contract with userId ${userId} not found`);
    }

    if (new Date(newBillingPeriod.endDate) < new Date(contract.billingPeriod.startDate)) {
      throw new Error('End date cannot be before the start date');
    }

    contract.billingPeriod = {
      ...contract.billingPeriod,
      ...newBillingPeriod,
    };

    const result = await this.contractRepository.update(userId, contract);

    if (!result) {
      throw new Error(`Failed to update contract for userId ${userId}`);
    }

    return result;
  }

  async resetUsageLevels(
    userId: string,
    queryParams: UsageLevelsResetQuery,
    usageLevelsIncrements?: Record<string, Record<string, number>>
  ): Promise<LeanContract> {
    const contract = await this.contractRepository.findByUserId(userId);
    if (!contract) {
      throw new Error(`Contract with userId ${userId} not found`);
    }

    if (queryParams.usageLimit) {
      await this._resetUsageLimitUsageLevels(contract, queryParams.usageLimit);
    } else if (queryParams.reset) {
      await this._resetUsageLevels(contract, queryParams.renewableOnly);
    } else if (usageLevelsIncrements) {
      for (const serviceName in usageLevelsIncrements) {
        for (const usageLimit in usageLevelsIncrements[serviceName]) {
          if (contract.usageLevels[serviceName][usageLimit]) {
            contract.usageLevels[serviceName][usageLimit].consumed +=
              usageLevelsIncrements[serviceName][usageLimit];
          }
        }
      }
    } else {
      throw new Error(`Invalid query params: ${JSON.stringify(queryParams)}`);
    }

    const updatedContract = await this.contractRepository.update(userId, contract);

    if (!updatedContract) {
      throw new Error(`Failed to update contract for userId ${userId}`);
    }

    return updatedContract;
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

  async _createUsageLevels(
    services: Record<string, string>
  ): Promise<Record<string, Record<string, UsageLevel>>> {
    const usageLevels: Record<string, Record<string, UsageLevel>> = {};

    for (const serviceName in services) {
      const pricing: LeanPricing = await this.serviceService.showPricing(
        serviceName,
        services[serviceName]
      );
      usageLevels[serviceName] = {};
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

            usageLevels[serviceName][usageLimit.name] = {
              resetTimeStamp: resetTimeStamp,
              consumed: 0,
            };
          } else {
            usageLevels[serviceName][usageLimit.name] = {
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

  _discoverUsageLimitServices(contract: LeanContract, usageLimit: string): string[] {
    const serviceNames: string[] = [];
    for (const serviceName in contract.usageLevels) {
      if (contract.usageLevels[serviceName][usageLimit]) {
        serviceNames.push(serviceName);
      }
    }
    return serviceNames;
  }

  async _resetUsageLimitUsageLevels(contract: LeanContract, usageLimit: string): Promise<void> {
    const serviceNames: string[] = this._discoverUsageLimitServices(contract, usageLimit);

    if (serviceNames.length === 0) {
      throw new Error(
        `Usage limit: ${usageLimit} not found in the contract. Maybe it's not being tracked as usage level`
      );
    }

    for (const serviceName of serviceNames) {
      contract.usageLevels[serviceName][usageLimit].consumed = 0;

      if (contract.usageLevels[serviceName][usageLimit].resetTimeStamp) {
        await this._setResetTimeStamp(contract, serviceName, usageLimit);
      }
    }
  }

  async _setResetTimeStamp(
    contract: LeanContract,
    serviceName: string,
    usageLimit: string
  ): Promise<void> {
    const pricingVersion = contract.contractedServices[serviceName];

    const servicePricing: LeanPricing = await this.serviceService.showPricing(
      serviceName,
      pricingVersion
    );

    this._addPeriodToDate(
      contract.usageLevels[serviceName][usageLimit].resetTimeStamp!, // Cannot be undefined, since we are inside the if
      servicePricing.usageLimits![usageLimit].period! // Cannot be undefined, since renewawlPeriod was assigned to the usage level during the contract creation
    );
  }

  async _resetUsageLevels(contract: LeanContract, renewableOnly: boolean): Promise<void> {
    for (const serviceName in contract.usageLevels) {
      for (const usageLimit in contract.usageLevels[serviceName]) {
        if (renewableOnly && !contract.usageLevels[serviceName][usageLimit].resetTimeStamp) {
          continue;
        }
        contract.usageLevels[serviceName][usageLimit].consumed = 0;
        if (contract.usageLevels[serviceName][usageLimit].resetTimeStamp) {
          await this._setResetTimeStamp(contract, serviceName, usageLimit);
        }
      }
    }
  }
}

export default ContractService;

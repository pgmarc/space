import { faker } from '@faker-js/faker';
import { createRandomService, getAllServices, getPricingFromService } from '../services/service';
import { TestService } from '../../types/models/Service';
import { TestAddOn, TestPricing } from '../../types/models/Pricing';
import { getApp, useApp } from '../testApp';
import { ContractToCreate } from '../../../main/types/models/Contract';
import { TestContract } from '../../types/models/Contract';
import { biasedRandomInt } from '../random';

async function generateContract(userId?: string, app?: any): Promise<ContractToCreate> {
  let appCopy = await useApp(app);

  const contractedServices: Record<string, string> = await _generateNewContractedServices(appCopy);

  const subscriptionPlans: Record<string, string> = await _generateSubscriptionPlans(
    contractedServices,
    app
  );

  const subscriptionAddOns = await _generateSubscriptionAddOns(
    contractedServices,
    subscriptionPlans
  );

  return {
    userContact: {
      userId: userId || faker.string.uuid(),
      username: faker.internet.username(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
    },
    billingPeriod: {
      autoRenew: faker.datatype.boolean(),
      renewalDays: faker.helpers.arrayElement([30, 365]),
    },
    contractedServices: contractedServices,
    subscriptionPlans: subscriptionPlans,
    subscriptionAddOns: subscriptionAddOns,
  };
}

async function generateNovation(app?: any) {
  let appCopy = await useApp(app);

  const contractedServices: Record<string, string> = await _generateExistentContractedServices(appCopy);
  const subscriptionPlans: Record<string, string> = await _generateSubscriptionPlans(contractedServices, appCopy);
  const subscriptionAddOns: Record<string, Record<string, number>> = await _generateSubscriptionAddOns(contractedServices, subscriptionPlans, appCopy);
  
  return {
    contractedServices: contractedServices,
    subscriptionPlans: subscriptionPlans,
    subscriptionAddOns: subscriptionAddOns,
  }
}

async function _generateNewContractedServices(app?: any): Promise<Record<string, string>> {
  let appCopy = await useApp(app);

  const contractedServices: Record<string, string> = {};

  for (let i = 0; i < biasedRandomInt(1, 3); i++) {
    const createdService: TestService = await createRandomService(appCopy);
    const pricingVersion = Object.keys(createdService.activePricings)[0];
    contractedServices[createdService.name] = pricingVersion;
  }

  return contractedServices;
}

async function _generateExistentContractedServices(app?: any): Promise<Record<string, string>> {
  let appCopy = await useApp(app);

  const contractedServices: Record<string, string> = {};
  const services = await getAllServices(appCopy);

  const randomServices = faker.helpers.arrayElements(
    services,
    biasedRandomInt(1, services.length - 1)
  );

  for (const service of randomServices) {
    const pricingVersion = Object.keys(service.activePricings)[0];
    contractedServices[service.name] = pricingVersion;
  }

  return contractedServices;
}

async function _generateSubscriptionPlans(
  contractedServices: Record<string, string>,
  app?: any
): Promise<Record<string, string>> {
  let appCopy = await useApp(app);

  const subscriptionPlans: Record<string, string> = {};

  for (const serviceName in contractedServices) {
    const pricing = await getPricingFromService(
      serviceName,
      contractedServices[serviceName],
      appCopy
    );

    if (pricing.plans) {
      subscriptionPlans[serviceName] = faker.helpers.arrayElement(Object.keys(pricing.plans));
    }
  }

  return subscriptionPlans;
}

async function _generateSubscriptionAddOns(
  contractedServices: Record<string, string>,
  subscriptionPlans: Record<string, string>,
  app?: any
): Promise<Record<string, Record<string, number>>> {
  let appCopy = await useApp(app);

  const subscriptionAddOns: Record<string, Record<string, number>> = {};

  const servicesPricings: Record<string, TestPricing> = {};

  for (const serviceName in contractedServices) {
    const pricing = await getPricingFromService(
      serviceName,
      contractedServices[serviceName],
      appCopy
    );

    servicesPricings[serviceName] = pricing;
  }

  for (const serviceName in servicesPricings) {
    const pricing = servicesPricings[serviceName];
    if (!pricing.addOns) {
      continue;
    }

    const subscriptionAddOns: Record<string, Record<string, number>> = {};

    const planName = subscriptionPlans[serviceName];

    for (const addOnName in pricing.addOns) {
      const addOn = pricing.addOns[addOnName];

      if (faker.datatype.boolean()) {
        if (!addOn.availableFor || _addOnAvailableForPlan(addOn.availableFor, planName)) {
          const count = faker.number.int({ min: 1, max: 10 });
          subscriptionAddOns[serviceName] = { [addOnName]: _isScalableAddon(addOn) ? count : 1 };
        }
      }
    }

    _solveAddOnDependenciesAndExclusions(subscriptionAddOns, pricing.addOns);
  }

  return subscriptionAddOns;
}

function _addOnAvailableForPlan(availableFor: string[] | undefined, planName: string): boolean {
  return Array.isArray(availableFor) && availableFor.length > 0 && availableFor.includes(planName);
}

function _isScalableAddon(addOn: TestAddOn): boolean {
  return (
    addOn.features === undefined &&
    addOn.usageLimits === undefined &&
    addOn.usageLimitsExtensions !== undefined
  );
}

function _solveAddOnDependenciesAndExclusions(
  subscriptionAddOns: Record<string, Record<string, number>>,
  pricingAddons: Record<string, TestAddOn>
): void {
  for (const serviceName in subscriptionAddOns) {
    for (const addOnName in subscriptionAddOns[serviceName]) {
      const pricingAddon = pricingAddons[addOnName];

      if (pricingAddon.dependsOn) {
        for (const dependency of pricingAddon.dependsOn) {
          if (!subscriptionAddOns[dependency]) {
            subscriptionAddOns[serviceName][dependency] = 1;
          }
        }
      }

      if (pricingAddon.excludes) {
        for (const exclusion of pricingAddon.excludes) {
          if (subscriptionAddOns[exclusion]) {
            delete subscriptionAddOns[exclusion];
          }
        }
      }
    }
  }
}

export { generateContract, generateNovation };

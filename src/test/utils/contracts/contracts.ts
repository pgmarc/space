import { faker } from '@faker-js/faker';
import { ContractToCreate } from '../../../main/types/models/Contract';
import { createRandomService, getPricingFromService } from '../services/service';
import { TestService } from '../../types/models/Service';
import { TestAddOn } from '../../types/models/Pricing';
import { getApp } from '../testApp';

async function generateContract(userId?: string, app?: any): Promise<ContractToCreate> {
  let appCopy = app;

  if (!app) {
    appCopy = await getApp();
  }
  
  const createdService: TestService = await createRandomService(appCopy);
  const pricing = await getPricingFromService(
    createdService.name,
    Object.keys(createdService.activePricings)[0],
    appCopy
  );

  const susbcriptionPlans = {
    [createdService.name]: faker.helpers.arrayElement(Object.keys(pricing.plans ?? [])),
  };

  const subscriptionAddOns = _generateSubscriptionAddOns(pricing.addOns, susbcriptionPlans);

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
    contractedServices: {
      [createdService.name]: Object.keys(createdService.activePricings)[0],
    },
    subscriptionPlans: susbcriptionPlans,
    subscriptionAddOns: subscriptionAddOns,
  };
}

function _generateSubscriptionAddOns(
  pricingAddons: Record<string, TestAddOn> | undefined,
  subscriptionPlans: Record<string, string>
): Record<string, Record<string, number>> {
  if (!pricingAddons) {
    return {};
  }

  const subscriptionAddOns: Record<string, Record<string, number>> = {};

  for (const serviceName in subscriptionPlans) {
    const planName = subscriptionPlans[serviceName];

    for (const addOnName in pricingAddons) {
      const addOn = pricingAddons[addOnName];

      if (faker.datatype.boolean()) {
        if (!addOn.availableFor || _addOnAvailableForPlan(addOn.availableFor, planName)) {
          const count = faker.number.int({ min: 1, max: 10 });
          subscriptionAddOns[serviceName] = { [addOnName]: _isScalableAddon(addOn) ? count : 1 };
        }
      }
    }
  }

  _solveAddOnDependenciesAndExclusions(subscriptionAddOns, pricingAddons);

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

export { generateContract };
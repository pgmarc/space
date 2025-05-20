import { UsageLevel } from '../../types/models/Contract';
import { LeanPricing } from '../../types/models/Pricing';
import { addPeriodToDate } from '../helpers';

function generateUsageLevels(pricing: LeanPricing): Record<string, UsageLevel> | undefined {
  const serviceUsageLevels: Record<string, UsageLevel> = {};

  if (!pricing.usageLimits) {
    return undefined;
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

        let resetTimeStamp = new Date();
        resetTimeStamp = addPeriodToDate(resetTimeStamp, usageLimit.period);

        serviceUsageLevels[usageLimit.name] = {
          resetTimeStamp: resetTimeStamp,
          consumed: 0,
        };
      } else {
        serviceUsageLevels[usageLimit.name] = {
          consumed: 0,
        };
      }
    }
  }
  return Object.keys(serviceUsageLevels).length === 0 ? undefined : serviceUsageLevels;
}

export {generateUsageLevels}
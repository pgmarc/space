import { writeFile } from 'fs/promises';
import { faker } from '@faker-js/faker';
import { Feature, UsageLimit, Plan, AddOn, Pricing } from '../../../types/models/Pricing';
import yaml from 'js-yaml';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { mkdir } from 'fs/promises';
import fs from 'fs';

export async function generatePricingFile(serviceName?: string, version?: string): Promise<string> {
  let pricing: Pricing & { saasName?: string; syntaxVersion?: string } = generatePricing(version);
  if (serviceName) {
    pricing = {
      saasName: serviceName,
      ...pricing,
    };
  }
  pricing = {
    syntaxVersion: '2.1',
    ...pricing,
  };
  const yamlStr = yaml.dump(pricing, {
    noRefs: true, // evita alias (&/<<)
    skipInvalid: true, // ignora funciones o símbolos no serializables
    lineWidth: -1, // no corta líneas
  });

  const filePath = path.resolve(__dirname, `../../data/generated/${uuidv4()}.yaml`);

  if (!fs.existsSync(path.dirname(filePath))) {
    await mkdir(path.dirname(filePath), { recursive: true });
  }

  await writeFile(filePath, yamlStr, 'utf8');

  return filePath;
}

export function generatePricing(version?: string): Pricing {
  const featureCount = faker.number.int({ min: 1, max: 15 });
  const usageLimitCount = faker.number.int({ min: 1, max: 5 });
  const planCount = faker.number.int({ min: 1, max: 5 });
  const addOnCount = faker.number.int({ min: 0, max: 5 });

  const features: Record<string, Feature> = {};
  const usageLimits: Record<string, UsageLimit> = {};
  const plans: Record<string, Plan> = {};
  const addOns: Record<string, AddOn> = {};

  const featureKeys = Array.from({ length: featureCount }, () => faker.word.noun());
  const usageLimitKeys = Array.from({ length: usageLimitCount }, () => faker.word.noun());

  featureKeys.forEach(key => (features[key] = generateFeature(key)));
  usageLimitKeys.forEach(key => (usageLimits[key] = generateUsageLimit(key)));

  for (let i = 0; i < planCount; i++) {
    const planName = faker.word.noun().toUpperCase();
    plans[planName] = generatePlan(features, usageLimits);
  }

  const planKeys = Object.keys(plans);

  for (let i = 0; i < addOnCount; i++) {
    const addOnName = faker.word.noun().toLowerCase();
    const randoAddOnType = faker.number.int({ min: 0, max: 2 });
    switch (randoAddOnType) {
      case 0:
        const randomFeatureKeys = faker.helpers.arrayElements(
          featureKeys,
          faker.number.int({ min: 1, max: featureKeys.length })
        );
        addOns[addOnName] = generateAddOn(
          randomFeatureKeys,
          [],
          [],
          faker.helpers.arrayElements(planKeys, faker.number.int({ min: 1, max: planKeys.length })),
          Object.keys(addOns)
        );
        break;
      case 1:
        const randomUsageLimitKeys = faker.helpers.arrayElements(
          usageLimitKeys,
          faker.number.int({ min: 1, max: usageLimitKeys.length })
        );
        addOns[addOnName] = generateAddOn(
          [],
          randomUsageLimitKeys,
          [],
          faker.helpers.arrayElements(planKeys, faker.number.int({ min: 1, max: planKeys.length })),
          Object.keys(addOns)
        );
        break;
      case 2:
        const randomUsageLimitKeysExtensions = faker.helpers.arrayElements(
          usageLimitKeys,
          faker.number.int({ min: 1, max: usageLimitKeys.length })
        );
        addOns[addOnName] = generateAddOn(
          [],
          [],
          randomUsageLimitKeysExtensions,
          faker.helpers.arrayElements(planKeys, faker.number.int({ min: 1, max: planKeys.length })),
          Object.keys(addOns)
        );
        break;
      default:
        throw new Error(`Unsupported add-on type: ${randoAddOnType}`);
    }
  }

  return {
    version: version ?? String(faker.date.recent().getFullYear()),
    currency: 'USD',
    createdAt: new Date().toISOString().split('T')[0],
    features,
    usageLimits,
    plans,
    addOns,
  };
}

export function generateFeature(name?: string): Feature {
  const featureName = name ?? faker.word.words(1);
  const featureValueType = faker.helpers.arrayElement(['BOOLEAN', 'TEXT']);
  const featureType = faker.helpers.arrayElement([
    'INFORMATION',
    'INTEGRATION',
    'DOMAIN',
    'AUTOMATION',
    'MANAGEMENT',
    'GUARANTEE',
    'SUPPORT',
    // 'PAYMENT', - Given the complexity of handling payment types, we'll keep them out from automatic generation.
  ]);

  let defaultValue: boolean | string;
  let value: boolean | string | undefined;

  switch (featureValueType) {
    case 'BOOLEAN':
      [defaultValue, value] = _generateDefaultValueAndValueBoolean();
      break;
    case 'TEXT':
      defaultValue = faker.lorem.word();
      value = faker.datatype.boolean() ? undefined : faker.lorem.word();
      break;
    default:
      throw new Error(`Unsupported feature type: ${featureType}`);
  }

  return {
    name: featureName,
    description: faker.lorem.sentence(),
    valueType: featureValueType,
    defaultValue: defaultValue,
    value: value,
    type: featureType,
    integrationType:
      featureType === 'INTEGRATION'
        ? faker.helpers.arrayElement([
            'API',
            'EXTENSION',
            'IDENTITY_PROVIDER',
            'WEB_SAAS',
            'MARKETPLACE',
            'EXTERNAL_DEVICE',
          ])
        : undefined,
    pricingUrls: undefined,
    automationType:
      featureType === 'AUTOMATION'
        ? faker.helpers.arrayElement(['BOT', 'FILTERING', 'TRACKING', 'TASK_AUTOMATION'])
        : undefined,
    docUrl: undefined,
    expression: featureValueType === 'BOOLEAN' ? `planContext['${featureName}']` : undefined,
    serverExpression: undefined,
    render: faker.helpers.arrayElement(['auto', 'enabled', 'disabled']),
    tag: undefined,
  };
}

export function generateUsageLimit(name?: string, linkedFeatures?: string[]): UsageLimit {
  const usageLimitValueType = faker.helpers.arrayElement(['BOOLEAN', 'NUMERIC']);
  const usageLimitType = faker.helpers.arrayElement(['RENEWABLE', 'NON_RENEWABLE']);

  let defaultValue: boolean | string | number;
  let value: boolean | string | number | undefined;

  switch (usageLimitValueType) {
    case 'BOOLEAN':
      [defaultValue, value] = _generateDefaultValueAndValueBoolean();
      break;
    case 'NUMERIC':
      [defaultValue, value] = _generateDefaultValueAndValueNumeric();
      break;
    default:
      throw new Error(`Unsupported usage limit type: ${usageLimitType}`);
  }

  return {
    name: name ?? faker.word.words(1),
    description: faker.lorem.sentence(),
    valueType: usageLimitValueType,
    defaultValue: defaultValue,
    value: value,
    type: usageLimitType,
    trackable: usageLimitType === 'NON_RENEWABLE' ? faker.datatype.boolean() : undefined,
    period:
      usageLimitType === 'RENEWABLE'
        ? {
            value: faker.number.int({ min: 1, max: 12 }),
            unit: faker.helpers.arrayElement(['SEC', 'MIN', 'HOUR', 'DAY', 'MONTH', 'YEAR']),
          }
        : undefined,
    linkedFeatures: linkedFeatures ?? [],
  };
}

export function generatePlan(
  features: { [key: string]: Feature },
  usageLimitKeys: { [key: string]: UsageLimit }
): Plan {
  return {
    name: faker.word.noun().toUpperCase(),
    description: faker.lorem.sentence(),
    price: faker.number.float({ min: 0, max: 100 }),
    private: faker.datatype.boolean({ probability: 0.1 }),
    features: Object.fromEntries(
      Object.keys(features)
        .filter(key => {
          const feature = features[key];
          return feature.value !== undefined && feature.value !== null;
        })
        .map(key => {
          const feature = features[key];
          return [key, feature.value!];
        })
    ),
    usageLimits: Object.fromEntries(
      Object.keys(usageLimitKeys)
        .filter(key => {
          const usageLimit = usageLimitKeys[key];
          return usageLimit.value !== undefined && usageLimit.value !== null;
        })
        .map(key => {
          const usageLimit = usageLimitKeys[key];
          return [key, usageLimit.value!];
        })
    ),
  };
}

export function generateAddOn(
  features: string[],
  usageLimits: string[],
  usageLimitsExtensions: string[],
  plans: string[],
  preCreatedAddons: string[]
): AddOn {
  const minQuantity: number | undefined = faker.datatype.boolean()
    ? faker.number.int({ min: 1, max: 10 })
    : undefined;
  const maxQuantity: number | undefined = faker.datatype.boolean()
    ? faker.number.int({ min: minQuantity ?? 1, max: 10 })
    : undefined;

  return {
    name: faker.word.noun(),
    description: faker.lorem.sentence(),
    private: faker.datatype.boolean({ probability: 0.1 }),
    price: faker.number.float({ min: 0, max: 100 }),
    availableFor: faker.datatype.boolean()
      ? faker.helpers.arrayElements(plans, faker.number.int({ min: 1, max: plans.length }))
      : [],
    dependsOn: faker.datatype.boolean()
      ? faker.helpers.arrayElements(
          preCreatedAddons,
          faker.number.int({ min: 0, max: preCreatedAddons.length })
        )
      : [],
    excludes: faker.datatype.boolean()
      ? faker.helpers.arrayElements(
          preCreatedAddons,
          faker.number.int({ min: 0, max: preCreatedAddons.length })
        )
      : [],
    features:
      features.length > 0
        ? Object.fromEntries(
            features.map(feature => {
              const featureName = feature;
              const featureValue = faker.helpers.arrayElement([
                faker.word.noun(),
                faker.datatype.boolean(),
              ]);
              return [featureName, featureValue];
            })
          )
        : {},
    usageLimits:
      usageLimits.length > 0
        ? Object.fromEntries(
            usageLimits.map(usageLimit => {
              const usageLimitName = usageLimit;
              const usageLimitValue = faker.helpers.arrayElement([
                faker.number.int({ min: 0, max: 100 }),
                faker.datatype.boolean(),
              ]);
              return [usageLimitName, usageLimitValue];
            })
          )
        : {},
    usageLimitsExtensions:
      usageLimitsExtensions.length > 0
        ? Object.fromEntries(
            usageLimitsExtensions.map(usageLimit => {
              const usageLimitName = usageLimit;
              const usageLimitValue = faker.number.int({ min: 0, max: 100 });
              return [usageLimitName, usageLimitValue];
            })
          )
        : {},
    subscriptionConstraint: {
      minQuantity: minQuantity,
      maxQuantity: maxQuantity,
      quantityStep: 1,
    },
  };
}

function _generateDefaultValueAndValueBoolean(): [boolean, boolean | undefined] {
  const defaultValue = faker.datatype.boolean();
  const value = defaultValue ? undefined : faker.datatype.boolean() ? true : undefined;
  return [defaultValue, value];
}

function _generateDefaultValueAndValueNumeric(): [number, number | undefined] {
  const defaultValue = faker.datatype.boolean() ? 0 : faker.number.int({ min: 1, max: 100 });
  const value = faker.datatype.boolean()
    ? faker.number.int({ min: defaultValue, max: 100 })
    : undefined;
  return [defaultValue, value];
}

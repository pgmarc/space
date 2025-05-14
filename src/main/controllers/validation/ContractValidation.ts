import { body, check } from 'express-validator';
import { LeanPricing } from '../../types/models/Pricing';
import { Subscription } from '../../types/models/Contract';
import ServiceService from '../../services/ServiceService';
import container from '../../config/container';

const create = [
  // userContact (required)
  check('userContact')
    .exists({ checkNull: true })
    .withMessage('The userContact field is required')
    .isObject()
    .withMessage('The userContact field must be an object'),
  check('userContact.userId')
    .exists({ checkNull: true })
    .withMessage('The userContact.userId field is required')
    .isString()
    .withMessage('The userContact.userId field must be a string'),
  check('userContact.username')
    .exists({ checkNull: true })
    .withMessage('The userContact.username field is required')
    .isString()
    .withMessage('The userContact.username field must be a string'),
  check('userContact.firstName')
    .optional()
    .isString()
    .withMessage('The userContact.firstName field must be a string'),
  check('userContact.lastName')
    .optional()
    .isString()
    .withMessage('The userContact.lastName field must be a string'),
  check('userContact.email')
    .optional()
    .isEmail()
    .withMessage('The userContact.email field must be a valid email address'),
  check('userContact.phone')
    .optional()
    .isString()
    .withMessage('The userContact.phone field must be a string'),

  // billingPeriod (required)
  check('billingPeriod')
    .optional()
    .isObject()
    .withMessage('The billingPeriod field must be an object'),
  check('billingPeriod.autoRenew')
    .optional()
    .isBoolean()
    .withMessage('billingPeriod.autoRenew must be a boolean'),
  check('billingPeriod.renewalDays')
    .if(body('billingPeriod.autoRenew').equals('true'))
    .exists()
    .withMessage('billingPeriod.renewalDays is required when billingPeriod.autoRenew is true')
    .bail()
    .isInt({ min: 1 })
    .withMessage('billingPeriod.renewalDays must be a positive integer'),

  // contractedServices (optional)
  check('contractedServices')
    .exists({ checkNull: true })
    .withMessage('The contractedServices field is required')
    .isObject()
    .withMessage(
      'contractedServices must be an object where keys are service names and values are pricing versions'
    ),

  check('contractedServices.*')
    .exists()
    .withMessage('Each value in contractedServices must be a string (service name)')
    .isString()
    .withMessage('Each value in contractedServices must be a string (pricing version)'),

  // subscriptionPlans (required)
  check('subscriptionPlans')
    .exists({ checkNull: true })
    .withMessage('The subscriptionPlans field is required')
    .isObject()
    .withMessage(
      'subscriptionPlans must be an object where keys are service names and values are plan names'
    ),

  check('subscriptionPlans.*')
    .exists()
    .withMessage('Each value in subscriptionPlans must be a string (plan name)')
    .isString()
    .withMessage('Plan name must be a string')
    .isLength({ min: 1 })
    .withMessage('Plan name cannot be empty'),

  // subscriptionAddOns (required)
  check('subscriptionAddOns')
    .exists({ checkNull: true })
    .withMessage('The subscriptionAddOns field is required')
    .isObject()
    .withMessage('subscriptionAddOns must be an object'),

  check('subscriptionAddOns.*')
    .isObject()
    .withMessage('Each value in subscriptionAddOns must be an object of add-ons'),

  check('subscriptionAddOns.*.*')
    .isInt({ min: 0 })
    .withMessage('Each add-on quantity must be an integer greater than or equal to 0'),
];

const novate = [
  // contractedServices (optional)
  check('contractedServices')
    .exists({ checkNull: true })
    .withMessage('The contractedServices field is required')
    .isObject()
    .withMessage(
      'contractedServices must be an object where keys are service names and values are pricing versions'
    ),

  check('contractedServices.*')
    .exists()
    .withMessage('Each value in contractedServices must be a string (service name)')
    .isString()
    .withMessage('Each value in contractedServices must be a string (pricing version)'),

  // subscriptionPlans (required)
  check('subscriptionPlans')
    .exists({ checkNull: true })
    .withMessage('The subscriptionPlans field is required')
    .isObject()
    .withMessage(
      'subscriptionPlans must be an object where keys are service names and values are plan names'
    ),

  check('subscriptionPlans.*')
    .exists()
    .withMessage('Each value in subscriptionPlans must be a string (plan name)')
    .isString()
    .withMessage('Plan name must be a string')
    .isLength({ min: 1 })
    .withMessage('Plan name cannot be empty'),

  // subscriptionAddOns (required)
  check('subscriptionAddOns')
    .exists({ checkNull: true })
    .withMessage('The subscriptionAddOns field is required')
    .isObject()
    .withMessage('subscriptionAddOns must be an object'),

  check('subscriptionAddOns.*')
    .isObject()
    .withMessage('Each value in subscriptionAddOns must be an object of add-ons'),

  check('subscriptionAddOns.*.*')
    .isInt({ min: 0 })
    .withMessage('Each add-on quantity must be an integer greater than or equal to 0'),
];

async function isSubscriptionValid(subscription: Subscription): Promise<void> {
  const selectedPricings: Record<string, LeanPricing> = {};
  const serviceService: ServiceService = container.resolve('serviceService');

  for (const serviceName in subscription.contractedServices) {
    const pricingVersion = subscription.contractedServices[serviceName];
    // TODO: Enhance this retrieval so that it can be done in parallel
    try {
      const pricing = await serviceService.showPricing(serviceName, pricingVersion);
      selectedPricings[serviceName] = pricing;
    } catch (error) {
      throw new Error(
        `Pricing version ${pricingVersion} for service ${serviceName} not found`
      );
    }
  }

  const serviceNames = Array.from(
    new Set([
      ...Object.keys(subscription.subscriptionPlans),
      ...Object.keys(subscription.subscriptionAddOns),
    ])
  );

  for (const serviceName of serviceNames) {
    const selectedPlan: string | undefined = subscription.subscriptionPlans[serviceName];
    const selectedAddOns = subscription.subscriptionAddOns[serviceName];
    const pricing = selectedPricings[serviceName];

    if (!pricing) {
      throw new Error(
        `Service ${serviceName} not found. Please check the services declared in subscriptionPlans and subscriptionAddOns.`
      );
    }

    if (!selectedPlan && !selectedAddOns) {
      throw new Error(
        `Service ${serviceName} must have either a plan or add-ons selected`
      );
    }

    if (selectedPlan && !(pricing.plans || {})[selectedPlan]) {
      throw new Error(
        `Plan ${selectedPlan} for service ${serviceName} not found`
      );
    }

    _validateAddOns(selectedAddOns, selectedPlan, pricing);
  }
}

function _validateAddOns(
  selectedAddOns: Record<string, number>,
  selectedPlan: string | undefined,
  pricing: LeanPricing
): void {
  if (!selectedAddOns) {
    return;
  }

  for (const addOnName in selectedAddOns) {
    _validateAddOnAvailability(addOnName, selectedPlan, pricing);
    _validateDependentAddOns(addOnName, selectedAddOns, pricing);
    _validateExcludedAddOns(addOnName, selectedAddOns, pricing);
    _validateAddOnQuantity(addOnName, selectedAddOns, pricing);
  }
}

function _validateAddOnAvailability(
  addOnName: string,
  selectedPlan: string | undefined,
  pricing: LeanPricing
): void {
  if (
    selectedPlan &&
    !(pricing.addOns![addOnName].availableFor ?? Object.keys(pricing.plans!))?.includes(selectedPlan)
  ) {
    throw new Error(
      `Add-on ${addOnName} is not available for plan ${selectedPlan}`
    );
  }
}

function _validateDependentAddOns(
  addOnName: string,
  selectedAddOns: Record<string, number>,
  pricing: LeanPricing
): void {
  const dependentAddOns = pricing.addOns![addOnName].dependsOn ?? [];
  if (!dependentAddOns.every(dependentAddOn => selectedAddOns.hasOwnProperty(dependentAddOn))) {
    throw new Error(
      `Add-on ${addOnName} requires the following add-ons to be selected: ${dependentAddOns.join(', ')}`
    );
  }
}

function _validateExcludedAddOns(
  addOnName: string,
  selectedAddOns: Record<string, number>,
  pricing: LeanPricing
): void {
  const excludedAddOns = pricing.addOns![addOnName].excludes ?? [];
  if (excludedAddOns.some(excludedAddOn => selectedAddOns.hasOwnProperty(excludedAddOn))) {
    throw new Error(
      `Add-on ${addOnName} cannot be selected with the following add-ons: ${excludedAddOns.join(', ')}`
    );
  }
}

function _validateAddOnQuantity(
  addOnName: string,
  selectedAddOns: Record<string, number>,
  pricing: LeanPricing
): void {
  const quantity = selectedAddOns[addOnName];
  const minQuantity = pricing.addOns![addOnName].subscriptionConstraint?.minQuantity ?? 1;
  const maxQuantity = pricing.addOns![addOnName].subscriptionConstraint?.maxQuantity ?? 1;
  const quantityStep = pricing.addOns![addOnName].subscriptionConstraint?.quantityStep ?? 1;

  const isValidQuantity =
    quantity >= minQuantity &&
    quantity <= maxQuantity &&
    (quantity - minQuantity) % quantityStep === 0;

  if (!isValidQuantity) {
    throw new Error(
      `Add-on ${addOnName} quantity ${quantity} is not valid. It must be between ${minQuantity} and ${maxQuantity}, and a multiple of ${quantityStep}`
    );
  }
}

export { create, novate, isSubscriptionValid };

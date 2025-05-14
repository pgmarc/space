import { body, check } from 'express-validator';

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

function validateLegalKeysInObject(object: any, objectName: string): void {
  for (const key of Object.keys(object)) {
    if (/[^\w-]/.test(key)) {
      throw new Error(
        `Invalid key in ${objectName}: "${key}". Keys must not contain "." or other invalid characters.`
      );
    }
  }
}

export { create, validateLegalKeysInObject };

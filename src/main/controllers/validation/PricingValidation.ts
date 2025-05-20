import { check } from 'express-validator';

const updateAvailability = [
  check('subscriptionPlan')
    .exists({checkNull: true})
    .isString()
    .withMessage('The subscriptionPlan field must be a string'),
  check('subscriptionAddOns')
    .exists({checkNull: true})
    .isObject()
    .withMessage('The subscriptionAddOns field must be an object')
    .custom((value, { req }) => {
      // If the object is empty, it's valid
      if (Object.keys(value).length === 0) {
        return true;
      }

      // Check if all values are numbers
      for (const key in value) {
        if (typeof value[key] !== 'number') {
          throw new Error('All values in subscriptionAddOns must be numbers');
        }
      }

      return true;
    })
];

export { updateAvailability };

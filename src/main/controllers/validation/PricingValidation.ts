import { body, check } from 'express-validator';

// Define a condition to check if the body exists and is non-empty
const bodyExists = () => body().custom((value, { req }) => {
  return req.body && Object.keys(req.body).length > 0;
});

const updateAvailability = [
  body()
    .if(bodyExists())
    .isObject()
    .withMessage('The body must be an object'),

  check('subscriptionPlan')
    .if(bodyExists())
    .exists({checkNull: true})
    .isString()
    .withMessage('The subscriptionPlan field must be a string'),
  
  check('subscriptionAddOns')
    .if(bodyExists())
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

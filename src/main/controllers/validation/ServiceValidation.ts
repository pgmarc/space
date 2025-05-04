import { check } from 'express-validator';

const update = [
  check('name')
    .optional()
    .isString()
    .withMessage('The name field must be a string')
    .isLength({ min: 1, max: 255 })
    .withMessage('The name must have between 1 and 255 characters long')
    .trim()
];

export { update };

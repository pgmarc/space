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

function validateLegalKeysInObject(object: any, objectName: string): void {
  for (const key of Object.keys(object)) {
    if (/[^\w-]/.test(key)) {
      throw new Error(`Invalid key in ${objectName}: "${key}". Keys must not contain "." or other invalid characters.`);
    }
  }
}

export { update, validateLegalKeysInObject };

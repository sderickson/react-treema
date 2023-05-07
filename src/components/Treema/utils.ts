import { SchemaValidator } from './types';

export const noopValidator: SchemaValidator = () => {
  return { valid: true, errors: [], missing: [] };
};

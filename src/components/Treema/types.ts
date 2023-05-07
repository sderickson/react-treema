export interface ValidatorResponse {
  valid: boolean;
  missing: string[];
  errors: ValidatorErrors[];
}

export interface ValidatorErrors {
  id: string | number;
  message: string;
  dataPath: string;
  schemaPath: string;
}

export type SchemaValidator = (data: any, schema: SupportedJsonSchema) => ValidatorResponse;

export interface SupportedJsonSchema {
  type: 'null' | 'boolean' | 'object' | 'array' | 'number' | 'string';
  items?: SupportedJsonSchema;
  properties?: { [key: string]: SupportedJsonSchema };
  displayProperty?: string;
  title?: string;
}

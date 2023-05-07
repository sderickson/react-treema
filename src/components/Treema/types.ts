export type JsonPointer = string;

export interface ChangeSelectEvent {
  type: 'change_select_event';
  path: JsonPointer | undefined;
}

export type TreemaEvent = ChangeSelectEvent;

export type TreemaEventHandler = (event: TreemaEvent) => void;

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

export interface SchemaLib {
  validateMultiple: SchemaValidator;
  getSchemaRef: (ref: string) => SupportedJsonSchema;
}

export type BaseType = 'null' | 'boolean' | 'object' | 'array' | 'number' | 'string';

export interface SupportedJsonSchema {
  type?: BaseType | BaseType[];
  items?: SupportedJsonSchema | SupportedJsonSchema[];
  properties?: { [key: string]: SupportedJsonSchema };
  displayProperty?: string;
  title?: string;
  patternProperties?: { [key: string]: SupportedJsonSchema };
  additionalProperties?: SupportedJsonSchema;
  additionalItems?: SupportedJsonSchema;
  $ref?: string;
  allOf?: SupportedJsonSchema[];
  oneOf?: SupportedJsonSchema[];
  anyOf?: SupportedJsonSchema[];
  description?: string;
}

export interface TreemaNodeContext {
  data: any;
  schema: SupportedJsonSchema;
  path: string;
}

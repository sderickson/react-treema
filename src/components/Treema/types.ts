export type JsonPointer = string;

/**
 * Event types
 */

export interface ChangeSelectEvent {
  type: 'change_select_event';
  path: JsonPointer | undefined;
}

export type TreemaEvent = ChangeSelectEvent;

export type TreemaEventHandler = (event: TreemaEvent) => void;

/**
 * Validator types
 */

export interface ValidatorResponse {
  valid: boolean;
  missing: string[];
  errors: ValidatorError[];
}

export interface ValidatorError {
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

/**
 * Json Schema types
 */

export type BaseType = 'null' | 'boolean' | 'object' | 'array' | 'number' | 'string' | 'integer';

export interface SupportedJsonSchema {
  type?: BaseType | BaseType[];
  items?: SupportedJsonSchema | SupportedJsonSchema[];
  properties?: { [key: string]: SupportedJsonSchema };
  displayProperty?: string;
  title?: string;
  patternProperties?: { [key: string]: SupportedJsonSchema };
  additionalProperties?: SupportedJsonSchema | boolean;
  additionalItems?: SupportedJsonSchema;
  $ref?: string;
  allOf?: SupportedJsonSchema[];
  oneOf?: SupportedJsonSchema[];
  anyOf?: SupportedJsonSchema[];
  description?: string;
  default?: any;
  required?: string[];
  minLength?: number;
  maxLength?: number;
  format?: string;
  minimum?: number;
  maximum?: number;
}

/**
 * Working schemas are internally used in Treema to simplify logic and make sense of
 * more complex JSON Schema keywords. For example, resolving which of the oneOf schemas,
 * or getting a schema referenced by $ref, can be done once and logic can then focus on
 * enforcing the more straightforward schema keywords.
 *
 * This also is reflected to the user when choosing what form a given piece of data
 * should take. If a value could be an array or an object, then these are two "working
 * schemas" the user can choose from, and in so choosing, updates the data.
 *
 * Working schemas:
 * - Always have a single type.
 * - Do not have oneOf, anyOf, or allOf.
 * - Have all $refs resolved.
 *
 * In the future, they should also resolve if/then/else, dependentSchemas.
 *
 * Note that working schemas do *not* contain other working schemas. It is expected if you
 * are considering a child value, you will get the working schema for it as needed separately.
 */
export type WorkingSchema = 
  Omit<
    SupportedJsonSchema,
    "$ref" | "allOf" | "anyOf" | "oneOf"
  > & { type: BaseType };

export interface TreemaNodeContext {
  data: any;
  schema: WorkingSchema;
  path: string;
  possibleSchemas?: WorkingSchema[];
}

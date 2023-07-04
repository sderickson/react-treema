/**
 * This file contains type definitions for everything exposed publicly. It also
 * is the reference documentation.
 */

export interface TreemaRootProps {
  /**
   * The data to display in the treema. Should conform to the schema given.
   *
   * @default An "empty" or "falsy" value of whatever type is given in the schema.
   */
  data: any;

  /**
   * The schema to use to validate the data. Treema will use this to determine
   * how to construct the UI, and how the data may be edited
   *
   * @see https://json-schema.org/understanding-json-schema/
   * @default {} (any JSON object allowed)
   */
  schema: TreemaSupportedJsonSchema;

  /**
   * A schema library instance to use to validate the data.
   * There are [many JavaScript libraries](https://json-schema.org/implementations.html#validators)
   * that support various drafts of the JSON Schema spec.
   * Wrap your chosen library to match the TypeScript interface "SchemaLib".
   * Generally you should initialize the library, which may provide options
   * which will affect the behavior of Treema. Treema also depends on this library
   * to provide error messages.
   *
   * See wrapTv4 and wrapAjv for examples.
   *
   * @default A noop version - no validation, no error messages
   */
  schemaLib?: TreemaWrappedSchemaLib;

  /**
   * A callback for when the user interacts with the treema.
   *
   * Supported events:
   * - `change_select_event`: when the user selects a node. Includes `path` in the event.
   */
  onEvent?: TreemaEventHandler;

  /**
   * Custom Treema node definitions. Use these to customize how Treema renders data
   * of certain types. Treema will first see if there's a match for the "format" on the
   * data's schema, then will match its "type". If no match is found, Treema will use the
   * default node definitions, keying off what type the data currently is.
   *
   * See [TreemaTypeDefinition](https://github.com/sderickson/react-treema/blob/main/src/Treema/definitions/types.ts#L16)
   * for documentation on definitions.
   *
   * @default The default definitions, which cover all JSON Schema types and a few advanced examples.
   */
  definitions?: TreemaTypeDefinition[];

  /**
   * The number of levels deep to open the tree by default.
   *
   * @default All levels are open by default
   */
  initOpen?: number;
}


/**
 * JsonPointers. See [RFC 6901](https://datatracker.ietf.org/doc/html/rfc6901).
 * These are used by Treema, and also typically by validator libraries such
 * as Ajv and Tv4.
 */
export type JsonPointer = string;


/**
 * Configuration passed into TreemaRoot
 */
export interface TreemaSettings {
  readOnly?: boolean;
  noSortable?: boolean; // TODO
  skipValidation?: boolean; // TODO
}


/**
 * Callback handler for Treema events.
 */
export type TreemaEventHandler = (event: TreemaEvent) => void;

/**
 * Comprehensive list of events emitted by Treema.
 */
export type TreemaEvent = TreemaChangeSelectEvent | TreemaChangeDataEvent;

/**
 * Whenever the selected node changes, this event is emitted. This
 * includes when the user stops selecting any node (path is undefined).
 * So this is both for listening for "focus" or "blur".
 */
export interface TreemaChangeSelectEvent {
  type: 'change_select_event';
  path: JsonPointer | undefined;
}

/**
 * Whenever the user edits the data, this event is emitted. If data is an
 * array or object, it will be a new instance; Treema does not mutate the
 * given data. It *will* however reference as much of the previous data
 * structure as it can. This data should be not be mutated, and should be
 * given back to Treema in the "data" prop if Treema is not being used as
 * the "source of truth".
 */
export interface TreemaChangeDataEvent {
  type: 'change_data_event';
  data: any;
}


/**
 * So that Treema is not tied to any specific validator library, it expects
 * any validator to be wrapped in this generic interface. The validator library
 * is not only used to validate data, but as a store for schemas.
 * 
 * Treema exports two example and workable wrapping functions: wrapAjv and wrapTv4.
 */
export interface TreemaWrappedSchemaLib {
  /**
   * Used to validate arbitrary data/schema combinations. Schema may be a
   * reference schema.
   */
  validateMultiple: TreemaValidator;
  /**
   * Looks up a reference string and returns the schema it refers to.
   */
  getSchemaRef: (ref: string) => TreemaSupportedJsonSchema;
  /**
   * Populates the schema library with a schema.
   */
  addSchema: (schema: object, id: string) => void;
}

export type TreemaValidator = (data: any, schema: TreemaSupportedJsonSchema) => TreemaValidatorResponse;

export interface TreemaValidatorResponse {
  valid: boolean;
  /**
   * Should be a list of schema ref strings that are missing from the schema library.
   */
  missing: string[];
  errors: TreemaValidatorError[];
}

export interface TreemaValidatorError {
  /**
   * Validator libraries typically categorize validation errors by an id, either a
   * string or number. Expose this in the error so it can be used if desired (e.g. 
   * with utility functions).
   */
  id: string | number;
  /**
   * Human-readable message describing the error. The library is responsible for
   * any localization.
   */
  message: string;
  /**
   * The path to the data that caused the error. This is a JsonPointer. Validator
   * libraries may differ in what they consider to be the correct path, for example
   * if `additionalProperties` is `false` and one exists, the object or the
   * additional property may be pointed to.
   */
  dataPath: JsonPointer;
}



/**
 * The list of valid JSON Schema types.
 */
export type SchemaBaseType = 'null' | 'boolean' | 'object' | 'array' | 'number' | 'string' | 'integer';


/**
 * Typing for supported JSON Schema keywords. Properties listed here will be used to create
 * the Treema interface. Of course, anything not listed can still be used as part of validation.
 */
export interface TreemaSupportedJsonSchema {
  /**
   * Determines what sort of data input to use. If multiple are given, Treema will provide
   * a selector for the user to choose from.
   */
  type?: SchemaBaseType | SchemaBaseType[];

  /**
   * `items` and other "child" schema keywords will be used to apply to the appropriate data.
   */
  items?: TreemaSupportedJsonSchema | TreemaSupportedJsonSchema[];
  additionalItems?: TreemaSupportedJsonSchema;
  properties?: { [key: string]: TreemaSupportedJsonSchema };
  patternProperties?: { [key: string]: TreemaSupportedJsonSchema };
  additionalProperties?: TreemaSupportedJsonSchema | boolean;

  /**
   * If the schema is an object, the value for this property will be displayed as its label.
   * Note that this is *not* a valid JSON Schema keyword. If it is used, the validator library
   * may need to have this keyword added to it as part of the wrapper (see wrapAjv example).
   */
  displayProperty?: string;

  /**
   * The data's "title" will be shown as its label.
   */
  title?: string;

  /**
   * The given validator library will be used to dereference `$ref` strings.
   */
  $ref?: string;

  /**
   * Treema will combine `allOf` schemas into the "root" schema to form a single working schema.
   */
  allOf?: TreemaSupportedJsonSchema[];

  /**
   * Treema will combine each `oneOf` and `anyOf` schema int working schemas, and then use
   * the resulting title (or type) as the label.
   */
  oneOf?: TreemaSupportedJsonSchema[];
  anyOf?: TreemaSupportedJsonSchema[];

  /**
   * Treema will display default values semi-transparently. If the user changes the value,
   * it will become part of the actual data. If a value is required, Treema will use the
   * default value if one is provided (by the schema for the data or an ancestor schema).
   */
  default?: any;

  /**
   * Treema will automatically fill required fields, using `default` data if available,
   * otherwise a default "empty" value depending on the type ('', 0, etc).
   */
  required?: string[];

  /**
   * The following values are provided as input attributes, but beyond that are unused.
   */
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;

  /**
   * Mainly used to lookup what TypeDefinition to use if a custom one is provided. Also if
   * `type` is `"string"`, and format is one of a handful of valid values, Treema will use
   * the format as the HTML input `type` attribute. These are:
   * 
   * 'color', 'date', 'datetime-local', 'email', 'password', 'tel', 'text', 'time', 'url'
   */
  format?: string;

  /**
   * Treema disables editing for values which are readOnly.
   */
  readOnly?: boolean;

  /**
   * Once an array reaches the maximum number of items, it will not allow adding more.
   */
  maxItems?: number;

  /**
   * Enum values will be chosen with a select box.
   */
  enum?: any[];

  /**
   * 
   */
  [x: string]: any;
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
export type TreemaWorkingSchema = Omit<TreemaSupportedJsonSchema, '$ref' | 'allOf' | 'anyOf' | 'oneOf'> & { type: SchemaBaseType };

export interface TreemaNodeWalkContext {
  data: any;
  schema: TreemaWorkingSchema;
  path: JsonPointer;
  possibleSchemas: TreemaWorkingSchema[];
}


/**
 * Treema may have its functionality extended with custom TypeDefinitions. A TypeDefinition
 * specifies how data of a certain `format` or `type` should be displayed and edited. See 
 * `/definitions` directory for plenty of examples and core uses (all basic types are defined
 * with this interface).
 */
export interface TreemaTypeDefinition {
  /**
   * The `format` or `type` this definition applies to.
   */
  id: string;

  /**
   * Renders the data value as a viewable React component. May also be used to render
   * the value as part of the containing node.
   */
  Display: React.FC<TreemaDisplayProps>;

  /**
   * Renders the data value as an editable React component. The component *must* use
   * `useTreemaEditRef` and provide that as a ref to the input element. This is so that
   * Treema can manage keyboard navigation and focus. Edit elements may also use
   * `useTreemaKeyboardEvent` to override Treema's default keyboard behavior.
   */
  Edit?: React.FC<TreemaEditProps>;

  /**
   * If true, the display value will be truncated to a single line.
   */
  shortened?: boolean;
}

export interface TreemaDisplayProps {
  data: any;
  /**
   * See WorkingSchema type for more information about these.
   */
  schema: TreemaWorkingSchema;
  path: JsonPointer;
}

export interface TreemaEditProps {
  data: any;
  /**
   * See WorkingSchema type for more information about these.
   */
  schema: TreemaWorkingSchema;
  /**
   * The edit component manages taking whatever input values there are and converting
   * them into the appropriate data type, then calling onChange with the new value.
   */
  onChange: (data: any) => void;
}


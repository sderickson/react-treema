// core Treema functionality
export { TreemaRoot } from './Treema';

// types for TreemaRoot props.
export type {
  TreemaRootProps,

  // common
  JsonPointer,
  SchemaBaseType,
  TreemaWorkingSchema,

  // onEvent
  TreemaEventHandler,
  TreemaEvent,
  TreemaChangeSelectEvent,
  TreemaChangeDataEvent,

  // schemaLib
  TreemaWrappedSchemaLib,
  TreemaValidator,
  TreemaValidatorResponse,
  TreemaValidatorError,

  // schema
  TreemaSupportedJsonSchema,

  // definitions
  TreemaTypeDefinition,
  TreemaDisplayProps,
  TreemaEditProps,
} from './Treema/types';

// Used for TreemaTypeDefinition.Edit implementations
export { 
  useTreemaKeyboardEvent,
  useTreemaEditRef,
} from './Treema/definitions/hooks';

// Util functions that can be generally useful
export {
  populateRequireds,
  walk,
  getChildSchema,
  buildWorkingSchemas,
  chooseWorkingSchema,
  combineSchemas,
  clone,
  getValueForRequiredType as defaultForType,
} from './Treema/utils';
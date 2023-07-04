// core Treema functionality
export { TreemaRoot } from './Treema';

// types for TreemaRoot props.
export type {
  TreemaRootProps,

  // common
  JsonPointer,
  WorkingSchema,

  // various setting props
  TreemaSettings,

  // onEvent
  TreemaEventHandler,
  TreemaEvent,
  ChangeSelectEvent,
  ChangeDataEvent,

  // schemaLib
  SchemaLib,
  SchemaValidator,
  ValidatorError,

  // schema
  SupportedJsonSchema,
  BaseType,

  // definitions
  TreemaTypeDefinition,
  DisplayProps,
  EditProps,
} from './Treema/types';

// Used for TreemaTypeDefinition.Edit implementations
export { 
  useTreemaKeyboardEvent,
  useTreemaEditRef,
} from './Treema/definitions/hooks';
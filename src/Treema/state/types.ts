import { TreemaTypeDefinitionWrapped } from '../definitions/types';
import {
  SchemaLib,
  SupportedJsonSchema,
  JsonPointer
} from '../types';

export interface TreemaState {
  data: any;
  schemaLib: SchemaLib;
  rootSchema: SupportedJsonSchema;
  lastSelected?: JsonPointer;
  closed: { [path: JsonPointer]: boolean };
  editing?: JsonPointer;
  editingData?: any;
  definitions: { [key: string]: TreemaTypeDefinitionWrapped }
}

export interface ContextInterface {
  state: TreemaState;
  dispatch: React.Dispatch<any>;
}


import { TreemaTypeDefinitionWrapped } from '../definitions/types';
import {
  SchemaLib,
  SupportedJsonSchema,
  JsonPointer
} from '../types';

export interface TreemaSettings {
  readOnly?: boolean;
  noSortable?: boolean;
  skipValidation?: boolean;
}

export type InsertPropertyPlaceholder = string;
export type OrderEntry = JsonPointer|InsertPropertyPlaceholder;

export interface TreemaState {
  data: any;
  schemaLib: SchemaLib;
  rootSchema: SupportedJsonSchema;
  lastSelected?: JsonPointer;
  closed: { [path: JsonPointer]: boolean };
  editing?: JsonPointer;
  editingData?: any;
  addingProperty?: boolean;
  addingPropertyKey?: string;
  definitions: { [key: string]: TreemaTypeDefinitionWrapped },
  settings: TreemaSettings;
}

export interface ContextInterface {
  state: TreemaState;
  dispatch: React.Dispatch<any>;
}


import { TreemaWrappedSchemaLib, TreemaSupportedJsonSchema, JsonPointer, TreemaSettings, TreemaTypeDefinition } from '../types';

export type InsertPropertyPlaceholder = string;
export type OrderEntry = JsonPointer | InsertPropertyPlaceholder;

export type WorkingSchemaChoices = { [path: string]: number };

export interface TreemaState {
  data: any;
  schemaLib: TreemaWrappedSchemaLib;
  rootSchema: TreemaSupportedJsonSchema;
  lastSelected?: JsonPointer;
  closed: { [path: JsonPointer]: boolean };
  editing?: JsonPointer;
  editingData?: any;
  addingProperty?: boolean;
  addingPropertyKey?: string;
  definitions: { [key: string]: TreemaTypeDefinition };
  settings: TreemaSettings;
  workingSchemaChoices: WorkingSchemaChoices;
}

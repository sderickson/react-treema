import {
  TreemaWrappedSchemaLib,
  TreemaSupportedJsonSchema,
  JsonPointer,
  TreemaSettings,
  TreemaTypeDefinition,
  TreemaFilterFunction,
} from '../types';

export type InsertPropertyPlaceholder = string;
export type OrderEntry = JsonPointer | InsertPropertyPlaceholder;

export type WorkingSchemaChoices = { [path: string]: number };

/**
 * Clipboard mode is "active" when either the command or ctrl key is held down. When active, the user gets a
 * visual hint, and a hidden textarea is rendered to provide text for copying, and to receive text for pasting.
 */
export type ClipboardMode = 'active' | 'standby';

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
  clipboardMode: ClipboardMode;
  filter?: string | RegExp | TreemaFilterFunction;
}

import { TreemaArrayNodeDefinition } from './array';
import { TreemaBooleanNodeDefinition } from './boolean';
import { TreemaNullNodeDefinition } from './null';
import { TreemaNumberNodeDefinition } from './number';
import { TreemaObjectNodeDefinition } from './object';
import { TreemaStringNodeDefinition } from './string';
import { TreemaIntegerNodeDefinition } from './integer';
import { TreemaEnumNodeDefinition } from './enum';
import './core.scss';

import { TreemaTypeDefinition } from './types';

export const coreDefinitions: { [key: string]: TreemaTypeDefinition } = {
  'object': TreemaObjectNodeDefinition,
  'array': TreemaArrayNodeDefinition,
  'string': TreemaStringNodeDefinition,
  'number': TreemaNumberNodeDefinition,
  'boolean': TreemaBooleanNodeDefinition,
  'null': TreemaNullNodeDefinition,
  'integer': TreemaIntegerNodeDefinition,
  'enum': TreemaEnumNodeDefinition,
};

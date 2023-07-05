import { TreemaArrayNodeDefinition } from './array';
import { TreemaBooleanNodeDefinition } from './boolean';
import { TreemaNullNodeDefinition } from './null';
import { TreemaNumberNodeDefinition } from './number';
import { TreemaObjectNodeDefinition } from './object';
import { TreemaStringNodeDefinition } from './string';
import { TreemaIntegerNodeDefinition } from './integer';
import { TreemaEnumNodeDefinition } from './enum';
import './core.scss';

import { TreemaTypeDefinition } from '../types';

export const coreDefinitions: TreemaTypeDefinition[] = [
  TreemaObjectNodeDefinition,
  TreemaArrayNodeDefinition,
  TreemaStringNodeDefinition,
  TreemaNumberNodeDefinition,
  TreemaBooleanNodeDefinition,
  TreemaNullNodeDefinition,
  TreemaIntegerNodeDefinition,
  TreemaEnumNodeDefinition,
];

export const wrapDefinitions = (defs: TreemaTypeDefinition[]): { [key: string]: TreemaTypeDefinition } => {
  const wrapped: { [key: string]: TreemaTypeDefinition } = {};
  defs.forEach((def) => {
    wrapped[def.id] = def;
    if (def.schema?.$id) {
      wrapped[def.schema.$id] = def;
    }
  });

  return wrapped;
};

export const coreDefinitionsMap = wrapDefinitions(coreDefinitions);

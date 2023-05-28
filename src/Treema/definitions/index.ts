import { TreemaArrayNodeDefinition } from './array';
import { TreemaBooleanNodeDefinition } from './boolean';
import { TreemaNullNodeDefinition } from './null';
import { TreemaNumberNodeDefinition } from './number';
import { TreemaObjectNodeDefinition } from './object';
import { TreemaStringNodeDefinition } from './string';
import { TreemaIntegerNodeDefinition } from './integer';
import './core.scss';
import './extra.scss';

import {
  forwardRef
} from 'react';
import {
  EditProps,
  TreemaTypeDefinition,
  TreemaTypeDefinitionWrapped,
} from './types';

/**
 * TreemaNode creates and uses refs to the inputs that these definitions use. Apparently in order
 * for these to work in hook-land, you have to wrap the functional component in forwardRef.
 * Definitions don't worry about this, so wrapping happens here.
 * 
 * Wrapping also fills in defaults for configuration properties.
 */
const wrapTypeDefinition: ((typeDefinition: TreemaTypeDefinition) => TreemaTypeDefinitionWrapped) = (typeDefinition: TreemaTypeDefinition) => {
  const wrapped: TreemaTypeDefinitionWrapped = {
    display: typeDefinition.display,
    usesTextarea: typeDefinition.usesTextarea,
    editable: typeDefinition.editable ?? true,
    directlyEditable: typeDefinition.directlyEditable ?? true,
  };
  if (typeDefinition.edit) {
    wrapped.edit = forwardRef<HTMLInputElement, EditProps>(typeDefinition.edit);
  }
  return wrapped;
};

export const coreDefinitions: { [key: string]: TreemaTypeDefinitionWrapped } = {
  'object': wrapTypeDefinition(TreemaObjectNodeDefinition),
  'array': wrapTypeDefinition(TreemaArrayNodeDefinition),
  'string': wrapTypeDefinition(TreemaStringNodeDefinition),
  'number': wrapTypeDefinition(TreemaNumberNodeDefinition),
  'boolean': wrapTypeDefinition(TreemaBooleanNodeDefinition),
  'null': wrapTypeDefinition(TreemaNullNodeDefinition),
  'integer': wrapTypeDefinition(TreemaIntegerNodeDefinition),
};
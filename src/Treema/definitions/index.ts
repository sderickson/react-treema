import { TreemaArrayNodeDefinition } from './array';
import { TreemaBooleanNodeDefinition } from './boolean';
import { TreemaNullNodeDefinition } from './null';
import { TreemaNumberNodeDefinition } from './number';
import { TreemaObjectNodeDefinition } from './object';
import { TreemaStringNodeDefinition } from './string';
import { TreemaIntegerNodeDefinition } from './integer';
import { TreemaPoint2dNodeDefinition } from './point2d';
import { TreemaLongStringNodeDefinition } from './long-string';
import { TreemaEnumNodeDefinition } from './enum';
import './core.scss';
import './extra.scss';

// import { forwardRef } from 'react';
import { TreemaTypeDefinition } from './types';

/**
 * TreemaNode creates and uses refs to the inputs that these definitions use. Apparently in order
 * for these to work in hook-land, you have to wrap the functional component in forwardRef.
 * Definitions don't worry about this, so wrapping happens here.
 *
 * Wrapping also fills in defaults for configuration properties.
 */
export const coreDefinitions: { [key: string]: TreemaTypeDefinition } = {
  'object': TreemaObjectNodeDefinition,
  'array': TreemaArrayNodeDefinition,
  'string': TreemaStringNodeDefinition,
  'number': TreemaNumberNodeDefinition,
  'boolean': TreemaBooleanNodeDefinition,
  'null': TreemaNullNodeDefinition,
  'integer': TreemaIntegerNodeDefinition,
  'point2d': TreemaPoint2dNodeDefinition,
  'long-string': TreemaLongStringNodeDefinition,
  'enum': TreemaEnumNodeDefinition,
};

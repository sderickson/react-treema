import React from 'react';
import { noopLib } from './utils';
import { TreemaState } from './state/types';
import { createContext } from 'react';
import { TreemaNodeEventCallbackHandler } from './definitions/hooks';

const defaultContextData: ContextInterface = {
  state: {
    data: {},
    schemaLib: noopLib,
    rootSchema: { 'type': 'null' },
    closed: {},
    definitions: {},
    settings: {},
    workingSchemaChoices: {},
  },
  dispatch: () => {},
  editRefs: [],
};

export const TreemaContext = createContext(defaultContextData);

export interface ContextInterface {
  state: TreemaState;
  dispatch: React.Dispatch<any>;
  keyboardCallbackRef?: React.MutableRefObject<TreemaNodeEventCallbackHandler | undefined>;
  editRefs: React.RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>[];
}

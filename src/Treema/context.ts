import React from 'react';
import { noopLib } from './utils';
import { TreemaState } from './state/types';
import { createContext } from 'react';
import { NodeEventCallbackHandler } from './definitions/hooks';

const defaultContextData: ContextInterface = {
  state: {
    data: {},
    schemaLib: noopLib,
    rootSchema: { 'type': 'null' },
    closed: {},
    definitions: {},
    settings: {},
  },
  dispatch: () => {},
  editRefs: [],
};

export const TreemaContext = createContext(defaultContextData);

export interface ContextInterface {
  state: TreemaState;
  dispatch: React.Dispatch<any>;
  keyboardCallbackRef?: React.MutableRefObject<NodeEventCallbackHandler | undefined>;
  editRefs: React.RefObject<HTMLInputElement | HTMLTextAreaElement>[];
}

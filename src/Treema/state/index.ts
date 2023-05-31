import { createContext } from 'react';
import { noopLib } from '../utils';
import { ContextInterface } from './types';

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
};

export const TreemaContext = createContext(defaultContextData);

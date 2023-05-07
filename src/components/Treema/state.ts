import { createContext } from 'react';
import { noopValidator } from './utils';
import { SchemaValidator, SupportedJsonSchema } from './types';

type JsonPointer = string;

export interface TreemaState {
  data: any;
  validator: SchemaValidator;
  rootSchema: SupportedJsonSchema;
  lastSelected?: JsonPointer;
}

export interface ContextInterface {
  state: TreemaState;
  dispatch: React.Dispatch<any>;
}

const defaultContextData: ContextInterface = {
  state: {
    data: {},
    validator: noopValidator,
    rootSchema: { 'type': 'null' },
  },
  dispatch: () => {},
};

export const TreemaContext = createContext(defaultContextData);

type SelectPathAction = {
  type: 'select_path_action';
  path: JsonPointer;
};

export const selectPath = (path: JsonPointer): SelectPathAction => {
  return {
    type: 'select_path_action',
    path,
  }
};

type TreemaAction = SelectPathAction;

export function reducer(state: TreemaState, action: TreemaAction) {
  switch (action.type) {
    case 'select_path_action':
      return { ...state, lastSelected: action.path }
    default:
      throw new Error();
  }

  return state;
}

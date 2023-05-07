import { createContext } from 'react';
import { noopValidator } from './utils';
import { SchemaValidator, SupportedJsonSchema } from './types';

export interface TreemaState {
  data: any;
  validator: SchemaValidator;
  rootSchema: SupportedJsonSchema;
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

type ClickAction = {
  type: 'click';
};

type TreemaAction = ClickAction;

export function reducer(state: TreemaState, action: TreemaAction) {
  switch (action.type) {
    case 'click':
      console.log('we done clicked');

      return { ...state };
    // case 'updateData':
    //   return { ...state, data: action.data };
    // case 'updateValidator':
    //   return { ...state, validator: action.validator };
    // case 'updateRootSchema':
    //   return { ...state, rootSchema: action.rootSchema };
    default:
      throw new Error();
  }

  return state;
}

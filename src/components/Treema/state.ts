import { createContext } from 'react';
import { noopValidator, walk } from './utils';
import { SchemaLib, SupportedJsonSchema } from './types';
import { createSelector } from 'reselect';

// Types

type JsonPointer = string;

export interface TreemaState {
  data: any;
  schemaLib: SchemaLib;
  rootSchema: SupportedJsonSchema;
  lastSelected?: JsonPointer;
}

export interface ContextInterface {
  state: TreemaState;
  dispatch: React.Dispatch<any>;
}

// Default state

const defaultContextData: ContextInterface = {
  state: {
    data: {},
    schemaLib: {
      validateMultiple: noopValidator,
      getSchemaRef: () => ({}),
    },
    rootSchema: { 'type': 'null' },
  },
  dispatch: () => {},
};

export const TreemaContext = createContext(defaultContextData);

// Actions

type SelectPathAction = {
  type: 'select_path_action';
  path: JsonPointer;
};

export const selectPath = (path: JsonPointer): SelectPathAction => {
  return {
    type: 'select_path_action',
    path,
  };
};

type NavigateUpAction = {
  type: 'navigate_up_action';
};
type NavigateDownAction = {
  type: 'navigate_down_action';
};
type NavigateInAction = {
  type: 'navigate_in_action';
};
type NavigateOutAction = {
  type: 'navigate_out_action';
};

export const navigateUp = (): NavigateUpAction => {
  return { type: 'navigate_up_action' };
};

type TreemaAction = SelectPathAction | NavigateUpAction | NavigateDownAction | NavigateInAction | NavigateOutAction;

// Reducer

export function reducer(state: TreemaState, action: TreemaAction) {
  switch (action.type) {
    case 'select_path_action':
      return { ...state, lastSelected: action.path };
    case 'navigate_up_action':
      const paths = getListOfPaths(state);
      const index = paths.indexOf(state.lastSelected || '');
      if (index <= 0) {
        return { ...state, lastSelected: paths[0] };
      }

      return { ...state, lastSelected: paths[index - 1] };
    default:
      console.error('Unknown action', action);
  }

  return state;
}

// Selectors

const getData = (state: TreemaState) => state.data;
const getRootSchema = (state: TreemaState) => state.rootSchema;
const getSchemaLib = (state: TreemaState) => state.schemaLib;

export const getListOfPaths = createSelector(getData, getRootSchema, getSchemaLib, (data, rootSchema, schemaLib): JsonPointer[] => {
  const paths: JsonPointer[] = [];
  walk(data, rootSchema, schemaLib, ({ path }) => {
    paths.push(path);
  });

  return paths;
});

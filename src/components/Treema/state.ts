import { createContext } from 'react';
import { getType, noopValidator, walk } from './utils';
import { SchemaLib, SupportedJsonSchema, TreemaNodeContext, JsonPointer } from './types';
import { createSelector } from 'reselect';

// Types

export interface TreemaState {
  data: any;
  schemaLib: SchemaLib;
  rootSchema: SupportedJsonSchema;
  lastSelected?: JsonPointer;
  closed: {[path: JsonPointer]: boolean};
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
    closed: {},
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
export const navigateDown = (): NavigateDownAction => {
  return { type: 'navigate_down_action' };
};
export const navigateIn = (): NavigateInAction => {
  return { type: 'navigate_in_action' };
};
export const navigateOut = (): NavigateOutAction => {
  return { type: 'navigate_out_action' };
};

type SetPathClosedAction = {
  type: 'set_path_closed_action';
  path: JsonPointer;
  closed: boolean;
};

export const setPathClosed = (path: JsonPointer, closed: boolean): SetPathClosedAction => {
  return {
    type: 'set_path_closed_action',
    path,
    closed,
  };
};

type TreemaAction = SelectPathAction | NavigateUpAction | NavigateDownAction | NavigateInAction | NavigateOutAction | SetPathClosedAction;

// Reducer

export function reducer(state: TreemaState, action: TreemaAction) {
  switch (action.type) {
    case 'select_path_action':
      return { ...state, lastSelected: action.path };
    case 'navigate_up_action':
      const paths = getListOfPaths(state);
      const index = paths.indexOf(state.lastSelected || '');
      return { ...state, lastSelected: paths[Math.max(index - 1, 0)]}
    case 'navigate_down_action':
      const paths2 = getListOfPaths(state);
      const index2 = paths2.indexOf(state.lastSelected || '');
      return { ...state, lastSelected: paths2[Math.min(index2 + 1, paths2.length - 1)]}
    case 'set_path_closed_action':
      return { ...state, closed: { ...state.closed, [action.path]: action.closed } };
    default:
      console.error('Unknown action', action);
  }

  return state;
}

// Selectors

const getData = (state: TreemaState) => state.data;
const getRootSchema = (state: TreemaState) => state.rootSchema;
const getSchemaLib = (state: TreemaState) => state.schemaLib;

export const getAllTreemaNodeContexts = createSelector(getData, getRootSchema, getSchemaLib, (data, rootSchema, schemaLib): {[key: JsonPointer]: TreemaNodeContext} => {
  const contexts: {[key: JsonPointer]: TreemaNodeContext} = {};
  walk(data, rootSchema, schemaLib, ({ path, data, schema }) => {
    contexts[path] = ({ path, data, schema });
  });
  return contexts;
});

export const getListOfPaths = createSelector(getAllTreemaNodeContexts, (contexts): JsonPointer[] => {
  const paths: JsonPointer[] = Object.keys(contexts);
  return paths;
});

export const getClosed = (state: TreemaState) => state.closed;

export const getCanClose = createSelector(
  [
    getClosed,
    getAllTreemaNodeContexts,
    (state, path: JsonPointer) => path,
  ],
  (closed, contexts, path) => {
    if (closed[path]) {
      return false;
    }
    const context = contexts[path];
    if (!context) {
      return false;
    }
    const { data } = context;
    if (['array', 'object'].includes(getType(data))) {
      return true;
    }
    return false;
  }
)

export const getLastSelectedPath = (state: TreemaState) => state.lastSelected || '';
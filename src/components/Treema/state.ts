import { createContext } from 'react';
import { getParentPath, getType, noopLib, walk } from './utils';
import { SchemaLib, SupportedJsonSchema, TreemaNodeContext, JsonPointer, ValidatorError, WorkingSchema } from './types';
import { createSelector } from 'reselect';

// Types

export interface TreemaState {
  data: any;
  schemaLib: SchemaLib;
  rootSchema: SupportedJsonSchema;
  lastSelected?: JsonPointer;
  closed: { [path: JsonPointer]: boolean };
}

export interface ContextInterface {
  state: TreemaState;
  dispatch: React.Dispatch<any>;
}

// Default state

const defaultContextData: ContextInterface = {
  state: {
    data: {},
    schemaLib: noopLib,
    rootSchema: { 'type': 'null' },
    closed: {},
  },
  dispatch: () => {},
};

export const TreemaContext = createContext(defaultContextData);

// Actions

type SelectPathAction = {
  type: 'select_path_action';
  path: JsonPointer | undefined;
};

export const selectPath = (path: JsonPointer | undefined): SelectPathAction => {
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
  let paths: JsonPointer[];
  let index: number;
  let nextPath: JsonPointer;
  let nextPathParent: JsonPointer;
  switch (action.type) {
    case 'select_path_action':
      if (action.path === undefined) {
        let newState = { ...state };
        delete newState.lastSelected;

        return newState;
      }

      return { ...state, lastSelected: action.path };
    case 'navigate_up_action':
      paths = getListOfPaths(state).slice(1);
      paths.indexOf(state.lastSelected || '');
      if (state.lastSelected === undefined || paths.indexOf(state.lastSelected) === 0) {
        index = paths.length - 1;
      } else {
        index = paths.indexOf(state.lastSelected) - 1;
      }
      while (index > 0 && getAnyAncestorsClosed(state, paths[index])) {
        index--;
      }
      nextPath = paths[index];
      nextPathParent = getParentPath(nextPath);

      return { ...state, lastSelected: getClosed(state)[nextPathParent] ? nextPathParent : nextPath };
    case 'navigate_down_action':
      paths = getListOfPaths(state).slice(1);
      if (state.lastSelected === undefined) {
        index = 0;
      } else {
        index = Math.min(paths.indexOf(state.lastSelected || '') + 1, paths.length - 1);
        while (index < paths.length - 1 && getAnyAncestorsClosed(state, paths[index])) {
          index++;
        }
      }

      return { ...state, lastSelected: paths[index] };
    case 'navigate_in_action':
      paths = getListOfPaths(state).slice(1);
      index = paths.indexOf(state.lastSelected || '');
      nextPath = paths[index + 1];
      if (nextPath.indexOf(paths[index]) === 0) {
        // only navigate in if it's a child of the current path
        return { ...state, lastSelected: nextPath };
      }

      return state;
    case 'navigate_out_action':
      let parentPath = getParentPath(state.lastSelected || '');
      if (parentPath) {
        return { ...state, lastSelected: parentPath };
      }

      return state;
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

export const getAllTreemaNodeContexts = createSelector(
  getData,
  getRootSchema,
  getSchemaLib,
  (data, rootSchema, schemaLib): { [key: JsonPointer]: TreemaNodeContext } => {
    const contexts: { [key: JsonPointer]: TreemaNodeContext } = {};
    walk(data, rootSchema, schemaLib, ({ path, data, schema }) => {
      contexts[path] = { path, data, schema };
    });

    return contexts;
  },
);

export const getListOfPaths = createSelector(getAllTreemaNodeContexts, (contexts): JsonPointer[] => {
  const paths: JsonPointer[] = Object.keys(contexts);

  return paths;
});

export const getClosed = (state: TreemaState) => state.closed;

export const getCanClose = createSelector(
  [getClosed, getAllTreemaNodeContexts, (_, path: JsonPointer) => path],
  (closed, contexts, path) => {
    if (closed[path]) {
      return false;
    }
    if (['array', 'object'].includes(getType(contexts[path]?.data))) {
      return true;
    }

    return false;
  },
);

export const getCanOpen = createSelector(
  [getClosed, getAllTreemaNodeContexts, (_, path: JsonPointer) => path],
  (closed, contexts, path) => {
    if (!closed[path]) {
      return false;
    }
    if (['array', 'object'].includes(getType(contexts[path]?.data))) {
      return true;
    }

    return false;
  },
);

export const getAnyAncestorsClosed = createSelector([getClosed, (_, path: JsonPointer) => path], (closed, path) => {
  let currentPath = getParentPath(path);
  while (currentPath !== '') {
    if (closed[currentPath]) {
      return true;
    }
    currentPath = getParentPath(currentPath);
  }

  return false;
});

export const getLastSelectedPath = (state: TreemaState) => state.lastSelected || '';

export const getSchemaErrors = createSelector([getData, getRootSchema, getSchemaLib], (data, rootSchema, schemaLib) => {
  return schemaLib.validateMultiple(data, rootSchema).errors;
});

interface SchemaErrorsByPath {
  [key: JsonPointer]: ValidatorError[];
}

export const getSchemaErrorsByPath: (state: TreemaState) => SchemaErrorsByPath = createSelector([getSchemaErrors], (errors) => {
  const errorsByPath: SchemaErrorsByPath = {};
  errors.forEach((error) => {
    if (!errorsByPath[error.dataPath]) {
      errorsByPath[error.dataPath] = [];
    }
    errorsByPath[error.dataPath].push(error);
  });

  return errorsByPath;
});

type DataSchemaMap = {[key: JsonPointer]: { data: any, schema: WorkingSchema, possibleSchemas: WorkingSchema[] }};

export const getAllDatasAndSchemas: (state: TreemaState) => DataSchemaMap = createSelector(
  [getData, getRootSchema, getSchemaLib],
  (data, rootSchema, schemaLib) => {
    const datasAndSchemas: DataSchemaMap = {};
    walk(data, rootSchema, schemaLib, ({ path, data, schema, possibleSchemas }) => {
      datasAndSchemas[path] = { data, schema, possibleSchemas: possibleSchemas || [] };
    });
    return datasAndSchemas;
  }
);

export const getWorkingSchema: (state: TreemaState, path: JsonPointer) => WorkingSchema = createSelector([
  (_, path: JsonPointer) => path,
  getAllDatasAndSchemas,
], (path, datasAndSchemas) => {
  return datasAndSchemas[path].schema;
});

export const getWorkingSchemas: (state: TreemaState, path: JsonPointer) => WorkingSchema[] = createSelector([
  (_, path: JsonPointer) => path,
  getAllDatasAndSchemas,
], (path, datasAndSchemas) => {
  return datasAndSchemas[path].possibleSchemas;
});

export const getDataAtPath: (state: TreemaState, path: JsonPointer) => any = createSelector([
  (_, path: JsonPointer) => path,
  getAllDatasAndSchemas,
], (path, datasAndSchemas) => {
  return datasAndSchemas[path].data;
});
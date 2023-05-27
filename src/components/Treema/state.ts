import { createContext } from 'react';
import { getParentPath, getType, noopLib, walk, splitJsonPointer, clone } from './utils';
import { SchemaLib, SupportedJsonSchema, TreemaNodeContext, JsonPointer, ValidatorError, WorkingSchema } from './types';
import { createSelector } from 'reselect';

// Types

export interface TreemaState {
  data: any;
  schemaLib: SchemaLib;
  rootSchema: SupportedJsonSchema;
  lastSelected?: JsonPointer;
  closed: { [path: JsonPointer]: boolean };
  editing?: JsonPointer;
  editingData?: any;
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

type BeginEditAction = {
  type: 'begin_edit_action';
  path?: JsonPointer;
};

export const beginEdit = (path?: JsonPointer): BeginEditAction => {
  return {
    type: 'begin_edit_action',
    path,
  };
};

type EditValueAction = {
  type: 'edit_value_action';
  newValue: any;
}

export const editValue = (newValue: any): EditValueAction => {
  return {
    type: 'edit_value_action',
    newValue,
  }
}

type EndEditAction = {
  type: 'end_editing_action';
}

export const endEdit = (newValue?: any): EndEditAction => {
  return {
    type: 'end_editing_action',
  };
};

type SetDataAction = {
  type: 'set_data_action';
  data: any;
  path: JsonPointer;
};

export const setData = (path: JsonPointer, data: any): SetDataAction => {
  return {
    type: 'set_data_action',
    data,
    path,
  };
};

type TreemaAction =
  SelectPathAction | 
  NavigateUpAction |
  NavigateDownAction | 
  NavigateInAction | 
  NavigateOutAction | 
  SetPathClosedAction | 
  SetDataAction | 
  BeginEditAction | 
  EditValueAction | 
  EndEditAction; 

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

    case 'set_data_action':
      if (action.path === '') {
        return { ...state, data: action.data };
      }

      // clone the data only as much as is necessary, leaving the original data intact
      const newData = clone(state.data, { shallow: true });
      let currentChildData = state.data;
      let newChildData = newData
      const segments = splitJsonPointer(action.path);
      const lastSegment = segments.pop();
      segments.forEach((pathSegment: string) => {
        const parsedSegment = getType(currentChildData) === 'array' ? parseInt(pathSegment) : pathSegment;
        currentChildData = currentChildData[parsedSegment];
        newChildData[parsedSegment] = clone(currentChildData, { shallow: true });
        newChildData = newChildData[parsedSegment];
      });
      newChildData[lastSegment as string] = action.data;
      return { ...state, data: newData };

    case 'begin_edit_action':
      const path = action.path || state.lastSelected;
      if (!path) {
        return { ...state };
      }
      const initialData = getAllDatasAndSchemas(state)[path].data;
      return { ...state, editing: path, editingData: initialData };

    case 'edit_value_action':
      return { ...state, editingData: action.newValue };

    case 'end_editing_action':
      return { ...state, editing: undefined };

    default:
      console.error('Unknown action', action);
  }

  return state;
}

// Selectors

const getData = (state: TreemaState) => state.data;
const getRootSchema = (state: TreemaState) => state.rootSchema;
const getSchemaLib = (state: TreemaState) => state.schemaLib;

// TODO: Use getAllDatasAndSchemas instead.
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

type DataSchemaMap = {
  [key: JsonPointer]: {
    data: any;
    schema: WorkingSchema;
    possibleSchemas: WorkingSchema[];
    defaultRoot: boolean;
  };
};

/**
 * Walk the data and schema, generating information about each node, as defined in DataSchemaMap.
 * Other selectors can pull specific data out of this and this way we only have to walk the data
 * once until the data or the schema changes.
 */
export const getAllDatasAndSchemas: (state: TreemaState) => DataSchemaMap = createSelector(
  [getData, getRootSchema, getSchemaLib],
  (data, rootSchema, schemaLib) => {
    const datasAndSchemas: DataSchemaMap = {};
    const defaultsToWalk: JsonPointer[] = [];

    // First walk the data and schema normally, populating the map and gathering defaults to do next
    walk(data, rootSchema, schemaLib, ({ path, data, schema, possibleSchemas }) => {
      datasAndSchemas[path] = {
        data,
        schema,
        possibleSchemas: possibleSchemas || [],
        defaultRoot: false,
      };

      if (schema.type === 'object' && getType(schema.default) === 'object') {
        defaultsToWalk.push(path);
      }
    });
    const extantKeys = new Set(Object.keys(datasAndSchemas));

    /**
     * Now for each default object, "populate" the map with data from them, either by creating new
     * entries explicitly, or by adding to schema.default objects. At the end we want nodes to be
     * able to look up their paths and know:
     *
     * - whether they are a default "root" and so should have a lower opacity
     * - a default object in their schema if somewhere up the tree a default object would apply to them
     *
     * We walk the default objects so that even deeply complex default objects get neatly applied
     * to the full map of data to provide a full picture of what the user should see, defaults and all.
     */
    defaultsToWalk.forEach((defaultRootPath) => {
      const pathInfos = datasAndSchemas[defaultRootPath];

      walk(pathInfos.schema.default, pathInfos.schema, schemaLib, ({ path, data, schema, possibleSchemas }) => {
        // we're walking relative to the where the default object is, so we need to prepend the default's location
        const fullPath = defaultRootPath ? defaultRootPath + '/' + path : path;

        // Where the default object is situated already has itself in its schema.default, so nothing to do.
        // Also since a default object would only ever be used where some object exists, no need to set data.
        if (path === '') {
          return;
        }

        // This is where there exists real data in the map, but there may be some default data which can
        // be filled in. In this case update the schema.default object there with the data from the default
        // object that we're walking, so the node can use it.
        if (datasAndSchemas[fullPath] !== undefined) {
          datasAndSchemas[fullPath].schema.default ??= {};
          // Parent default data takes precedence. Not sure if that's best but that's what this does.
          Object.assign(datasAndSchemas[fullPath].schema.default, data);

          return;
        }

        // This is where there is no data in the map, so create a new entry for it just for the
        // default data.
        const defaultRoot = extantKeys.has(getParentPath(fullPath));
        datasAndSchemas[fullPath] = {
          data,
          schema,
          possibleSchemas: possibleSchemas || [],
          defaultRoot,
        };
      });
    });

    return datasAndSchemas;
  },
);

type OrderInfo = {
  pathOrder: JsonPointer[];
  pathToChildren: { [key: JsonPointer]: JsonPointer[] };
};

/**
 * Create the source of truth for what order to display nodes, for navigation and rendering.
 * This method walks the data with a DFS, and uses getAllDatasAndSchemas, which has generated complete
 * real and default data information. This way we can create a full list of all paths to display,
 * default or not, as well as what each object and array's children should be.
 */
export const getOrderInfo = createSelector([getAllDatasAndSchemas], (datasAndSchemas): OrderInfo => {
  const pathList: JsonPointer[] = [];
  let stack: JsonPointer[] = [''];
  const pathToChildren: { [key: JsonPointer]: JsonPointer[] } = {};
  while (stack.length) {
    const path = stack.shift() as JsonPointer;
    const { data, schema } = datasAndSchemas[path];
    const dataType = getType(data);

    if (dataType === 'array') {
      const childPaths = data.map((_: any, index: number) => {
        return path + '/' + index;
      });
      stack = childPaths.concat(stack);
      pathToChildren[path] = childPaths;
    }

    if (dataType === 'object') {
      const keys: JsonPointer[] = [];
      const keysListed: Set<JsonPointer> = new Set();
      if (schema.properties) {
        // first list known properties, for which we have data to show
        Object.keys(schema.properties).forEach((key: string) => {
          if (data[key] !== undefined || (schema.default || {})[key] !== undefined) {
            keys.push(`${path}/${key}`);
            keysListed.add(key);
          }
        });
      }
      // then list any other properties (not listed in properties), for which we have data
      if (typeof data === 'object') {
        Object.keys(data).forEach((key: string) => {
          if (!keysListed.has(key)) {
            keys.push(`${path}/${key}`);
            keysListed.add(key);
          }
        });
      }
      // then list any default properties (not listed in properties)
      if (schema.default) {
        Object.keys(schema.default).forEach((key: string) => {
          if (!keysListed.has(key)) {
            keys.push(`${path}/${key}`);
            keysListed.add(key);
          }
        });
      }
      stack = keys.concat(stack);
      pathToChildren[path] = keys;
    }
    pathList.push(path);
  }

  return {
    pathOrder: pathList,
    pathToChildren,
  };
});

export const getListOfPaths = createSelector([getOrderInfo], (orderInfo): JsonPointer[] => {
  return orderInfo.pathOrder;
});

export const getChildOrderForPath = createSelector([getOrderInfo, (_, path: JsonPointer) => path], (orderInfo, path) => {
  return orderInfo.pathToChildren[path] || [];
});

export const getWorkingSchema: (state: TreemaState, path: JsonPointer) => WorkingSchema = createSelector(
  [(_, path: JsonPointer) => path, getAllDatasAndSchemas],
  (path, datasAndSchemas) => {
    return datasAndSchemas[path].schema;
  },
);

export const getWorkingSchemas: (state: TreemaState, path: JsonPointer) => WorkingSchema[] = createSelector(
  [(_, path: JsonPointer) => path, getAllDatasAndSchemas],
  (path, datasAndSchemas) => {
    return datasAndSchemas[path].possibleSchemas;
  },
);

export const getDataAtPath: (state: TreemaState, path: JsonPointer) => any = createSelector(
  [(_, path: JsonPointer) => path, getAllDatasAndSchemas],
  (path, datasAndSchemas) => {
    return datasAndSchemas[path].data;
  },
);

export const getIsDefaultRoot: (state: TreemaState, path: JsonPointer) => boolean = createSelector(
  [(_, path: JsonPointer) => path, getAllDatasAndSchemas],
  (path, datasAndSchemas) => {
    return datasAndSchemas[path].defaultRoot;
  },
);

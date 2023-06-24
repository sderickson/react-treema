import { getParentPath, getType, walk } from '../utils';
import { JsonPointer, ValidatorError, WorkingSchema } from '../types';
import { TreemaState, OrderEntry } from './types';
import { createSelector } from 'reselect';
import { TreemaTypeDefinition } from '../definitions/types';

// ----------------------------------------------------------------------------
// Base data selectors
export const getData = (state: TreemaState) => state.data;
export const getRootSchema = (state: TreemaState) => state.rootSchema;
export const getSchemaLib = (state: TreemaState) => state.schemaLib;
export const getLastSelectedPath = (state: TreemaState) => state.lastSelected || '';
export const getDefinitions = (state: TreemaState) => state.definitions;
export const getSettings = (state: TreemaState) => state.settings;
export const getWorkingSchemaChoices = (state: TreemaState) => state.workingSchemaChoices;

// ----------------------------------------------------------------------------
// Error selectors
interface SchemaErrorsByPath {
  [key: JsonPointer]: ValidatorError[];
}

export const getSchemaErrors = createSelector([getData, getRootSchema, getSchemaLib], (data, rootSchema, schemaLib) => {
  return schemaLib.validateMultiple(data, rootSchema).errors;
});

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

// ----------------------------------------------------------------------------
// Data and schema selectors

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
  [getData, getRootSchema, getSchemaLib, getWorkingSchemaChoices],
  (data, rootSchema, schemaLib, workingSchemaChoices) => {
    const datasAndSchemas: DataSchemaMap = {};
    const defaultsToWalk: JsonPointer[] = [];

    // First walk the data and schema normally, populating the map and gathering defaults to do next
    walk(data, rootSchema, schemaLib, ({ path, data, schema, possibleSchemas }) => {
      datasAndSchemas[path] = {
        data,
        schema: workingSchemaChoices[path] ? possibleSchemas[workingSchemaChoices[path]] : schema,
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

interface KeyTitlePair {
  key: string;
  title: string;
}

export const getPropertiesAvailableAtPath: (state: TreemaState, path: JsonPointer) => KeyTitlePair[] = createSelector(
  [(_, path: JsonPointer) => path, getAllDatasAndSchemas],
  (path, datasAndSchemas) => {
    const { schema, data } = datasAndSchemas[path];

    return _getPropertiesAvailable(data, schema);
  },
);

const _getPropertiesAvailable = (data: any, schema: WorkingSchema): KeyTitlePair[] => {
  if (!schema.properties) {
    return [];
  }
  const properties: KeyTitlePair[] = [];
  for (const key of Object.keys(schema.properties)) {
    const childSchema = schema.properties[key];
    if (data[key] !== undefined) continue;
    if (childSchema.format === 'hidden') continue;
    if (childSchema.readOnly) continue;
    properties.push({ key, title: childSchema.title || key });
  }
  properties.sort();

  return properties;
};

export const hasChildrenAtPath: (state: TreemaState, path: JsonPointer) => boolean = createSelector(
  [(state) => getAllDatasAndSchemas(state), (_, path) => path],
  (datasAndSchemas, path) => {
    const { data } = datasAndSchemas[path];

    return ['array', 'object'].includes(getType(data));
  },
);

export const canAddChildAtPath: (state: TreemaState, path: JsonPointer) => boolean = createSelector(
  [(state) => getAllDatasAndSchemas(state), (_, path) => path],
  (datasAndSchemas, path) => {
    const { data, schema } = datasAndSchemas[path];

    return _canAddChild(data, schema);
  },
);

const _canAddChild = (data: any, schema: WorkingSchema): boolean => {
  if (schema.readOnly) {
    return false;
  }
  const dataType = getType(data);
  if (dataType === 'array') {
    if (schema.maxItems && schema.maxItems <= data.length) {
      return false;
    }

    return true;
  }

  if (dataType === 'object') {
    const availableProps = _getPropertiesAvailable(data, schema);
    if (availableProps.length === 0 && schema.additionalProperties === false && !schema.patternProperties) {
      return false;
    }

    return true;
  }

  return false;
};

// ----------------------------------------------------------------------------
// Definition, settings based selectors

export const getDefinitionAtPath: (state: TreemaState, path: JsonPointer) => TreemaTypeDefinition = createSelector(
  [(_, path: JsonPointer) => path, getAllDatasAndSchemas, getDefinitions],
  (path, datasAndSchemas, definitions) => {
    const { schema, data } = datasAndSchemas[path];
    const dataType = getType(data);
    let typeMismatch = dataType !== schema.type;
    if (typeMismatch) {
      return definitions[dataType];
    }

    return definitions[schema.format || ''] || definitions[schema.type];
  },
);

export const canEditPathDirectly: (state: TreemaState, path: JsonPointer) => boolean = createSelector(
  [(state, path) => getDefinitionAtPath(state, path)],
  (definition) => {
    return !!definition.Edit;
  },
);

// ----------------------------------------------------------------------------
// Order selectors

// export interface InsertPropertyPlaceholder {
//   insertPropertyPlaceholder: true;
//   parentPath: JsonPointer;
// }

export const isInsertPropertyPlaceholder = (path: OrderEntry): boolean => {
  return path.indexOf('addTo:') === 0;
};

export const normalizeToPath = (path: OrderEntry): JsonPointer => {
  if (isInsertPropertyPlaceholder(path)) {
    return path.slice(6);
  }

  return path;
};

type OrderInfo = {
  pathOrder: OrderEntry[];
  pathToChildren: { [key: JsonPointer]: JsonPointer[] };
};

/**
 * Create the source of truth for what order to display nodes, for navigation and rendering.
 * This method walks the data with a DFS, and uses getAllDatasAndSchemas, which has generated complete
 * real and default data information. This way we can create a full list of all paths to display,
 * default or not, as well as what each object and array's children should be.
 */
export const getOrderInfo = createSelector([getAllDatasAndSchemas], (datasAndSchemas): OrderInfo => {
  const pathList: OrderEntry[] = [];
  let stack: OrderEntry[] = [''];
  const pathToChildren: { [key: JsonPointer]: JsonPointer[] } = {};
  while (stack.length) {
    const path = stack.shift() as JsonPointer;
    if (isInsertPropertyPlaceholder(path)) {
      pathList.push(path);
      continue;
    }
    const { data, schema } = datasAndSchemas[path];
    if (schema.format === 'hidden') {
      continue;
    }

    const dataType = getType(data);

    if (dataType === 'array') {
      const childPaths = data.map((_: any, index: number) => {
        return path + '/' + index;
      });
      if (_canAddChild(data, schema)) {
        stack.unshift('addTo:' + path);
      }
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
      if (_canAddChild(data, schema)) {
        stack.unshift('addTo:' + path);
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

export const getListOfPaths = createSelector([getOrderInfo], (orderInfo): OrderEntry[] => {
  return orderInfo.pathOrder;
});

// TODO: figure out how to incorporate adding properties to navigation

export const getChildOrderForPath = createSelector([getOrderInfo, (_, path: JsonPointer) => path], (orderInfo, path) => {
  return orderInfo.pathToChildren[path] || [];
});

export const getNextRow: (state: TreemaState, skipAddProperties?: boolean) => OrderEntry = (state, skipAddProperties) => {
  let index = 0;
  const paths = getListOfPaths(state).slice(1);
  if (paths.length === 0) {
    return '';
  }
  if (state.lastSelected === undefined) {
    index = 0;
  } else {
    const currentIndex = paths.indexOf(state.lastSelected || '');
    index = Math.min(currentIndex + 1, paths.length - 1);
    while (
      index < paths.length &&
      (getAnyAncestorsClosed(state, paths[index]) || (skipAddProperties && isInsertPropertyPlaceholder(paths[index])))
    ) {
      index++;
    }
    if (index === paths.length) {
      // went past the end, didn't find anything valid, so stay where we are.
      index = currentIndex;
    }
  }

  return paths[index];
};

export const getPreviousRow: (state: TreemaState, skipAddProperties?: boolean) => OrderEntry = (state, skipAddProperties) => {
  if (state.lastSelected === '') {
    return '';
  }
  let index: number;
  let nextPath: OrderEntry;
  let nextPathParent: OrderEntry;
  const paths = getListOfPaths(state).slice(1);
  if (state.lastSelected === undefined || paths.indexOf(state.lastSelected) === 0) {
    index = paths.length - 1;
  } else {
    index = paths.indexOf(state.lastSelected) - 1;
  }
  while (
    index > 0 &&
    (getAnyAncestorsClosed(state, paths[index]) || (skipAddProperties && isInsertPropertyPlaceholder(paths[index])))
  ) {
    index--;
  }
  nextPath = paths[index];
  nextPathParent = getParentPath(normalizeToPath(nextPath));

  return getClosed(state)[nextPathParent] ? nextPathParent : nextPath;
};

// ----------------------------------------------------------------------------
// Open / Closed selectors

export const getClosed = (state: TreemaState) => state.closed;

export const getCanClose = createSelector(
  [getClosed, getAllDatasAndSchemas, (_, path: JsonPointer) => path],
  (closed, datasAndSchemas, path) => {
    if (closed[path]) {
      return false;
    }
    if (['array', 'object'].includes(getType(datasAndSchemas[path]?.data))) {
      return true;
    }

    return false;
  },
);

export const getCanOpen = createSelector(
  [getClosed, getAllDatasAndSchemas, (_, path: JsonPointer) => path],
  (closed, datasAndSchemas, path) => {
    if (!closed[path]) {
      return false;
    }
    if (['array', 'object'].includes(getType(datasAndSchemas[path]?.data))) {
      return true;
    }

    return false;
  },
);

export const getAnyAncestorsClosed = createSelector([getClosed, (_, path: JsonPointer) => path], (closed, path) => {
  let currentPath = getParentPath(path);
  if (isInsertPropertyPlaceholder(path)) {
    currentPath = normalizeToPath(path);
  }
  while (currentPath !== '') {
    if (closed[currentPath]) {
      return true;
    }
    currentPath = getParentPath(currentPath);
  }

  return false;
});

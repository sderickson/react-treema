import {
  getParentJsonPointer,
  getType,
  splitJsonPointer,
  clone,
  getChildSchema,
  chooseWorkingSchema,
  buildWorkingSchemas,
  getValueForRequiredType,
  joinJsonPointers,
} from '../utils';
import { TreemaState, OrderEntry } from './types';
import { JsonPointer } from '../types';
import { TreemaAction } from './actions';
import {
  getListOfPaths,
  getAllDatasAndSchemas,
  getNextRow,
  getPreviousRow,
  canEditPathDirectly,
  normalizeToPath,
  isInsertPropertyPlaceholder,
  getEffectiveWorkingSchemaChoices,
} from './selectors';

export function reducer(state: TreemaState, action: TreemaAction): TreemaState {
  let paths: OrderEntry[];
  let index: number;
  let nextPath: OrderEntry;
  switch (action.type) {
    case 'select_path_action':
      let newState = {
        ...state,
      };

      // make sure we don't have any editing state hanging around
      delete newState.editing;
      delete newState.editingData;
      delete newState.addingProperty;
      delete newState.addingPropertyKey;

      if (action.path === undefined) {
        delete newState.lastSelected;

        return newState;
      }
      newState.lastSelected = action.path;

      return newState;

    case 'navigate_up_action':
      return { ...state, lastSelected: normalizeToPath(getPreviousRow(state, action.skipAddProperties)) };

    case 'navigate_down_action':
      const nextSelected = getNextRow(state, action.skipAddProperties);

      return { ...state, lastSelected: normalizeToPath(nextSelected) };

    case 'navigate_in_action':
      paths = getListOfPaths(state).slice(1);
      index = paths.indexOf(state.lastSelected || '');
      nextPath = paths[index + 1];
      if (normalizeToPath(nextPath).indexOf(normalizeToPath(paths[index])) === 0) {
        // only navigate in if it's a child of the current path
        return { ...state, lastSelected: normalizeToPath(nextPath) };
      }

      return state;

    case 'navigate_out_action':
      let parentPath = getParentJsonPointer(state.lastSelected || '');
      if (parentPath) {
        return { ...state, lastSelected: parentPath };
      }

      return state;

    case 'set_path_closed_action':
      return { ...state, closed: { ...state.closed, [action.path]: action.closed } };

    case 'set_data_action':
      if (action.path === '') {
        // Since the data has changed externally, it's anybody's guess how this will affect
        // the working schema choices. So just reset them all.
        return { ...state, data: action.data, workingSchemaChoices: {} };
      }

      return {
        ...state,
        data: setDataAtPath(state, action.path, action.data),
        // Retain the working schema choices derived from the old data, for the new data
        // otherwise "breaking" data for a working schema will cause the working schema to
        // become whatever is the first one if none of them work. Users should explicitly
        // change the working schema after initial load.
        workingSchemaChoices: getEffectiveWorkingSchemaChoices(state),
      };

    case 'begin_edit_action':
      const path = action.path || normalizeToPath(state.lastSelected || '');
      if (!path) {
        return state;
      }
      if (!canEditPathDirectly(state, path)) {
        return state;
      }
      const initialData = getAllDatasAndSchemas(state)[path].data;

      return { ...state, editing: path, editingData: initialData, lastSelected: path };

    case 'edit_value_action':
      return { ...state, editingData: action.newValue };

    case 'end_editing_action':
      return { ...state, editing: undefined };

    case 'begin_add_property_action':
      let p = action.path;
      if (!isInsertPropertyPlaceholder(action.path)) {
        p = 'addTo:' + action.path;
      }

      return { ...state, addingProperty: true, lastSelected: p, addingPropertyKey: '' };

    case 'edit_add_property_action':
      return { ...state, addingPropertyKey: action.keyToAdd };

    case 'end_add_property_action':
      if (state.addingPropertyKey === undefined || state.addingProperty === undefined || action.cancel || !state.lastSelected) {
        return { ...state, addingProperty: undefined, addingPropertyKey: undefined };
      }
      const parentSchema = getAllDatasAndSchemas(state)[normalizeToPath(state.lastSelected)].schema;
      const childSchema = getChildSchema(state.addingPropertyKey, parentSchema);
      const workingSchema = chooseWorkingSchema(undefined, buildWorkingSchemas(childSchema, state.schemaLib), state.schemaLib);

      return {
        ...state,
        addingProperty: false,
        data: setDataAtPath(
          state,
          joinJsonPointers(normalizeToPath(state.lastSelected), state.addingPropertyKey),
          getValueForRequiredType(workingSchema.type),
        ),
      };

    case 'delete_action':
      const parent = getParentJsonPointer(action.path);
      const parentData = getAllDatasAndSchemas(state)[parent].data;
      const newData = clone(parentData, { shallow: true });
      const segments = splitJsonPointer(action.path);
      const lastSegment = segments.pop();
      if (getType(parentData) === 'array') {
        const parsedSegment = parseInt(lastSegment as string);
        newData.splice(parsedSegment, 1);
      } else {
        delete newData[lastSegment as string];
      }

      // figure out what the next selection should be. Find the previous row
      // in the *old* state. Then figure out what its next row is in the *new* state
      let previousRow = getPreviousRow(state, true);
      if (previousRow === action.path) {
        previousRow = '';
      }
      const s = { ...state, data: setDataAtPath(state, parent, newData), lastSelected: previousRow };
      const getNextRowResult = getNextRow(s, true);
      s.lastSelected = getNextRowResult;

      return s;

    case 'set_working_schema_action':
      const workingSchemaChoices = getEffectiveWorkingSchemaChoices(state);
      workingSchemaChoices[action.path] = action.index;
      // delete children choices, otherwise might get some weird behavior
      for (let key of Object.keys(workingSchemaChoices)) {
        if (key !== action.path && key.indexOf(action.path) === 0) {
          delete workingSchemaChoices[key];
        }
      }

      return { ...state, workingSchemaChoices };

    default:
      console.error('Unknown action', action);
  }

  return state;
}

const setDataAtPath = (state: TreemaState, path: JsonPointer, data: any): any => {
  if (path === '') {
    return data;
  }
  // clone the data only as much as is necessary, leaving the original data intact
  const newData = clone(state.data, { shallow: true });
  let currentChildData = state.data;
  let newChildData = newData;
  const segments = splitJsonPointer(path);
  const lastSegment = segments.pop();
  let currentPath = '';
  const datasAndSchemas = getAllDatasAndSchemas(state);
  segments.forEach((pathSegment: string) => {
    currentPath = joinJsonPointers(currentPath, pathSegment);
    const parsedSegment = getType(currentChildData) === 'array' ? parseInt(pathSegment) : pathSegment;
    currentChildData = datasAndSchemas[currentPath].data;
    newChildData[parsedSegment] = clone(currentChildData, { shallow: true });
    newChildData = newChildData[parsedSegment];
  });
  newChildData[lastSegment as string] = data;

  return newData;
};

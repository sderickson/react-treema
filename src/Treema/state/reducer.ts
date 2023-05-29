import {
  getParentPath,
  getType,
  splitJsonPointer,
  clone,
  getChildSchema,
  chooseWorkingSchema,
  buildWorkingSchemas,
  getValueForRequiredType
} from '../utils';
import { TreemaState } from './types'
import { JsonPointer } from '../types';
import { TreemaAction } from './actions';
import {
  getListOfPaths,
  getAllDatasAndSchemas,
  getNextRow,
  getPreviousRow,
  canEditPathDirectly,
} from './selectors';

export function reducer(state: TreemaState, action: TreemaAction) {
  let paths: JsonPointer[];
  let index: number;
  let nextPath: JsonPointer;
  switch (action.type) {
    case 'select_path_action':
      if (action.path === undefined) {
        let newState = { ...state };
        delete newState.lastSelected;

        return newState;
      }

      return { ...state, lastSelected: action.path };

    case 'navigate_up_action':
      return { ...state, lastSelected: getPreviousRow(state) };

    case 'navigate_down_action':
      const nextSelected = getNextRow(state);
      return { ...state, lastSelected: nextSelected };

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
      return { ...state, data: setDataAtPath(state, action.path, action.data) };

    case 'begin_edit_action':
      const path = action.path || state.lastSelected;
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
      return { ...state, addingProperty: action.path };

    case 'edit_add_property_action':
      return { ...state, addingPropertyKey: action.keyToAdd };

    case 'end_add_property_action':
      if (state.addingPropertyKey === undefined || state.addingProperty === undefined || action.cancel) {
        return { ...state, addingProperty: undefined, addingPropertyKey: undefined };
      }
      const parentSchema = getAllDatasAndSchemas(state)[state.addingProperty].schema;
      const childSchema = getChildSchema(state.addingPropertyKey, parentSchema);
      const workingSchema = chooseWorkingSchema(
        undefined,
        buildWorkingSchemas(childSchema, state.schemaLib),
        state.schemaLib
      );
      return {
        ...state,
        addingProperty: undefined,
        data: setDataAtPath(
          state,
          state.addingProperty + '/' + state.addingPropertyKey,
          getValueForRequiredType(workingSchema.type)
        )
      };
    default:
      console.error('Unknown action', action);
  }

  return state;
}

const setDataAtPath = (state: TreemaState, path: JsonPointer, data: any): any => {
  // clone the data only as much as is necessary, leaving the original data intact
  const newData = clone(state.data, { shallow: true });
  let currentChildData = state.data;
  let newChildData = newData;
  const segments = splitJsonPointer(path);
  const lastSegment = segments.pop();
  let currentPath = '';
  const datasAndSchemas = getAllDatasAndSchemas(state);
  segments.forEach((pathSegment: string) => {
    currentPath += '/' + pathSegment;
    const parsedSegment = getType(currentChildData) === 'array' ? parseInt(pathSegment) : pathSegment;
    currentChildData = datasAndSchemas[currentPath].data;
    newChildData[parsedSegment] = clone(currentChildData, { shallow: true });
    newChildData = newChildData[parsedSegment];
  });
  newChildData[lastSegment as string] = data;
  return newData;
}
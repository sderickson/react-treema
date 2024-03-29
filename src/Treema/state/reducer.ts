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
import { TreemaState, OrderEntry, UndoSnapshot } from './types';
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
        delete newState.focused;

        return newState;
      }
      newState.focused = action.path;
      newState.selected = { ...state.selected };

      if (action.append) {
        if (action.path && state.selected[action.path]) {
          // if the user is holding down the ctrl/cmd key and clicking the same row,
          // then we should deselect it
          newState.selected = { ...state.selected, [action.path]: false };
        } else {
          newState.selected = { ...state.selected, [action.path]: true };
        }
      } else if (action.multi && state.focused) {
        const paths = getListOfPaths(state);
        const indexes = [paths.indexOf(action.path), paths.indexOf(state.focused || '')];
        indexes.sort((a, b) => a - b);
        for (var i = indexes[0]; i <= indexes[1]; i++) {
          newState.selected[paths[i]] = true;
        }
      } else {
        newState.selected = { [action.path]: true };
      }

      return newState;

    case 'navigate_up_action': {
      const nextPath = normalizeToPath(getPreviousRow(state, action.skipAddProperties));
      return {
        ...state,
        focused: nextPath,
        selected: { [nextPath]: true },
      };
    }

    case 'navigate_down_action': {
      const nextPath = normalizeToPath(getNextRow(state, action.skipAddProperties));
      return {
        ...state,
        focused: nextPath,
        selected: { [nextPath]: true }
      };
    }

    case 'navigate_in_action': {
      paths = getListOfPaths(state);
      index = paths.indexOf(state.focused || '');
      const nextPath = normalizeToPath(paths[index + 1]);
      if (nextPath.indexOf(normalizeToPath(paths[index])) === 0) {
        // only navigate in if it's a child of the current path
        return {
          ...state,
          focused: nextPath,
          selected: { [nextPath]: true },
        };
      }

      return state;
    }

    case 'navigate_out_action': {
      let parentPath = getParentJsonPointer(state.focused || '');
      if (parentPath) {
        return {
          ...state,
          focused: parentPath,
          selected: { [parentPath]: true },
        };
      }

      return state;
    }

    case 'set_path_closed_action':
      return { ...state, closed: { ...state.closed, [action.path]: action.closed } };

    case 'set_data_action':
      if (action.data === state.data) {
        return state;
      }
      return {
        ...state,
        data: setDataAtPath(state, action.path, action.data),
        // Retain the working schema choices derived from the old data, for the new data
        // otherwise "breaking" data for a working schema will cause the working schema to
        // become whatever is the first one if none of them work. Users should explicitly
        // change the working schema after initial load.
        workingSchemaChoices: getEffectiveWorkingSchemaChoices(state),
        undoDataStack: extendUndoStack(state.undoDataStack, {
          data: state.data,
          focused: state.focused,
          selected: state.selected,
        }),
        redoDataStack: [],
      };

    case 'begin_edit_action':
      const path = action.path || normalizeToPath(state.focused || '');
      if (!path) {
        return state;
      }
      if (!canEditPathDirectly(state, path)) {
        return state;
      }
      const initialData = getAllDatasAndSchemas(state)[path].data;

      return { ...state, editing: path, editingData: initialData, focused: path, selected: { [path]: true } };

    case 'edit_value_action':
      return { ...state, editingData: action.newValue };

    case 'end_editing_action':
      return { ...state, editing: undefined };

    case 'begin_add_property_action':
      let p = action.path;
      if (!isInsertPropertyPlaceholder(action.path)) {
        p = 'addTo:' + action.path;
      }

      return { ...state, addingProperty: true, focused: p, selected: { [p]: true }, addingPropertyKey: '' };

    case 'edit_add_property_action':
      return { ...state, addingPropertyKey: action.keyToAdd };

    case 'end_add_property_action':
      if (state.addingPropertyKey === undefined || state.addingProperty === undefined || action.cancel || !state.focused) {
        return { ...state, addingProperty: undefined, addingPropertyKey: undefined };
      }
      const parentSchema = getAllDatasAndSchemas(state)[normalizeToPath(state.focused)].schema;
      const childSchema = getChildSchema(state.addingPropertyKey, parentSchema);
      const workingSchema = chooseWorkingSchema(undefined, buildWorkingSchemas(childSchema, state.schemaLib), state.schemaLib);
      return {
        ...state,
        addingProperty: false,
        data: setDataAtPath(
          state,
          joinJsonPointers(normalizeToPath(state.focused), state.addingPropertyKey),
          getValueForRequiredType(workingSchema.type),
        ),
        undoDataStack: extendUndoStack(state.undoDataStack, {
          data: state.data,
          focused: state.focused,
          selected: state.selected,
        }),
        redoDataStack: [],
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
      const s = {
        ...state,
        data: setDataAtPath(state, parent, newData),
        focused: previousRow,
        undoDataStack: action.skipSnapshot ? state.undoDataStack : extendUndoStack(state.undoDataStack, {
          data: state.data,
          focused: state.focused,
          selected: state.selected,
        }),
        redoDataStack: action.skipSnapshot ? state.redoDataStack : [],
      };
      const getNextRowResult = getNextRow(s, true);
      s.focused = getNextRowResult;
      s.selected = { [getNextRowResult]: true };

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

    case 'set_clipboard_mode_action':
      return { ...state, clipboardMode: action.mode };

    case 'set_filter_action':
      return { ...state, filter: action.filter };

    case 'undo_action': {
      if (state.undoDataStack.length === 0) {
        return state;
      }
      const newUndoStack = state.undoDataStack.slice();
      const undoSnapshot = newUndoStack.pop();
      const newRedoStack = extendUndoStack(state.redoDataStack, {
        data: state.data,
        focused: state.focused,
        selected: state.selected,
      });
      return {
        ...state,
        data: undoSnapshot?.data,
        focused: undoSnapshot?.focused,
        selected: undoSnapshot?.selected || {},
        undoDataStack: newUndoStack,
        redoDataStack: newRedoStack,
      };
    }
    case 'redo_action': {
      if (state.redoDataStack.length === 0) {
        return state;
      }
      const newRedoStack = state.redoDataStack.slice();
      const redoSnapshot = newRedoStack.pop();
      const newUndoStack = extendUndoStack(state.undoDataStack, {
        data: state.data,
        focused: state.focused,
        selected: state.selected,
      });
      return {
        ...state,
        data: redoSnapshot?.data,
        focused: redoSnapshot?.focused,
        selected: redoSnapshot?.selected || {},
        undoDataStack: newUndoStack,
        redoDataStack: newRedoStack,
      };
    }
    case 'take_snapshot_action':
      return {
        ...state,
        undoDataStack: extendUndoStack(action.state.undoDataStack, {
          data: action.state.data,
          focused: action.state.focused,
          selected: action.state.selected,
        }),
        redoDataStack: [],
      };
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

const extendUndoStack = (undoStack: any[], snapshot: UndoSnapshot): any[] => {
  const newStack = undoStack.slice();
  newStack.push(snapshot);
  return newStack;
};
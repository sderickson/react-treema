import { JsonPointer, TreemaFilter } from '../types';
import { OrderEntry } from './types';
import { ClipboardMode } from './types';
import { TreemaState } from './types';

// Select Action

type SelectPathAction = {
  type: 'select_path_action';
  path: JsonPointer | undefined;
  append?: boolean; // ctrl or cmd key - select
  multi?: boolean; // shift select
};

interface SelectPathActionOptions {
  append?: boolean;
  multi?: boolean;
}
export const selectPath = (path: JsonPointer | undefined, options?: SelectPathActionOptions): SelectPathAction => {
  return {
    type: 'select_path_action',
    path,
    append: options?.append,
    multi: options?.multi,
  };
};

// Navigation Actions

type NavigateUpAction = {
  type: 'navigate_up_action';
  skipAddProperties?: boolean;
};
type NavigateDownAction = {
  type: 'navigate_down_action';
  skipAddProperties?: boolean;
};
type NavigateInAction = {
  type: 'navigate_in_action';
};
type NavigateOutAction = {
  type: 'navigate_out_action';
};

export const navigateUp = (skipAddProperties?: boolean): NavigateUpAction => {
  return { type: 'navigate_up_action', skipAddProperties };
};
export const navigateDown = (skipAddProperties?: boolean): NavigateDownAction => {
  return { type: 'navigate_down_action', skipAddProperties };
};
export const navigateIn = (): NavigateInAction => {
  return { type: 'navigate_in_action' };
};
export const navigateOut = (): NavigateOutAction => {
  return { type: 'navigate_out_action' };
};

// Open/Close Action

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

// Edit Actions

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
};

export const editValue = (newValue: any): EditValueAction => {
  return {
    type: 'edit_value_action',
    newValue,
  };
};

type EndEditAction = {
  type: 'end_editing_action';
};

export const endEdit = (): EndEditAction => {
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

// Add Property Actions

type BeginAddPropertyAction = {
  type: 'begin_add_property_action';
  path: OrderEntry;
};

export const beginAddProperty = (path: JsonPointer): BeginAddPropertyAction => {
  return {
    type: 'begin_add_property_action',
    path,
  };
};

type EditAddPropertyAction = {
  type: 'edit_add_property_action';
  keyToAdd: string;
};

export const editAddProperty = (keyToAdd: string): EditAddPropertyAction => {
  return {
    type: 'edit_add_property_action',
    keyToAdd,
  };
};

type EndAddPropertyAction = {
  type: 'end_add_property_action';
  cancel: boolean;
};

export const endAddProperty = (cancel?: boolean): EndAddPropertyAction => {
  return {
    type: 'end_add_property_action',
    cancel: cancel || false,
  };
};

// Delete Action

type DeleteAction = {
  type: 'delete_action';
  path: JsonPointer;
  skipSnapshot: boolean;
};

export const deleteAction = (path: JsonPointer, skipSnapshot?: boolean): DeleteAction => {
  return {
    type: 'delete_action',
    path,
    skipSnapshot: skipSnapshot || false,
  };
};

// Working Schema Action

type SetWorkingSchemaAction = {
  type: 'set_working_schema_action';
  path: JsonPointer;
  index: number;
};

export const setWorkingSchema = (path: JsonPointer, index: number): SetWorkingSchemaAction => {
  return {
    type: 'set_working_schema_action',
    path,
    index,
  };
};

// Clipboard Action

type SetClipboardModeAction = {
  type: 'set_clipboard_mode_action';
  mode: ClipboardMode;
};

export const setClipboardMode = (mode: ClipboardMode): SetClipboardModeAction => {
  return {
    type: 'set_clipboard_mode_action',
    mode,
  };
};

// Filter Action

type SetFilterAction = {
  type: 'set_filter_action';
  filter?: TreemaFilter;
};

export const setFilter = (filter?: TreemaFilter): SetFilterAction => {
  return {
    type: 'set_filter_action',
    filter,
  };
};

// Undo/Redo Actions

type UndoAction = {
  type: 'undo_action';
};

export const undo = (): UndoAction => {
  return {
    type: 'undo_action',
  };
};

type RedoAction = {
  type: 'redo_action';
};

export const redo = (): RedoAction => {
  return {
    type: 'redo_action',
  };
};

type TakeSnapshotAction = {
  type: 'take_snapshot_action';
  state: TreemaState,
}

export const takeSnapshot = (state: TreemaState): TakeSnapshotAction => {
  return {
    type: 'take_snapshot_action',
    state,
  };
};

export type TreemaAction =
  | SelectPathAction
  | NavigateUpAction
  | NavigateDownAction
  | NavigateInAction
  | NavigateOutAction
  | SetPathClosedAction
  | SetDataAction
  | BeginEditAction
  | EditValueAction
  | EndEditAction
  | BeginAddPropertyAction
  | EditAddPropertyAction
  | EndAddPropertyAction
  | DeleteAction
  | SetWorkingSchemaAction
  | SetClipboardModeAction
  | SetFilterAction
  | UndoAction
  | RedoAction
  | TakeSnapshotAction;

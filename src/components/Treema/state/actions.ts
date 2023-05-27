import { JsonPointer } from '../types';



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

export type TreemaAction =
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

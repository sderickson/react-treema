import React, { ReactNode } from 'react';
import { WorkingSchema } from '../types';
import './base.scss';

export interface DisplayProps {
  data: any;
  schema: WorkingSchema;
}

export interface EditProps {
  data: any;
  schema: WorkingSchema;
  onChange: (data: any) => void;
}

export interface TreemaTypeDefinition {
  display: (props: DisplayProps) => ReactNode;
  edit?: React.ForwardRefRenderFunction<HTMLInputElement, EditProps>;

  // maybe set up useInput and useTextarea hooks?
  usesTextarea?: boolean;

  // just key off whether there's an "edit" function?
  editable?: boolean; // can be changed

  // also key off whether it's a collection?
  directlyEditable?: boolean; // can be changed at this level directly

  // and collection can just be based on ordered/keyed? Or that it's an array/object?
  // maybe I can just see what the data actually is.
  collection?: boolean; // acts like an array or object
  ordered?: boolean; // acts like an array
  keyed?: boolean; // acts like an object

  // currently unused... maybe don't need it
  //skipTab?: boolean; // is skipped over when tabbing between elements for editing
  
  // could just be the type or format string
  valueClassName?: string; // class to put onto the value div
  removeOnEmptyDelete?: boolean; // ???

  // I feel like this could just be a sort method
  sort?: boolean; // whether to keep the collection sorted
}

export interface TreemaTypeDefinitionWrapped {
  display: (props: DisplayProps) => ReactNode;
  edit?: React.ForwardRefExoticComponent<EditProps & React.RefAttributes<HTMLInputElement>>;
  usesTextarea?: boolean;

  editable: boolean; // can be changed
  directlyEditable: boolean; // can be changed at this level directly
  collection: boolean; // acts like an array or object
  ordered: boolean; // acts like an array
  keyed: boolean; // acts like an object
  // skipTab: boolean; // is skipped over when tabbing between elements for editing
  valueClassName: string; // class to put onto the value div
  removeOnEmptyDelete: boolean; // ???
  sort: boolean; // whether to keep the collection sorted
}

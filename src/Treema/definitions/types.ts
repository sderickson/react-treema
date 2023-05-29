import React, { ReactNode } from 'react';
import { WorkingSchema } from "../types";
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
  usesTextarea?: boolean;
  
  editable?: boolean;            // can be changed
  directlyEditable?: boolean;    // can be changed at this level directly
  collection?: boolean;          // acts like an array or object
  ordered?: boolean;             // acts like an array
  keyed?: boolean;               // acts like an object
  skipTab?: boolean;             // is skipped over when tabbing between elements for editing
  valueClassName?: string;       // class to put onto the value div
  removeOnEmptyDelete?: boolean; // ???
  sort?: boolean;                // whether to keep the collection sorted
}

export interface TreemaTypeDefinitionWrapped {
  display: (props: DisplayProps) => ReactNode;
  edit?: React.ForwardRefExoticComponent<EditProps & React.RefAttributes<HTMLInputElement>>;
  usesTextarea?: boolean;

  editable: boolean;            // can be changed
  directlyEditable: boolean;    // can be changed at this level directly
  collection: boolean;          // acts like an array or object
  ordered: boolean;             // acts like an array
  keyed: boolean;               // acts like an object
  skipTab: boolean;             // is skipped over when tabbing between elements for editing
  valueClassName: string;       // class to put onto the value div
  removeOnEmptyDelete: boolean; // ???
  sort: boolean;                // whether to keep the collection sorted
}

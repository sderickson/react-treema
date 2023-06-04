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
  id: string;
  display: (props: DisplayProps) => ReactNode;
  edit?: React.ForwardRefRenderFunction<HTMLInputElement, EditProps>;
}

export interface TreemaTypeDefinitionWrapped {
  id: string;
  display: (props: DisplayProps) => ReactNode;
  edit?: React.ForwardRefExoticComponent<EditProps & React.RefAttributes<HTMLInputElement>>;
}

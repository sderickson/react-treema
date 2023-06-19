import React from 'react';
import { JsonPointer, WorkingSchema } from '../types';
import './base.scss';

export interface DisplayProps {
  data: any;
  schema: WorkingSchema;
  path: JsonPointer;
}

export interface EditProps {
  data: any;
  schema: WorkingSchema;
  onChange: (data: any) => void;
}

export interface TreemaTypeDefinition {
  id: string;
  Display: React.FC<DisplayProps>;
  Edit?: React.FC<EditProps>;
}

export interface TreemaTypeDefinitionWrapped {
  id: string;
  Display: React.FC<DisplayProps>;
  Edit?: React.FC<EditProps>;
}

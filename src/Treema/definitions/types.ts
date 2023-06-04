import React from 'react';
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
  display: React.FC<DisplayProps>;
  edit?: React.FC<EditProps>;
}

export interface TreemaTypeDefinitionWrapped {
  id: string;
  display: React.FC<DisplayProps>;
  edit?: React.FC<EditProps>;
}

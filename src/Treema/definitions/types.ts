import React, { ReactNode } from 'react';
import { WorkingSchema } from "../types";

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
}

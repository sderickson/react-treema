import React from 'react';
import { TreemaTypeDefinition } from './types';

export const TreemaNullNodeDefinition: TreemaTypeDefinition = {
  display: () => {
    return <span>null</span>;
  },
  editable: false,
};
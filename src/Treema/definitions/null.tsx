import React from 'react';
import { TreemaTypeDefinition } from './types';

export const TreemaNullNodeDefinition: TreemaTypeDefinition = {
  valueClassName: 'treema-null',
  editable: false,

  display: () => {
    return <span>null</span>;
  },
};

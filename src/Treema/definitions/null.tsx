import React from 'react';
import { TreemaTypeDefinition } from './types';

export const TreemaNullNodeDefinition: TreemaTypeDefinition = {
  id: 'null',
  display: () => {
    return <span>null</span>;
  },
};

import React from 'react';
import { TreemaTypeDefinition } from '../types';

export const TreemaNullNodeDefinition: TreemaTypeDefinition = {
  id: 'null',
  Display: () => {
    return <span>null</span>;
  },
};

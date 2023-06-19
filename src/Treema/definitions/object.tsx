import React from 'react';
import { DisplayProps, TreemaTypeDefinition } from './types';

export const TreemaObjectNodeDefinition: TreemaTypeDefinition = {
  id: 'object',
  Display: (_: DisplayProps) => {
    return <></>;
  },
};

import React from 'react';
import { TreemaTypeDefinition } from '../types';

export const TreemaIntegerNodeDefinition: TreemaTypeDefinition = {
  display: ({ data }) => {
    return <span>{data}</span>;
  },
};
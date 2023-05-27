import React from 'react';
import { TreemaTypeDefinition } from '../types';

export const TreemaBooleanNodeDefinition: TreemaTypeDefinition = {
  display: ({ data }) => {
    return <span>{JSON.stringify(data)}</span>;
  },
};
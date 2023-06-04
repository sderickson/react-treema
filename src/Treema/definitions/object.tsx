import React from 'react';
import { DisplayProps, TreemaTypeDefinition } from './types';

export const TreemaObjectNodeDefinition: TreemaTypeDefinition = {
  id: 'object',
  display: ({ data, schema }: DisplayProps) => {
    const display = schema.displayProperty ? `{${JSON.stringify(data[schema.displayProperty])}}` : JSON.stringify(data);

    return <span>{display}</span>;
  },
};

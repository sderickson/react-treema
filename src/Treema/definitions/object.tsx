import React from 'react';
import { TreemaTypeDefinition } from './types';

export const TreemaObjectNodeDefinition: TreemaTypeDefinition = {
  valueClassName: 'treema-object',
  directlyEditable: false,
  keyed: true,
  collection: true,

  display: ({ data, schema }) => {
    const display = schema.displayProperty ? `{${JSON.stringify(data[schema.displayProperty])}}` : JSON.stringify(data);

    return <span>{display}</span>;
  },
};

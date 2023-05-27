import React from 'react';
import { TreemaTypeDefinition, EditProps } from '../types';

export const TreemaNumberNodeDefinition: TreemaTypeDefinition = {
  display: ({ data }) => {
    return <span>{data}</span>;
  },
  edit: ({ data, schema, onChange }: EditProps, ref) => {
    return <input
      value={data}
      ref={ref}
      onChange={(e) => { onChange(parseFloat(e.target.value)); }}
      type='number'
      min={schema.minimum || undefined}
      max={schema.maximum || undefined}
    />;
  }
};


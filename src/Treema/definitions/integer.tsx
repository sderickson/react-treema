import React from 'react';
import { TreemaTypeDefinition, EditProps } from './types';

export const TreemaIntegerNodeDefinition: TreemaTypeDefinition = {
  valueClassName: 'treema-integer',
  
  display: ({ data }) => {
    return <span>{data}</span>;
  },

  edit: ({ data, schema, onChange }: EditProps, ref) => {
    return <input
      value={data}
      ref={ref}
      onChange={(e) => { onChange(parseInt(e.target.value)); }}
      type='number'
      min={schema.minimum || undefined}
      max={schema.maximum || undefined}
    />;
  }
};
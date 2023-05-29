import React from 'react';
import { TreemaTypeDefinition, EditProps } from './types';

const stringInputTypes = [
  'color',
  'date',
  'datetime-local',
  'email',
  'password',
  'tel',
  'text',
  'time',
  'url',
]
export const TreemaStringNodeDefinition: TreemaTypeDefinition = {
  valueClassName: 'treema-string',

  display: ({ data }) => {
    return <span>{data}</span>;
  },
  
  edit: ({ data, schema, onChange }: EditProps, ref) => {
    return <input
      value={data}
      ref={ref}
      onChange={(e) => { onChange(e.target.value); }}
      maxLength={schema.maxLength || undefined}
      minLength={schema.minLength || undefined}
      type={schema.format && stringInputTypes.includes(schema.format) ? schema.format : undefined}
    />;
  },
};
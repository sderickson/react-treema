import React from 'react';
import { TreemaTypeDefinition } from './types';
import { useTreemaInput } from './hooks';

const stringInputTypes = ['color', 'date', 'datetime-local', 'email', 'password', 'tel', 'text', 'time', 'url'];
export const TreemaStringNodeDefinition: TreemaTypeDefinition = {
  id: 'string',
  Display: ({ data }) => {
    return <span>{data}</span>;
  },

  Edit: ({ data, schema, onChange }) => {
    const ref = useTreemaInput();

    return (
      <input
        value={data}
        ref={ref}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        maxLength={schema.maxLength || undefined}
        minLength={schema.minLength || undefined}
        type={schema.format && stringInputTypes.includes(schema.format) ? schema.format : undefined}
        data-testid="treema-edit-string-input"
      />
    );
  },
};

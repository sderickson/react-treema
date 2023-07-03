import React from 'react';
import { TreemaTypeDefinition } from './types';
import { useTreemaSelect } from './hooks';

export const TreemaEnumNodeDefinition: TreemaTypeDefinition = {
  id: 'enum',
  Display: ({ data }) => {
    return <span>{JSON.stringify(data)}</span>;
  },

  Edit: ({ data, schema, onChange }) => {
    const ref = useTreemaSelect();

    return (
      <select
        value={data}
        ref={ref}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        data-testid="treema-edit-enum-input"
      >
        {(schema.enum || []).map((value, index) => (
          <option key={index} value={value}>
            {value}
          </option>
        ))}
      </select>
    );
  },
};

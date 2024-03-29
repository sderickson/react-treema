import React from 'react';
import { TreemaTypeDefinition } from '../types';
import { useTreemaEditRef } from './hooks';

export const TreemaIntegerNodeDefinition: TreemaTypeDefinition = {
  id: 'integer',

  Display: ({ data }) => {
    return <span>{data}</span>;
  },

  Edit: ({ data, schema, onChange }) => {
    const ref = useTreemaEditRef();

    return (
      <input
        value={data}
        ref={ref}
        onChange={(e) => {
          onChange(parseInt(e.target.value));
        }}
        type="number"
        min={schema.minimum || undefined}
        max={schema.maximum || undefined}
      />
    );
  },
};

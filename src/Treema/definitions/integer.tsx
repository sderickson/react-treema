import React from 'react';
import { TreemaTypeDefinition, EditProps, DisplayProps } from './types';
import { useTreemaInput } from './hooks';

export const TreemaIntegerNodeDefinition: TreemaTypeDefinition = {
  id: 'integer',

  Display: ({ data }: DisplayProps) => {
    return <span>{data}</span>;
  },

  Edit: ({ data, schema, onChange }: EditProps) => {
    const ref = useTreemaInput();

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

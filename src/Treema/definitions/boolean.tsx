import React from 'react';
import { TreemaTypeDefinition } from './types';

export const TreemaBooleanNodeDefinition: TreemaTypeDefinition = {
  display: ({ data }) => {
    return <span>{JSON.stringify(data)}</span>;
  },
  edit: ({ data, onChange }, ref) => {
    return <span>
      {JSON.stringify(data)}
      <input
        type="checkbox"
        checked={data}
        ref={ref}
        onChange={(e) => { onChange(e.target.checked); }}
      />
    </span>
  }
};
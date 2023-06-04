import React, { useCallback } from 'react';
import { TreemaTypeDefinition, EditProps } from './types';
import { useTreemaKeyboardEvent } from './hooks';

export const TreemaLongStringSchema = {
  type: 'string',
  format: 'long-string',
}

export const TreemaLongStringNodeDefinition: TreemaTypeDefinition = {
  valueClassName: 'treema-long-string treema-multiline',

  display: ({ data }) => {
    return <div>{data}</div>;
  },

  edit: ({ data, schema, onChange }: EditProps, ref) => {
    useTreemaKeyboardEvent(useCallback((e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
        return false;
      }
      return true;
    }, []));
    
    return (
      <textarea
        value={data}
        ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        maxLength={schema.maxLength || undefined}
        minLength={schema.minLength || undefined}
        data-testid="treema-edit-long-string-input"
      />
    );
  },
};

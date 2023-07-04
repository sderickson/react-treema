import React, { useCallback } from 'react';
import { TreemaSupportedJsonSchema, TreemaTypeDefinition } from '../types';
import { useTreemaKeyboardEvent, useTreemaEditRef } from './hooks';

export const TreemaLongStringSchema: TreemaSupportedJsonSchema = {
  '$id': 'https://example.com/long-string.schema.json',
  type: 'string',
};

/**
 * Not included in Treema by default! This is an example of how to customize rendering of a string.
 */
export const TreemaLongStringNodeDefinition: TreemaTypeDefinition = {
  id: 'long-string',
  schema: TreemaLongStringSchema,
  shortened: false,
  Display: ({ data }) => {
    return <div>{data}</div>;
  },

  Edit: ({ data, schema, onChange }) => {
    const ref = useTreemaEditRef();
    useTreemaKeyboardEvent(
      useCallback((e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
          return false;
        }

        return true;
      }, []),
    );

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

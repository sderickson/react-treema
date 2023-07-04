import React, { useCallback } from 'react';
import { TreemaTypeDefinition, EditProps, DisplayProps } from './types';
import { useTreemaKeyboardEvent, useTreemaTextArea } from './hooks';

export const TreemaLongStringSchema = {
  type: 'string',
  format: 'long-string',
};

/**
 * Not included in Treema by default! This is an example of how to customize rendering of a string.
 */
export const TreemaLongStringNodeDefinition: TreemaTypeDefinition = {
  id: 'long-string',
  shortened: false,
  Display: ({ data }: DisplayProps) => {
    return <div>{data}</div>;
  },

  Edit: ({ data, schema, onChange }: EditProps) => {
    const ref = useTreemaTextArea();
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

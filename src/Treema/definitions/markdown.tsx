import React, { useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import AceEditor from 'react-ace';
import { TreemaSupportedJsonSchema, TreemaTypeDefinition } from '../types';
import { useTreemaKeyboardEvent, useTreemaEditRef } from './hooks';

import 'ace-builds/src-noconflict/mode-markdown';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';

export const TreemaMarkdownSchema: TreemaSupportedJsonSchema = {
  '$id': 'https://example.com/markdown.schema.json',
  type: 'string',
};

/**
 * Not included in Treema by default! This is an example of how to incorporate 3rd party libraries.
 */
export const TreemaMarkdownNodeDefinition: TreemaTypeDefinition = {
  id: 'markdown',
  schema: TreemaMarkdownSchema,

  Display: (props) => {
    const { data } = props;

    return <ReactMarkdown children={data} />;
  },

  Edit: (props) => {
    const { data, onChange } = props;
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
      <AceEditor
        ref={ref}
        value={data}
        mode="markdown"
        theme="github"
        focus={true}
        width="100%"
        onChange={onChange}
        name="markdown-editor"
        editorProps={{ $blockScrolling: true }}
      />
    );
  },
};

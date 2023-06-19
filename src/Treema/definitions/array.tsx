import React, { useContext } from 'react';
import { TreemaTypeDefinition } from './types';
import { getWorkingSchema, getDefinitionAtPath } from '../state/selectors';
import { TreemaContext } from '../context';

export const TreemaArrayNodeDefinition: TreemaTypeDefinition = {
  id: 'array',
  Display: ({ data, path, schema }) => {
    const context = useContext(TreemaContext);
    const { state } = context;
    if (!data) {
      return <></>;
    }

    if (data.length === 0) {
      if (schema.title) {
        return <span>(empty {schema.title})</span>;
      }
      return <span>(empty)</span>;
    }

    const children = data.slice(0, 3).map((child: any, index: number) => {
      const childPath = path + '/' + index;
      const childWorkingSchema = getWorkingSchema(state, childPath);
      const definition = getDefinitionAtPath(state, childPath);
      return definition.Display({ data: child, schema: childWorkingSchema, path: childPath });
    });
    return <span>{children}</span>;
  },

  /*
  TODO

    open: ->
      @data.sort(@sortFunction) if @data and @sort
      super(arguments...)

    sortFunction: (a, b) ->
      return 1 if a > b
      return -1 if a < b
      return 0

  */
};

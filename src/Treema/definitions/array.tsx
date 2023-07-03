import React, { useContext } from 'react';
import { TreemaTypeDefinition } from './types';
import { getWorkingSchema, getDefinitionAtPath } from '../state/selectors';
import { TreemaContext } from '../context';
import { joinJsonPointers } from '../utils';

export const TreemaArrayNodeDefinition: TreemaTypeDefinition = {
  id: 'array',
  shortened: true,
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

    const children: JSX.Element[] = data.slice(0, 3).map((child: any, index: number) => {
      const childPath = joinJsonPointers(path, index.toString());
      const childWorkingSchema = getWorkingSchema(state, childPath);
      const definition = getDefinitionAtPath(state, childPath);

      return <definition.Display data={child} schema={childWorkingSchema} path={childPath} key={childPath} />;
    });

    // Join the children with pipes.
    const joinedChildren: JSX.Element[] = [];
    children.forEach((child, index) => {
      joinedChildren.push(child as JSX.Element);
      if (index < children.length - 1) {
        joinedChildren.push(<span key={index}> | </span>);
      }
    });

    return <span>{joinedChildren}</span>;
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

import React, { useContext } from 'react';
import { getWorkingSchema } from '../state/selectors';
import { TreemaContext } from '../context';
import { TreemaTypeDefinition } from '../types';
import { getType, joinJsonPointers } from '../utils';

export const TreemaObjectNodeDefinition: TreemaTypeDefinition = {
  id: 'object',
  shortened: true,
  Display: ({ data, schema, path }) => {
    const context = useContext(TreemaContext);
    const { state } = context;

    if (!data) {
      return <></>;
    }

    // If the schema specifies a single property to display, display its value.
    if (schema.displayProperty) {
      const displayValue = data[schema.displayProperty];
      if (displayValue) {
        if (typeof displayValue === 'object') { // if for some reason it's an array or object...
          return <span>{JSON.stringify(displayValue)}</span>;
        }
        return <span>{displayValue}</span>;
      }
    }

    // Find the first three properties that have a value, create a truncated string for each of them.
    let children = Object.entries(data)
      .map(([key, value]) => {
        if (value === undefined) {
          return null;
        }
        const childPath = joinJsonPointers(path, key);
        const childSchema = getWorkingSchema(state, childPath);
        const name = childSchema.title || key;
        if (['object', 'array'].includes(getType(value))) {
          return name;
        }
        let valueStringish = getType(value) === 'string' ? value : JSON.stringify(value);
        if (getType(value) === 'undefined') {
          valueStringish = 'undefined';
        }
        let valueString = valueStringish as string;
        if (valueString.length > 20) {
          valueString = valueString.slice(0, 20) + ' ...';
        }

        return `${name}=${valueString}`;
      })
      .filter((v) => v);

    // If there are more than three properties, truncate the list.
    if (children.length > 3) {
      children = children.slice(0, 3);
      children.push('...');
    }

    // Join the children with commas.
    const joinedChildren: string[] = [];
    children.forEach((child, index) => {
      joinedChildren.push(child as string);
      if (index < children.length - 1) {
        joinedChildren.push(', ');
      }
    });

    return <span>{joinedChildren.join('')}</span>;
  },
};

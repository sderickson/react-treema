import React, { useContext } from 'react';
import { getWorkingSchema } from '../state/selectors';
import { TreemaContext } from '../context';
import { DisplayProps, TreemaTypeDefinition } from './types';
import { getType } from '../utils';

export const TreemaObjectNodeDefinition: TreemaTypeDefinition = {
  id: 'object',
  shortened: true,
  Display: ({ data, schema, path }: DisplayProps) => {
    const context = useContext(TreemaContext);
    const { state } = context;

    if (!data) {
      return <></>;
    }

    // If the schema specifies a single property to display, display its value.
    if (schema.displayProperty) {
      const displayValue = data[schema.displayProperty];
      if (displayValue) {
        return <span>{displayValue}</span>;
      }
    }

    // Find the first three properties that have a value, create a truncated string for each of them.
    let i = 0;
    let children = Object.entries(data)
      .map(([key, value]) => {
        if (value === undefined) {
          return null;
        }
        i += 1;
        const childPath = path + '/' + key;
        const childSchema = getWorkingSchema(state, childPath);
        const name = childSchema.title || key;
        if (['object', 'array'].includes(getType(value))) {
          return <span key={'key:' + key}>{name}</span>;
        }
        let valueStringish = getType(value) === 'string' ? value : JSON.stringify(value);
        if (getType(value) === 'undefined') {
          valueStringish = 'undefined';
        }
        let valueString = valueStringish as string;
        if (valueString.length > 20) {
          valueString = valueString.slice(0, 20) + ' ...';
        }

        return (
          <span key={'key:' + key}>
            {name}={valueString}
          </span>
        );
      })
      .filter((v) => v);

    // If there are more than three properties, truncate the list.
    if (children.length > 3) {
      children = children.slice(0, 3);
      children.push(<span key="...">...</span>);
    }

    // Join the children with commas.
    const joinedChildren: JSX.Element[] = [];
    children.forEach((child, index) => {
      joinedChildren.push(child as JSX.Element);
      if (index < children.length - 1) {
        joinedChildren.push(<span key={'index:' + index}>, </span>);
      }
    });

    return <span>{joinedChildren}</span>;
  },
};

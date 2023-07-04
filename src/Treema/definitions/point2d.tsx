import React from 'react';
import { DisplayProps, TreemaTypeDefinition } from '../types';

interface Point2d {
  x: number;
  y: number;
}

export const Point2dSchema = {
  type: 'object',
  format: 'point2d',
  properties: {
    x: {
      type: 'number',
    },
    y: {
      type: 'number',
    },
    additionalProperties: false,
  },
};

/**
 * Not included in Treema by default! This is an example of how to customize display of a complex object.
 */
export const TreemaPoint2dNodeDefinition: TreemaTypeDefinition = {
  id: 'object',
  Display: (props: DisplayProps) => {
    const { data } = props as { data: Point2d };

    return (
      <span>
        ({data.x}, {data.y})
      </span>
    );
  },
};

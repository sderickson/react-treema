import React from 'react';
import { TreemaSupportedJsonSchema, TreemaTypeDefinition } from '../types';

interface Point2d {
  x: number;
  y: number;
}

export const Point2dSchema: TreemaSupportedJsonSchema = {
  '$id': 'https://example.com/point-2d.schema.json',
  type: 'object',
  properties: {
    x: {
      type: 'number',
    },
    y: {
      type: 'number',
    },
  },
  additionalProperties: false,
};

/**
 * Not included in Treema by default! This is an example of how to customize display of a complex object.
 */
export const TreemaPoint2dNodeDefinition: TreemaTypeDefinition = {
  id: 'point-2d',
  schema: Point2dSchema,
  Display: (props) => {
    const { data } = props as { data: Point2d };

    return (
      <span>
        ({data.x}, {data.y})
      </span>
    );
  },
};

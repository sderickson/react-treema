import React from 'react';
import { TreemaTypeDefinition } from './types';

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

export const TreemaPoint2dNodeDefinition: TreemaTypeDefinition = {
  id: 'object',
  display: (props) => {
    const { data } = props as { data: Point2d };
    return <span>({data.x}, {data.y})</span>;
  },
};

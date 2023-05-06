import React, { FC, ReactNode, ButtonHTMLAttributes } from 'react';
import './styles.css';

export interface TreemaNodeProps {
  data: any;
  schema: any;
}

export const TreemaNode: FC<TreemaNodeProps> = ({ data, schema }) => (
  <div className="treema-node">
    <h1>Schema</h1>
    <div>{JSON.stringify(schema)}</div>
    <h1>Data</h1>
    <div>{JSON.stringify(data)}</div>
  </div>
);

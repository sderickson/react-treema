import React, { FC, ReactNode, ButtonHTMLAttributes } from 'react';
import './styles.css';

export interface TreemaNodeProps {
  data: any;
  schema: SupportedJsonSchema;
}

export interface SupportedJsonSchema {
  type: 'null' | 'boolean' | 'object' | 'array' | 'number' | 'string';
  items: SupportedJsonSchema;
  properties: {[key: string]: SupportedJsonSchema};
}

const TreemaObjectNode: FC<TreemaNodeProps> = ({ data, schema }) => {
  const propSchemas = schema.properties;
  const children = Object.keys(data).map((key: string) => {
    const propSchema = propSchemas[key];
    const component = typeMapping[propSchema.type];
    return component({ data: data[key], schema: propSchema });
  });
  return <TreemaNodeLayout display={<span>this is an object</span>} open={true}>
    {children}
  </TreemaNodeLayout>;
};

const TreemaArrayNode: FC<TreemaNodeProps> = ({ data, schema }) => {
  const itemSchema = schema.items;
  const component = typeMapping[itemSchema.type];
  return <TreemaNodeLayout display={<span>this is an array</span>} open={true}>
    {data.map((item: any) => {
      return component({ data: item, schema: itemSchema });
    })}
  </TreemaNodeLayout>;
}

const TreemaStringNode: FC<TreemaNodeProps> = ({ data, schema }) => {
  return TreemaNodeLayout({ display: <span>{data}</span> });
}

const TreemaNumberNode: FC<TreemaNodeProps> = ({ data, schema }) => {
  return TreemaNodeLayout({ display: <span>{data}</span> });
}

const TreemaBooleanNode: FC<TreemaNodeProps> = ({ data, schema }) => {
  return TreemaNodeLayout({ display: <span>{data}</span> });
}

const TreemaNullNode: FC<TreemaNodeProps> = ({ data, schema }) => {
  return TreemaNodeLayout({ display: <span>null</span> });
}

const typeMapping: {[key: string]: FC<TreemaNodeProps>} = {
  'object': TreemaObjectNode,
  'array': TreemaArrayNode,
  'string': TreemaStringNode,
  'number': TreemaNumberNode,
  'boolean': TreemaBooleanNode,
  'null': TreemaNullNode,
};

export interface TreemaNodeLayoutProps {
  display: ReactNode;
  open?: boolean;
  children?: JSX.Element,
}

export const TreemaNodeLayout: FC<TreemaNodeLayoutProps> = ({ open, display, children }) => {
  // stateless, common way to layout treema nodes generally. Should not include any schema specific logic.
  return <div className="treema-node">
    {open !== undefined && open !== null && <span className="treema-toggle">{open ? 'O' : 'X' }</span>}
    {display}
    {children ? <div className="treema-children">{children}</div> : null}
  </div>;
};

export const TreemaNode: FC<TreemaNodeProps> = ({ data, schema }) => {
  const type = schema.type;

  const component = typeMapping[type];
  return component({ data, schema });
};
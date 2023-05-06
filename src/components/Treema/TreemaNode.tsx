import React, { FC, ReactNode, ButtonHTMLAttributes } from 'react';
import './styles.css';

export interface TreemaNodeProps {
  data: any;
  schema: SupportedJsonSchema;
  key?: string;
}

export interface SupportedJsonSchema {
  type: 'null' | 'boolean' | 'object' | 'array' | 'number' | 'string';
  items?: SupportedJsonSchema;
  properties?: {[key: string]: SupportedJsonSchema};
}

const TreemaObjectNode: FC<TreemaNodeProps> = ({ data, schema, key }) => {
  const propSchemas = schema.properties;
  if (!propSchemas) return null;
  const children = Object.keys(data).map((key: string) => {
    const propSchema = propSchemas[key];
    const component = typeMapping[propSchema.type];
    return component({ data: data[key], schema: propSchema, key: key });
  }).filter((e) => e);
  return <TreemaNodeLayout display={<span>this is an object</span>} open={true} key={key}>
    <>{children}</>
  </TreemaNodeLayout>;
};

const TreemaArrayNode: FC<TreemaNodeProps> = ({ data, schema }) => {
  const itemSchema = schema.items;
  if (!itemSchema) return null;
  const component = typeMapping[itemSchema.type];
  return <TreemaNodeLayout display={<span>this is an array</span>} open={true}>
    {data.map((item: any, index: number) => {
      return component({ data: item, schema: itemSchema, key: index+'' });
    })}
  </TreemaNodeLayout>;
}

const TreemaStringNode: FC<TreemaNodeProps> = ({ data, schema, key }) => {
  return TreemaNodeLayout({ display: <span>{data}</span>, key: key });
}

const TreemaNumberNode: FC<TreemaNodeProps> = ({ data, schema, key }) => {
  return TreemaNodeLayout({ display: <span>{data}</span>, key: key });
}

const TreemaBooleanNode: FC<TreemaNodeProps> = ({ data, schema, key }) => {
  return TreemaNodeLayout({ display: <span>{JSON.stringify(data)}</span>, key: key });
}

const TreemaNullNode: FC<TreemaNodeProps> = ({key}) => {
  return TreemaNodeLayout({ display: <span>null</span>, key: key });
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
  key?: string;
}

export const TreemaNodeLayout: FC<TreemaNodeLayoutProps> = ({ open, display, children, key }) => {
  // stateless, common way to layout treema nodes generally. Should not include any schema specific logic.
  return <div className="treema-node" key={key}>
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
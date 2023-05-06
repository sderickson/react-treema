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
  properties?: { [key: string]: SupportedJsonSchema };
  displayProperty?: string;
  title?: string;
}

const TreemaObjectNode: FC<TreemaNodeProps> = ({ data, schema, key }) => {
  const propSchemas = schema.properties;
  if (!propSchemas) return null;
  const children = Object.keys(data)
    .map((key: string) => {
      const propSchema = propSchemas[key];
      const component = typeMapping[propSchema.type];

      return component({ data: data[key], schema: propSchema, key: key });
    })
    .filter((e) => e);
  const display = schema.displayProperty ? `{${JSON.stringify(data[schema.displayProperty])}}` : JSON.stringify(data);

  return (
    <TreemaNodeLayout display={<span>{display}</span>} open={true} key={key} name={schema.title}>
      <>{children}</>
    </TreemaNodeLayout>
  );
};

const TreemaArrayNode: FC<TreemaNodeProps> = ({ data, schema }) => {
  const itemSchema = schema.items;
  if (!itemSchema) return null;
  const component = typeMapping[itemSchema.type];

  return (
    <TreemaNodeLayout display={<span></span>} open={true} name={schema.title}>
      {data.map((item: any, index: number) => {
        return component({ data: item, schema: itemSchema, key: index + '' });
      })}
    </TreemaNodeLayout>
  );
};

const TreemaStringNode: FC<TreemaNodeProps> = ({ data, schema, key }) => {
  return TreemaNodeLayout({
    display: <span>{data}</span>,
    key: key,
    name: schema.title || key,
  });
};

const TreemaNumberNode: FC<TreemaNodeProps> = ({ data, schema, key }) => {
  return TreemaNodeLayout({ display: <span>{data}</span>, key: key, name: schema.title });
};

const TreemaBooleanNode: FC<TreemaNodeProps> = ({ data, schema, key }) => {
  return TreemaNodeLayout({ display: <span>{JSON.stringify(data)}</span>, key: key, name: schema.title });
};

const TreemaNullNode: FC<TreemaNodeProps> = ({ key, schema }) => {
  return TreemaNodeLayout({ display: <span>null</span>, key: key, name: schema.title });
};

const typeMapping: { [key: string]: FC<TreemaNodeProps> } = {
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
  children?: JSX.Element;
  key?: string;
  name?: string;
}

export const TreemaNodeLayout: FC<TreemaNodeLayoutProps> = ({ open, display, children, key, name }) => {
  // Common way to layout treema nodes generally. Should not include any schema specific logic.
  const [isOpen, setIsOpen] = React.useState(open);

  return (
    <div className="treema-node" key={key}>
      {open !== undefined && open !== null && (
        <span className="treema-toggle" role="button" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? 'O' : 'X'}
        </span>
      )}
      {name && <span className="treema-name">{name}: </span>}
      {display}
      {children && isOpen ? <div className="treema-children">{children}</div> : null}
    </div>
  );
};

export const TreemaNode: FC<TreemaNodeProps> = ({ data, schema }) => {
  const type = schema.type;

  const component = typeMapping[type];

  return component({ data, schema });
};

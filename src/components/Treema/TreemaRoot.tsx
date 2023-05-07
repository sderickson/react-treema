import React, { FC, ReactNode, useContext, useReducer } from 'react';
import './styles.css';
import { SchemaValidator, SupportedJsonSchema } from './types';
import { noopValidator } from './utils';
import { reducer, TreemaContext } from './state';

interface TreemaTypeDefinition {
  display: (data: any, schema: SupportedJsonSchema) => ReactNode;
  renderChildren?: (data: any, schema: SupportedJsonSchema) => ReactNode[];
}

const TreemaObjectNodeDefinition: TreemaTypeDefinition = {
  display: (data, schema) => {
    const propSchemas = schema.properties;
    if (!propSchemas) return null;
    const display = schema.displayProperty ? `{${JSON.stringify(data[schema.displayProperty])}}` : JSON.stringify(data);
    return <span>{display}</span>;
  },

  renderChildren: (data, schema) => {
    const propSchemas = schema.properties;
    if (!propSchemas) return [];
    
    return Object.keys(data)
      .map((key: string) => {
        const propSchema = propSchemas[key];  
        return <TreemaNodeLayout data={data[key]} schema={propSchema} key={key} />;
      })
      .filter((e) => e);
  }
} 

const TreemaArrayNodeDefinition: TreemaTypeDefinition = {
  display: () => {
    return <span></span>;
  },

  renderChildren: (data, schema) => {
    const itemSchema = schema.items;
    if (!itemSchema) return null;
      return data.map((item: any, index: number) => {
        return <TreemaNodeLayout data={item} schema={itemSchema} key={index + ''} />;
      });
  }
};

const TreemaStringNodeDefinition: TreemaTypeDefinition = {
  display: (data) => {
    return <span>{data}</span>;
  }
}

const TreemaNumberNodeDefinition: TreemaTypeDefinition = {
  display: (data) => {
    return <span>{data}</span>;
  }
}

const TreemaBooleanNodeDefinition: TreemaTypeDefinition = {
  display: (data) => {
    return <span>{JSON.stringify(data)}</span>;
  }
}

const TreemaNullNodeDefinition: TreemaTypeDefinition = {
  display: () => {
    return <span>null</span>;
  }
}

const typeMapping: { [key: string]: TreemaTypeDefinition } = {
  'object': TreemaObjectNodeDefinition,
  'array': TreemaArrayNodeDefinition,
  'string': TreemaStringNodeDefinition,
  'number': TreemaNumberNodeDefinition,
  'boolean': TreemaBooleanNodeDefinition,
  'null': TreemaNullNodeDefinition,
};

export interface TreemaNodeProps {
  data: any;
  schema: SupportedJsonSchema;
  key?: string;
}

export interface TreemaNodeLayoutProps {
  display: ReactNode;
  open?: boolean;
  children?: JSX.Element;
  key?: string;
  name?: string;
}

export const TreemaNodeLayout: FC<TreemaNodeProps> = ({ data, schema, key }) => {
  // Common way to layout treema nodes generally. Should not include any schema specific logic.
  const [isOpen, setIsOpen] = React.useState(true);
  const { dispatch } = useContext(TreemaContext);
  const name = schema.title || key;
  const canOpen = schema.type === 'object' || schema.type === 'array';
  const definition = typeMapping[schema.type];
  const children = definition.renderChildren ? definition.renderChildren(data, schema) : [];

  return (
    <div className="treema-node" key={key} onClick={() => dispatch({ 'type': 'click' })}>
      {canOpen && (
        <span className="treema-toggle" role="button" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? 'O' : 'X'}
        </span>
      )}
      {name && <span className="treema-name">{name}: </span>}
      {definition.display(data, schema)}
      {children && canOpen && isOpen ? <div className="treema-children">{children}</div> : null}
    </div>
  );
};

export interface TreemaRootProps {
  data: any;
  schema: SupportedJsonSchema;
  validator?: SchemaValidator;
}

export const TreemaRoot: FC<TreemaRootProps> = ({ data, schema, validator }) => {
  const [state, dispatch] = useReducer(reducer, { data, validator: validator || noopValidator, rootSchema: schema });

  return (<TreemaContext.Provider value={{ state, dispatch }}>
    <TreemaNodeLayout
      data={data}
      schema={schema}
    />
  </TreemaContext.Provider>);
};

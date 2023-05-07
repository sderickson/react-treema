import React, { FC, ReactNode, useCallback, useContext, useReducer } from 'react';
import './styles.css';
import { SchemaValidator, SupportedJsonSchema } from './types';
import { noopValidator } from './utils';
import { reducer, TreemaContext } from './state';
import { selectPath } from './state';

interface TreemaTypeDefinition {
  display: (props: TreemaNodeProps) => ReactNode;
  renderChildren?: (props: TreemaNodeProps) => ReactNode[];
}

const TreemaObjectNodeDefinition: TreemaTypeDefinition = {
  display: ({data, schema}) => {
    const propSchemas = schema.properties;
    if (!propSchemas) return null;
    const display = schema.displayProperty ? `{${JSON.stringify(data[schema.displayProperty])}}` : JSON.stringify(data);
    return <span>{display}</span>;
  },

  renderChildren: ({data, schema, path}) => {
    const propSchemas = schema.properties;
    if (!propSchemas) return [];
    
    return Object.keys(data)
      .map((key: string) => {
        const propSchema = propSchemas[key];
        const childPath = path + '/' + key;
        return <TreemaNodeLayout data={data[key]} schema={propSchema} path={childPath} />;
      })
      .filter((e) => e);
  }
} 

const TreemaArrayNodeDefinition: TreemaTypeDefinition = {
  display: () => {
    return <span></span>;
  },

  renderChildren: ({data, schema, path}) => {
    const itemSchema = schema.items;
    if (!itemSchema) return null;
      return data.map((item: any, index: number) => {
        const childPath = path + '/' + index;
        return <TreemaNodeLayout data={item} schema={itemSchema} path={childPath} />;
      });
  }
};

const TreemaStringNodeDefinition: TreemaTypeDefinition = {
  display: ({data}) => {
    return <span>{data}</span>;
  }
}

const TreemaNumberNodeDefinition: TreemaTypeDefinition = {
  display: ({data}) => {
    return <span>{data}</span>;
  }
}

const TreemaBooleanNodeDefinition: TreemaTypeDefinition = {
  display: ({data}) => {
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
  path?: string;
}

export const TreemaNodeLayout: FC<TreemaNodeProps> = ({ data, schema, path }) => {
  // Common way to layout treema nodes generally. Should not include any schema specific logic.
  const [isOpen, setIsOpen] = React.useState(true);
  const { dispatch, state } = useContext(TreemaContext);
  const name = schema.title || path?.split('/').pop();
  const canOpen = schema.type === 'object' || schema.type === 'array';
  const definition = typeMapping[schema.type];
  const children = definition.renderChildren ? definition.renderChildren({data, schema, path}) : [];
  const onSelect = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(selectPath(path || ''));
  }, []);
  const onToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  }, [isOpen]);
  const isSelected = state.lastSelected === path;
  const classNames = ['treema-node'];
  if (isSelected) classNames.push('treema-node-selected');

  return (
    <div className={classNames.join(' ')} key={path} onClick={onSelect}>
      {canOpen && (
        <span className="treema-toggle" role="button" onClick={onToggle}>
          {isOpen ? 'O' : 'X'}
        </span>
      )}
      {name && <span className="treema-name">{name}: </span>}
      {definition.display({data, schema, path})}
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
      path={''}
    />
  </TreemaContext.Provider>);
};

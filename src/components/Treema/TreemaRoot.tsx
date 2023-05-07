import React, { FC, ReactNode, useCallback, useContext, useEffect, useReducer } from 'react';
import './styles.css';
import { SchemaLib, SupportedJsonSchema, TreemaNodeContext } from './types';
import { getChildSchema, noopLib } from './utils';
import { reducer, TreemaContext, selectPath, navigateUp } from './state';

interface TreemaTypeDefinition {
  display: (props: TreemaNodeContext) => ReactNode;
  renderChildren?: (props: TreemaNodeContext) => ReactNode[];
}

const TreemaObjectNodeDefinition: TreemaTypeDefinition = {
  display: ({ data, schema }) => {
    const propSchemas = schema.properties;
    if (!propSchemas) return null;
    const display = schema.displayProperty ? `{${JSON.stringify(data[schema.displayProperty])}}` : JSON.stringify(data);

    return <span>{display}</span>;
  },

  renderChildren: ({ data, schema, path }) => {
    const propSchemas = schema.properties;
    if (!propSchemas) return [];

    return Object.keys(data)
      .map((key: string) => {
        const childPath = path + '/' + key;
        const childSchema = getChildSchema(key, schema);

        return <TreemaNodeLayout key={childPath} data={data[key]} schema={childSchema} path={childPath} />;
      })
      .filter((e) => e);
  },
};

const TreemaArrayNodeDefinition: TreemaTypeDefinition = {
  display: () => {
    return <span></span>;
  },

  renderChildren: ({ data, schema, path }) => {
    const itemSchema = schema.items;
    if (!itemSchema) return null;

    return data.map((item: any, index: number) => {
      const childPath = path + '/' + index;
      const childSchema = getChildSchema(index, schema);

      return <TreemaNodeLayout key={childPath} data={item} schema={childSchema} path={childPath} />;
    });
  },
};

const TreemaStringNodeDefinition: TreemaTypeDefinition = {
  display: ({ data }) => {
    return <span>{data}</span>;
  },
};

const TreemaNumberNodeDefinition: TreemaTypeDefinition = {
  display: ({ data }) => {
    return <span>{data}</span>;
  },
};

const TreemaBooleanNodeDefinition: TreemaTypeDefinition = {
  display: ({ data }) => {
    return <span>{JSON.stringify(data)}</span>;
  },
};

const TreemaNullNodeDefinition: TreemaTypeDefinition = {
  display: () => {
    return <span>null</span>;
  },
};

const typeMapping: { [key: string]: TreemaTypeDefinition } = {
  'object': TreemaObjectNodeDefinition,
  'array': TreemaArrayNodeDefinition,
  'string': TreemaStringNodeDefinition,
  'number': TreemaNumberNodeDefinition,
  'boolean': TreemaBooleanNodeDefinition,
  'null': TreemaNullNodeDefinition,
};

export const TreemaNodeLayout: FC<TreemaNodeContext> = ({ data, schema, path }) => {
  // Common way to layout treema nodes generally. Should not include any schema specific logic.
  const [isOpen, setIsOpen] = React.useState(true);
  const { dispatch, state } = useContext(TreemaContext);
  const name = schema.title || path?.split('/').pop();
  const canOpen = schema.type === 'object' || schema.type === 'array';
  const definition = typeMapping[schema.type || 'null'];
  const children = definition.renderChildren ? definition.renderChildren({ data, schema, path }) : [];
  const onSelect = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch(selectPath(path || ''));
    },
    [dispatch, path],
  );
  const onToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsOpen(!isOpen);
    },
    [isOpen],
  );
  const isSelected = state.lastSelected === path;
  const classNames = ['treema-node'];
  const ref = React.useRef<HTMLDivElement>(null);
  if (isSelected) {
    classNames.push('treema-node-selected');
    ref.current?.focus();
  }

  return (
    <div className={classNames.join(' ')} onClick={onSelect} ref={ref} tabIndex={-1}>
      {canOpen && (
        <span className="treema-toggle" role="button" onClick={onToggle}>
          {isOpen ? 'O' : 'X'}
        </span>
      )}
      {name && <span className="treema-name">{name}: </span>}
      {definition.display({ data, schema, path })}
      {children && canOpen && isOpen ? <div className="treema-children">{children}</div> : null}
    </div>
  );
};

export interface TreemaRootProps {
  data: any;
  schema: SupportedJsonSchema;
  schemaLib?: SchemaLib;
}

export const TreemaRoot: FC<TreemaRootProps> = ({ data, schema, schemaLib }) => {
  const [state, dispatch] = useReducer(reducer, { data, schemaLib: schemaLib || noopLib, rootSchema: schema });
  const rootRef = React.useRef<HTMLDivElement>(null);
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      console.log(event);
      if (event.key === 'ArrowUp') {
        dispatch(navigateUp());
      }
    },
    [dispatch],
  );

  useEffect(() => {
    rootRef.current?.addEventListener('keydown', onKeyDown);
    const currentRef = rootRef.current;

    return () => {
      currentRef?.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);

  return (
    <TreemaContext.Provider value={{ state, dispatch }}>
      <div ref={rootRef}>
        <TreemaNodeLayout data={data} schema={schema} path={''} />
      </div>
    </TreemaContext.Provider>
  );
};

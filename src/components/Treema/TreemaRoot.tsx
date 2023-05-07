import React, { FC, ReactNode, useCallback, useContext, useEffect, useReducer, useMemo } from 'react';
import './styles.css';
import { JsonPointer, SchemaLib, SupportedJsonSchema, TreemaNodeContext, BaseType, TreemaEventHandler } from './types';
import { getChildSchema, noopLib, getParentPath, walk } from './utils';
import { reducer, TreemaContext, selectPath, navigateUp, navigateDown, getCanClose, setPathClosed, getLastSelectedPath, getClosed, getCanOpen, navigateIn, navigateOut } from './state';

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
  const { dispatch, state } = useContext(TreemaContext);
  const isOpen = !getClosed(state)[path];
  const name = schema.title || path?.split('/').pop();
  const canOpen = schema.type === 'object' || schema.type === 'array';
  const schemaType: BaseType = Array.isArray(schema.type) ? schema.type[0] : schema.type || 'null';
  const definition = typeMapping[schemaType];
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
      dispatch(setPathClosed(path, isOpen));
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

  const togglePlaceholder = `${isOpen ? 'Close' : 'Open'} ${path}`;

  return (
    <div className={classNames.join(' ')} onClick={onSelect}>
      <div ref={ref} tabIndex={-1} className='treema-title'>
        {canOpen && (
          <span className="treema-toggle" role="button" onClick={onToggle} placeholder={togglePlaceholder}>
            {isOpen ? 'O' : 'X'}
          </span>
        )}
        {name && <span className="treema-name">{name}: </span>}
        {definition.display({ data, schema, path })}
      </div>
      {children && canOpen && isOpen ? <div className="treema-children">{children}</div> : null}
    </div>
  );
};

export interface TreemaRootProps {
  data: any;
  schema: SupportedJsonSchema;
  schemaLib?: SchemaLib;
  initOpen?: number;
  onEvent?: TreemaEventHandler;
}

export const TreemaRoot: FC<TreemaRootProps> = ({ data, schema, schemaLib, initOpen, onEvent }) => {
  const lib = schemaLib || noopLib;
  const closed: { [key: JsonPointer]: boolean } = useMemo(() => {
    if (initOpen === undefined) {
      return {};
    }
    const closed: { [key: JsonPointer]: boolean } = {};
    walk(data, schema, lib, ({path}) => {
      const depth = path.split('/').length;
      if (depth === initOpen + 1) {
        closed[path] = true;
      }
    });
    return closed;
  }, []);

  const [state, dispatch] = useReducer(reducer, { data, schemaLib: lib, rootSchema: schema, closed });
  const rootRef = React.useRef<HTMLDivElement>(null);
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      if (event.key === 'ArrowUp') {
        dispatch(navigateUp());
      }
      if (event.key === 'ArrowDown') {
        dispatch(navigateDown());
      }
      if (event.key === 'ArrowLeft') {
        const selectedPath = getLastSelectedPath(state);
        if (getCanClose(state, selectedPath)) {
          dispatch(setPathClosed(selectedPath, true));
        } else {
          dispatch(navigateOut());
        }
      }
      if (event.key === 'ArrowRight') {
        const selectedPath = getLastSelectedPath(state);
        if (getCanOpen(state, selectedPath)) {
          dispatch(setPathClosed(selectedPath, false));
        } else {
          dispatch(navigateIn());
        }
      }
      if (event.key === 'Escape') {
        dispatch(selectPath(undefined));
        rootRef.current?.focus();
      };
    },
    [dispatch, state],
  );

  useEffect(() => {
    rootRef.current?.addEventListener('keydown', onKeyDown);
    const currentRef = rootRef.current;

    return () => {
      currentRef?.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);

  useEffect(() => {
    if (!onEvent) return;
    onEvent({
      type: 'change_select_event',
      path: state.lastSelected,
    });
  }, [state.lastSelected]);

  return (
    <TreemaContext.Provider value={{ state, dispatch }}>
      <div ref={rootRef} data-testid="treema-root" tabIndex={-1}>
        <TreemaNodeLayout data={data} schema={schema} path={''} />
      </div>
    </TreemaContext.Provider>
  );
};

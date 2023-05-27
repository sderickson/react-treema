import React, { FC, ReactNode, useCallback, useContext, useEffect, useReducer, useMemo, forwardRef } from 'react';
import './base.scss';
import './core.scss';
import './extra.scss';
import { JsonPointer, SchemaLib, SupportedJsonSchema, BaseType, TreemaEventHandler, WorkingSchema } from './types';
import { noopLib, populateRequireds, walk } from './utils';
import {
  reducer,
  TreemaContext,
  selectPath,
  navigateUp,
  navigateDown,
  getCanClose,
  setPathClosed,
  getLastSelectedPath,
  getClosed,
  getCanOpen,
  navigateIn,
  navigateOut,
  getSchemaErrorsByPath,
  getWorkingSchema,
  getDataAtPath,
  getIsDefaultRoot,
  getChildOrderForPath,
  beginEdit,
  setData,
  endEdit,
  editValue,
} from './state';

interface DisplayProps {
  data: any;
  schema: WorkingSchema;
}

interface EditProps {
  data: any;
  schema: WorkingSchema;
  onChange: (data: any) => void;
  ref?: React.RefObject<HTMLInputElement>;
}

interface TreemaTypeDefinition {
  display: (props: DisplayProps) => ReactNode;
  // edit?: (props: EditProps) => ReactNode;
  edit?: FC<EditProps>;
  usesTextarea?: boolean;
}

const TreemaObjectNodeDefinition: TreemaTypeDefinition = {
  display: ({ data, schema }) => {
    const display = schema.displayProperty ? `{${JSON.stringify(data[schema.displayProperty])}}` : JSON.stringify(data);

    return <span>{display}</span>;
  },
};

const TreemaArrayNodeDefinition: TreemaTypeDefinition = {
  display: () => {
    return <span></span>;
  },
};

const TreemaStringNodeDefinition: TreemaTypeDefinition = {
  display: ({ data }) => {
    return <span>{data}</span>;
  },
  edit: forwardRef<HTMLInputElement, EditProps>(({ data, onChange }, ref) => {
    return <input value={data} ref={ref} onChange={(e) => {
      onChange(e.target.value);
    }} />;
  })
};

const TreemaNumberNodeDefinition: TreemaTypeDefinition = {
  display: ({ data }) => {
    return <span>{data}</span>;
  },
};

const TreemaIntegerNodeDefinition: TreemaTypeDefinition = {
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
  'integer': TreemaIntegerNodeDefinition,
};

interface TreemaNodeLayoutProps {
  path: JsonPointer;
}

export const TreemaNodeLayout: FC<TreemaNodeLayoutProps> = ({ path }) => {
  // Common way to layout treema nodes generally. Should not include any schema specific logic.
  const { dispatch, state } = useContext(TreemaContext);
  const data = getDataAtPath(state, path);
  const isOpen = !getClosed(state)[path];
  const isEditing = state.editing === path;
  const workingSchema = getWorkingSchema(state, path);
  const name = workingSchema.title || path?.split('/').pop();
  const canOpen = workingSchema.type === 'object' || workingSchema.type === 'array';
  const schemaType: BaseType = workingSchema.type;
  const definition = typeMapping[schemaType];
  const description = workingSchema.description;
  const childrenKeys = getChildOrderForPath(state, path) || [];
  const isSelected = state.lastSelected === path;
  const errors = getSchemaErrorsByPath(state)[path] || [];
  const togglePlaceholder = `${isOpen ? 'Close' : 'Open'} ${path}`;
  const isDefaultRoot = getIsDefaultRoot(state, path);

  // Event handlers
  const onSelect = useCallback(
    (e: React.MouseEvent) => {
      if(isEditing) {
        // don't let parent elements grab focus
        e.stopPropagation();
        return;
      };
      if (state.editing && state.lastSelected) {
        // clicked off a row being edited; save changes and end edit 
        dispatch(setData(state.lastSelected, state.editingData));
        dispatch(endEdit());
      }
      e.stopPropagation();
      dispatch(selectPath(path || ''));
    },
    [dispatch, path, state.editing, state.editingData, state.lastSelected],
  );
  const onToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch(setPathClosed(path, isOpen));
    },
    [isOpen, path, dispatch],
  );

  // Handle focus
  const displayRef = React.useRef<HTMLDivElement>(null);
  const editRef = React.useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isSelected) {
      isEditing ? editRef.current?.focus() : displayRef.current?.focus();
    }
  });  

  // CSS classes
  const classNames = [
    'treema-node',
    isOpen ? 'treema-open' : 'treema-closed',
    path === '' ? 'treema-root' : '',
    isSelected ? 'treema-selected' : '',
    errors.length ? 'treema-has-error' : '',
    isDefaultRoot ? 'treema-default-stub' : '',
  ];

  const valueClassNames = [
    'treema-value',
    'treema-' + schemaType,
    isEditing ? 'treema-edit' : 'treema-display'
  ]

  const onChange = useCallback(
    (val: any) => {dispatch(editValue(val))},
    [dispatch],
  )

  // Render
  return (
    <div className={classNames.join(' ')} onClick={onSelect}>
      {canOpen && path !== '' && <span className="treema-toggle" role="button" onClick={onToggle} placeholder={togglePlaceholder}></span>}

      {errors.length ? <span className="treema-error">{errors[0].message}</span> : null}

      <div ref={displayRef} tabIndex={-1} className="treema-row">
        {name && (
          <span className="treema-key" title={description}>
            {name}:{' '}
          </span>
        )}

        <div className={valueClassNames.join(' ')}>
          {
            isEditing && definition.edit
              ? <definition.edit
                  data={state.editingData}
                  schema={workingSchema}
                  onChange={onChange}
                  ref={editRef}
                />
              : definition.display({ data, schema: workingSchema })
          }
        </div>
      </div>

      {childrenKeys.length && canOpen && isOpen ? (
        <div className="treema-children">
          {childrenKeys.map((childPath: JsonPointer) => {
            return <TreemaNodeLayout key={childPath} path={childPath} />;
          })}
        </div>
      ) : null}
    </div>
  );
};

export interface TreemaRootProps {
  /**
   * The data to display in the treema. Should conform to the schema given.
   *
   * @default An "empty" or "falsy" value of whatever type is given in the schema.
   */
  data: any;
  /**
   * The schema to use to validate the data. Treema will use this to determine
   * how to construct the UI, and how the data may be edited
   *
   * @see https://json-schema.org/understanding-json-schema/
   * @default {} (any JSON object allowed)
   */
  schema: SupportedJsonSchema;
  /**
   * A schema library instance to use to validate the data.
   * There are [many JavaScript libraries](https://json-schema.org/implementations.html#validators)
   * that support various drafts of the JSON Schema spec.
   * Wrap your chosen library to match the TypeScript interface "SchemaLib".
   * Generally you should initialize the library, which may provide options
   * which will affect the behavior of Treema. Treema also depends on this library
   * to provide error messages.
   *
   * See wrapTv4 and wrapAjv for examples.
   *
   * @default A noop version - no validation, no error messages
   */
  schemaLib?: SchemaLib;
  /**
   * The number of levels deep to open the tree by default.
   *
   * @default All levels are open by default
   */
  initOpen?: number;
  /**
   * A callback for when the user interacts with the treema.
   *
   * Supported events:
   * - `change_select_event`: when the user selects a node. Includes `path` in the event.
   */
  onEvent?: TreemaEventHandler;
}

/**
 * The main entrypoint for any Treema rendered on your site. Provide data and a schema and this component
 * will render that data, and enable edits, according to that schema. You can and probably should also
 * provide a JSON Schema validator library which will thoroughly enforce the schema and provide error messages.
 */
export const TreemaRoot: FC<TreemaRootProps> = ({ data, schema, schemaLib, initOpen, onEvent }) => {
  const lib = schemaLib || noopLib;
  const closed: { [key: JsonPointer]: boolean } = useMemo(() => {
    if (initOpen === undefined) {
      return {};
    }
    const closed: { [key: JsonPointer]: boolean } = {};
    walk(data, schema, lib, ({ path }) => {
      const depth = path.split('/').length;
      if (depth === initOpen + 1) {
        closed[path] = true;
      }
    });

    return closed;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const populatedData = useMemo(() => {
    return populateRequireds(data, schema, lib);
  }, [data, schema, lib]);
  const [state, dispatch] = useReducer(reducer, { data: populatedData, schemaLib: lib, rootSchema: schema, closed });
  const rootRef = React.useRef<HTMLDivElement>(null);
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp' && !state.editing) {
        event.preventDefault();
        dispatch(navigateUp());
      }
      if (event.key === 'ArrowDown' && !state.editing) {
        event.preventDefault();
        dispatch(navigateDown());
      }
      if (event.key === 'ArrowLeft' && !state.editing) {
        event.preventDefault();
        const selectedPath = getLastSelectedPath(state);
        if (getCanClose(state, selectedPath)) {
          dispatch(setPathClosed(selectedPath, true));
        } else {
          dispatch(navigateOut());
        }
      }
      if (event.key === 'ArrowRight' && !state.editing) {
        event.preventDefault();
        const selectedPath = getLastSelectedPath(state);
        if (getCanOpen(state, selectedPath)) {
          dispatch(setPathClosed(selectedPath, false));
        } else {
          dispatch(navigateIn());
        }
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        if (state.editing) {
          dispatch(endEdit());
          return;
        }
        dispatch(selectPath(undefined));
        rootRef.current?.focus();
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        if (state.editing && state.lastSelected) {
          dispatch(setData(state.lastSelected, state.editingData));
          dispatch(endEdit());
          if (event.shiftKey) {
            dispatch(navigateUp());
          } else {
            dispatch(navigateDown());
          }
          dispatch(beginEdit());
        } else if (state.lastSelected) {
          dispatch(beginEdit(state.lastSelected));
        }
      }
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
  }, [state.lastSelected, onEvent]);

  return (
    <TreemaContext.Provider value={{ state, dispatch }}>
      <div ref={rootRef} data-testid="treema-root" tabIndex={-1}>
        <TreemaNodeLayout path={''} />
      </div>
    </TreemaContext.Provider>
  );
};

import React, {
  FC,
  useCallback,
  useEffect,
  useReducer,
  useMemo
} from 'react';
import {
  JsonPointer,
  SchemaLib,
  SupportedJsonSchema,
  TreemaEventHandler
} from './types';
import {
  noopLib,
  populateRequireds,
  walk
} from './utils';
import {
  selectPath,
  navigateUp,
  navigateDown,
  setPathClosed,
  navigateIn,
  navigateOut,
  beginEdit,
  setData,
  endEdit,
} from './state/actions';
import {
  getCanClose,
  getLastSelectedPath,
  getCanOpen,
} from './state/selectors';
import { reducer } from './state/reducer';
import { TreemaContext } from './state';
import { TreemaNodeLayout } from './TreemaNodeLayout';


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

  // Initialize global state
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


  // Global focus and keyboard event handling
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


  // Callbacks
  useEffect(() => {
    if (!onEvent) return;
    onEvent({
      type: 'change_select_event',
      path: state.lastSelected,
    });
  }, [state.lastSelected, onEvent]);


  // Render
  return (
    <TreemaContext.Provider value={{ state, dispatch }}>
      <div ref={rootRef} data-testid="treema-root" tabIndex={-1}>
        <TreemaNodeLayout path={''} />
      </div>
    </TreemaContext.Provider>
  );
};

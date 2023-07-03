import React, { FC, useCallback, useEffect, useReducer, useMemo, useRef } from 'react';
import { JsonPointer, SchemaLib, SupportedJsonSchema, TreemaEventHandler } from './types';
import { noopLib, populateRequireds, walk, joinJsonPointers, getJsonPointerDepth } from './utils';
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
  endAddProperty,
  deleteAction,
} from './state/actions';
import {
  getCanClose,
  getLastSelectedPath,
  getCanOpen,
  getNextRow,
  getPreviousRow,
  canEditPathDirectly,
  normalizeToPath,
  isInsertPropertyPlaceholder,
} from './state/selectors';
import { reducer } from './state/reducer';
import { TreemaNode } from './TreemaNode';
import { coreDefinitions } from './definitions';
import { TreemaTypeDefinition } from './definitions/types';
import { NodeEventCallbackHandler } from './definitions/hooks';
import { ContextInterface, TreemaContext } from './context';
import { handleAddChild } from './common';

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
   * A callback for when the user interacts with the treema.
   *
   * Supported events:
   * - `change_select_event`: when the user selects a node. Includes `path` in the event.
   */
  onEvent?: TreemaEventHandler;

  /**
   * Custom Treema node definitions. Use these to customize how Treema renders data
   * of certain types. Treema will first see if there's a match for the "format" on the
   * data's schema, then will match its "type". If no match is found, Treema will use the
   * default node definitions, keying off what type the data currently is.
   *
   * See [TreemaTypeDefinition](https://github.com/sderickson/react-treema/blob/main/src/Treema/definitions/types.ts#L16)
   * for documentation on definitions.
   *
   * @default The default definitions, which cover all JSON Schema types and a few advanced examples.
   */
  definitions?: { [key: string]: TreemaTypeDefinition };

  /**
   * The number of levels deep to open the tree by default.
   *
   * @default All levels are open by default
   */
  initOpen?: number;
}

/**
 * The main entrypoint for any Treema rendered on your site. Provide data and a schema and this component
 * will render that data, and enable edits, according to that schema. You can and probably should also
 * provide a JSON Schema validator library which will thoroughly enforce the schema and provide error messages.
 */
export const TreemaRoot: FC<TreemaRootProps> = ({ data, schema, schemaLib, initOpen, onEvent }) => {
  /**
   * TreemaRoot handles initializing the state, and updating it when props change. This includes
   * what paths are open or closed, populating required fields, and initializing a noop schema
   * library if none is provided.
   */
  const lib = schemaLib || noopLib;
  const closed: { [key: JsonPointer]: boolean } = useMemo(() => {
    if (initOpen === undefined) {
      return {};
    }
    const closed: { [key: JsonPointer]: boolean } = {};
    walk(data, schema, lib, ({ path }) => {
      const depth = getJsonPointerDepth(path);
      if (depth === initOpen) {
        closed[path] = true;
      }
    });

    return closed;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const populatedData = useMemo(() => {
    return populateRequireds(data, schema, lib);
  }, [data, schema, lib]);
  const [state, dispatch] = useReducer(reducer, {
    data: populatedData,
    schemaLib: lib,
    rootSchema: schema,
    closed,
    definitions: coreDefinitions,
    settings: {},
    workingSchemaChoices: {},
  });

  /**
   * Being at the top level, TreemaRoot is responsible for handling keyboard events. It should describe
   * at a high level how the state changes, and rely on the reducer to handle the details.
   */
  // const nodeCallbackHandler = useTreemaKeyboardEvent();
  const keyboardCallbackRef = useRef<NodeEventCallbackHandler>();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (keyboardCallbackRef.current && keyboardCallbackRef.current(event) === false) {
        return;
      }

      if (event.key === 'ArrowUp' && !state.editing && !state.addingProperty) {
        event.preventDefault();
        dispatch(navigateUp(true));
      }
      if (event.key === 'ArrowDown' && !state.editing && !state.addingProperty) {
        event.preventDefault();
        dispatch(navigateDown(true));
      }
      if (event.key === 'ArrowLeft' && !state.editing && !state.addingProperty) {
        event.preventDefault();
        const selectedPath = getLastSelectedPath(state);
        if (getCanClose(state, selectedPath)) {
          dispatch(setPathClosed(selectedPath, true));
        } else {
          dispatch(navigateOut());
        }
      }
      if (event.key === 'ArrowRight' && !state.editing && !state.addingProperty) {
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
        if (state.addingProperty) {
          dispatch(endAddProperty(true));

          return;
        }
        dispatch(selectPath(undefined));
        rootRef.current?.focus();
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        const tryToEdit = event.key === 'Enter';

        // Are currently adding a property. Commit changes, and unless we're shift-entering, begin editing the new property.
        if (state.addingProperty && state.lastSelected && state.addingPropertyKey) {
          dispatch(endAddProperty());
          if (tryToEdit && !event.shiftKey) {
            dispatch(beginEdit(joinJsonPointers(normalizeToPath(state.lastSelected), state.addingPropertyKey)));

            return;
          }
        }

        // Are currently not editing a row that is editable. Edit it and be done.
        if (
          !event.shiftKey &&
          !state.editing &&
          state.lastSelected &&
          !isInsertPropertyPlaceholder(state.lastSelected) &&
          canEditPathDirectly(state, state.lastSelected) &&
          tryToEdit
        ) {
          dispatch(beginEdit(state.lastSelected));

          return;
        }

        // Are focused on an "add property" placeholder. Begin adding a property, unless we're shift-entering.
        if (
          !event.shiftKey &&
          !state.addingProperty &&
          state.lastSelected &&
          isInsertPropertyPlaceholder(state.lastSelected) &&
          tryToEdit
        ) {
          handleAddChild(state.lastSelected.slice(6), state, dispatch);

          return;
        }

        // Are currently editing a node. Commit changes before navigating.
        if (state.editing && state.lastSelected) {
          dispatch(setData(state.lastSelected, state.editingData));
          dispatch(endEdit());
        }

        // At this point we're in a state where we should move up or down, then decide what to do next depending on where we land.
        dispatch(event.shiftKey ? navigateUp() : navigateDown());
        const nextSelection = event.shiftKey ? getPreviousRow(state) : getNextRow(state);

        if (tryToEdit) {
          // If can edit, or add a property, do so.
          if (isInsertPropertyPlaceholder(nextSelection)) {
            handleAddChild(nextSelection.slice(6), state, dispatch);
          } else if (nextSelection !== state.lastSelected && canEditPathDirectly(state, normalizeToPath(nextSelection))) {
            dispatch(beginEdit());
          }
        } else {
          dispatch(selectPath(nextSelection));
        }
      }
      if (event.key === 'Backspace' && !state.editing && !state.addingProperty) {
        event.preventDefault();
        if (isInsertPropertyPlaceholder(state.lastSelected || '')) {
          return;
        }
        if (state.lastSelected) {
          let nextSelection = getNextRow(state, true);
          if (nextSelection === state.lastSelected) {
            nextSelection = getPreviousRow(state, true);
          }
          dispatch(deleteAction(state.lastSelected));
        }
      }
    },
    [dispatch, state, keyboardCallbackRef],
  );

  useEffect(() => {
    rootRef.current?.addEventListener('keydown', onKeyDown);
    const currentRef = rootRef.current;

    return () => {
      currentRef?.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);

  const dataRef = useRef(data);
  useEffect(() => {
    // Update state data when prop data changes. This keeps Treema data integrated
    // with state managed outside.
    if (data !== dataRef.current) {
      // Don't update data unless it's different than what we have... or we might have
      // an infinite loop. Or at least more actions than necessary.
      dispatch(setData('', data));
      dataRef.current = data;
    }
  }, [data, dataRef]);

  /**
   * In addition to handling the inputs for the base Treema interface, TreemaRoot also handles
   * callbacks, mainly via the onEvent prop.
   */
  const prevLastSelected = useRef(state.lastSelected);
  const prevData = useRef(state.data);
  useEffect(() => {
    if (!onEvent) return;
    if (prevLastSelected.current !== state.lastSelected) {
      onEvent({
        type: 'change_select_event',
        path: state.lastSelected,
      });
    }
    if (prevData.current !== state.data) {
      onEvent({
        type: 'change_data_event',
        data: state.data,
      });
    }
  }, [state.lastSelected, state.data, onEvent]);

  /**
   * Render, providing the context for the various nodes.
   */
  const editRefs: React.RefObject<HTMLInputElement | HTMLTextAreaElement>[] = useMemo(() => [], []);
  const context: ContextInterface = { state, dispatch, keyboardCallbackRef, editRefs };

  return (
    <TreemaContext.Provider value={context}>
      <div ref={rootRef} data-testid="treema-root" tabIndex={-1}>
        <TreemaNode path={''} />
      </div>
    </TreemaContext.Provider>
  );
};

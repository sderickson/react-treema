import React, { FC, useCallback, useEffect, useReducer, useMemo, useRef } from 'react';
import { JsonPointer, TreemaNodeEventCallbackHandler, TreemaRootProps, TreemaWrappedSchemaLib } from './types';
import { getNoopLib, populateRequireds, walk, joinJsonPointers, getJsonPointerDepth } from './utils';
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
  setClipboardMode,
  setFilter,
  undo,
  redo,
  takeSnapshot,
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
  getClosed,
  getListOfPaths,
} from './state/selectors';
import { reducer } from './state/reducer';
import { TreemaNode } from './TreemaNode';
import { coreDefinitions, wrapDefinitions } from './definitions';
import { ContextInterface, TreemaContext } from './context';
import { handleAddChild } from './common';

/**
 * The main entrypoint for any Treema rendered on your site. Provide data and a schema and this component
 * will render that data, and enable edits, according to that schema. You can and probably should also
 * provide a JSON Schema validator library which will thoroughly enforce the schema and provide error messages.
 */
export const TreemaRoot: FC<TreemaRootProps> = ({ data, schema, schemaLib, initOpen, onEvent, definitions, filter, settings }) => {
  /**
   * TreemaRoot handles initializing the state, and updating it when props change. This includes
   * what paths are open or closed, populating required fields, and initializing a noop schema
   * library if none is provided.
   */
  const lib: TreemaWrappedSchemaLib = useMemo(() => {
    const lib = schemaLib || getNoopLib();
    definitions?.forEach((definition) => {
      if (definition.schema && definition.schema.$id) {
        lib.addSchema(definition.schema, definition.schema.$id);
      }
    });

    return lib;
  }, [definitions, schemaLib]);
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
    definitions: Object.assign({}, wrapDefinitions(coreDefinitions), wrapDefinitions(definitions || [])),
    settings: settings || {},
    workingSchemaChoices: {},
    clipboardMode: 'standby',
    filter: filter,
    undoDataStack: [],
    redoDataStack: [],
    selected: {},
  });

  /**
   * Being at the top level, TreemaRoot is responsible for handling keyboard events. It should describe
   * at a high level how the state changes, and rely on the reducer to handle the details.
   */
  const keyboardCallbackRef = useRef<TreemaNodeEventCallbackHandler>();
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
        if (state.addingProperty && state.focused && state.addingPropertyKey) {
          dispatch(endAddProperty());
          if (tryToEdit && !event.shiftKey) {
            dispatch(beginEdit(joinJsonPointers(normalizeToPath(state.focused), state.addingPropertyKey)));

            return;
          }
        }

        // Are currently not editing a row that is editable. Edit it and be done.
        if (
          !event.shiftKey &&
          !state.editing &&
          state.focused &&
          !isInsertPropertyPlaceholder(state.focused) &&
          canEditPathDirectly(state, state.focused) &&
          tryToEdit
        ) {
          dispatch(beginEdit(state.focused));

          return;
        }

        // Are focused on an "add property" placeholder. Begin adding a property, unless we're shift-entering.
        if (
          !event.shiftKey &&
          !state.addingProperty &&
          state.focused &&
          isInsertPropertyPlaceholder(state.focused) &&
          tryToEdit
        ) {
          handleAddChild(state.focused.slice(6), state, dispatch);

          return;
        }

        // Are currently editing a node. Commit changes before navigating.
        if (state.editing && state.focused) {
          dispatch(setData(state.focused, state.editingData));
          dispatch(endEdit());
        }

        // At this point we're in a state where we should move up or down, then decide what to do next depending on where we land.
        dispatch(event.shiftKey ? navigateUp() : navigateDown());
        const nextSelection = event.shiftKey ? getPreviousRow(state) : getNextRow(state);

        if (tryToEdit) {
          // If can edit, or add a property, do so.
          if (isInsertPropertyPlaceholder(nextSelection)) {
            handleAddChild(nextSelection.slice(6), state, dispatch);
          } else if (nextSelection !== state.focused && canEditPathDirectly(state, normalizeToPath(nextSelection))) {
            dispatch(beginEdit());
          }
        } else {
          dispatch(selectPath(nextSelection));
        }
      }
      if (event.key === 'Backspace' && !state.editing && !state.addingProperty) {
        event.preventDefault();
        if (isInsertPropertyPlaceholder(state.focused || '')) {
          return;
        }
        if (state.focused && !canEditPathDirectly(state, state.focused)) {
          return;
        }
        // delete all selected paths in reverse order so that deletions don't
        // break due to earlier content being deleted
        let deletedSomething = false;
        getListOfPaths(state).slice().reverse().forEach((path) => {
          if (state.selected[path]) {
            dispatch(deleteAction(path, true));
            deletedSomething = true;
          }
        });
        if (deletedSomething) {
          dispatch(takeSnapshot(state));
        }
      }

      if ((event.key === 'Meta' || event.key === 'Control') && !state.editing) {
        dispatch(setClipboardMode('active'));
      }

      if (event.key === 'z' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        dispatch(event.shiftKey ? redo() : undo());
      }
    },
    [dispatch, state, keyboardCallbackRef],
  );

  const onKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Meta' || event.key === 'Control') {
        dispatch(setClipboardMode('standby'));
      }
    },
    [dispatch],
  );

  const onMouseClick = useCallback(
    (event: React.MouseEvent) => {
      const target = event.target as HTMLElement;
      const treemaNode = target.closest('.treema-node') as HTMLElement;
      if (!treemaNode) {
        return;
      }
      const path = treemaNode.dataset.path || '';

      // handle toggle open/close
      const treemaToggle = target.closest('.treema-toggle');
      if (treemaToggle) {
        const isOpen = !getClosed(state)[path];
        dispatch(setPathClosed(path, isOpen));

        return;
      }

      // handle add child
      const treemaAddChild = target.closest('.treema-add-child');
      if (treemaAddChild) {
        handleAddChild(path, state, dispatch);

        return;
      }

      // finish edits if clicking off the editing row
      if (state.editing && state.focused && state.focused !== path) {
        // clicked off a row being edited; save changes and end edit
        dispatch(setData(state.focused, state.editingData));
        dispatch(endEdit());
      }

      // don't mess with currently-editing row
      if (state.editing && state.focused === path) {
        return;
      }

      // handle edit
      const displayNode = target.closest('.treema-display');
      if (displayNode && canEditPathDirectly(state, path)) {
        dispatch(beginEdit(path));

        return;
      }

      // handle select
      dispatch(selectPath(path || '', { multi: event.shiftKey, append: event.ctrlKey || event.metaKey }));
    },
    [dispatch, state],
  );

  useEffect(() => {
    rootRef.current?.addEventListener('keydown', onKeyDown);
    rootRef.current?.addEventListener('keyup', onKeyUp);
    const currentRef = rootRef.current;

    return () => {
      currentRef?.removeEventListener('keydown', onKeyDown);
      currentRef?.removeEventListener('keyup', onKeyUp);
    };
  }, [onKeyDown, onKeyUp]);

  /**
   * The following properties are manually propagated to the state. Others are not
   * expected to change after initialization.
   */
  const dataRef = useRef(data);
  useEffect(() => {
    // Update state data when prop data changes. This keeps Treema data integrated
    // with state managed outside.
    if (data !== dataRef.current) {
      // Don't update data unless it's different than what we have... or we might have
      // an infinite loop. Or at least more actions than necessary.
      dataRef.current = data;
      dispatch(setData('', data));
    }
  }, [data, dataRef, dispatch]);

  const filterRef = useRef(filter);
  useEffect(() => {
    if (filter !== filterRef.current) {
      dispatch(setFilter(filter));
      filterRef.current = filter;
    }
  }, [filter, filterRef, dispatch]);

  /**
   * In addition to handling the inputs for the base Treema interface, TreemaRoot also handles
   * callbacks, mainly via the onEvent prop.
   */
  const prevLastSelected = useRef(state.focused);
  const prevData = useRef(state.data);
  useEffect(() => {
    if (!onEvent) return;
    if (prevLastSelected.current !== state.focused) {
      onEvent({
        type: 'change_select_event',
        path: state.focused,
        selected: state.selected || {},
      });
    }
    if (prevData.current !== state.data) {
      prevData.current = state.data;
      onEvent({
        type: 'change_data_event',
        data: state.data,
      });
    }
  }, [state.focused, state.data, onEvent]);

  /**
   * Render, providing the context for the various nodes.
   */
  const editRefs: React.RefObject<HTMLInputElement | HTMLTextAreaElement>[] = useMemo(() => [], []);
  const context: ContextInterface = { state, dispatch, keyboardCallbackRef, editRefs };

  return (
    <TreemaContext.Provider value={context}>
      <div ref={rootRef} data-testid="treema-root" tabIndex={-1} onClick={onMouseClick}>
        <TreemaNode path={''} />
      </div>
    </TreemaContext.Provider>
  );
};

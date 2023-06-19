import React, { FC, useCallback, useContext, useEffect } from 'react';
import { JsonPointer } from './types';
import { TreemaContext } from './context';
import { selectPath, setPathClosed, setData, endEdit, editValue, editAddProperty } from './state/actions';
import {
  getClosed,
  getSchemaErrorsByPath,
  getWorkingSchema,
  getDataAtPath,
  getIsDefaultRoot,
  getChildOrderForPath,
  getDefinitionAtPath,
  canAddChildAtPath,
  getPropertiesAvailableAtPath,
  hasChildrenAtPath,
} from './state/selectors';
import './base.scss';
import { handleAddChild } from './common';

interface TreemaNodeProps {
  path: JsonPointer;
}

/**
 * For each value within a JSON object, there will be a TreemaNode to represent it.
 * TreemaNodes rely heavily on state and selectors to get necessary information, keying
 * entirely off the path that is given to it to render.
 *
 * TreemaNode handles:
 * - Rendering the "key" and "value" of the node
 * - Rendering an input element if the value is being edited
 * - Mouse events
 * - Maintaining focus
 * - Rendering its children, if the value is an array or object
 */
export const TreemaNode: FC<TreemaNodeProps> = ({ path }) => {
  // Common way to layout treema nodes generally. Should not include any schema specific logic.
  const context = useContext(TreemaContext);
  const { dispatch, state, editRefs } = context;
  const data = getDataAtPath(state, path);
  const isOpen = !getClosed(state)[path];
  const isEditing = state.editing === path;
  const workingSchema = getWorkingSchema(state, path);
  const name = workingSchema.title || path?.split('/').pop();
  const definition = getDefinitionAtPath(state, path);
  const canOpen = hasChildrenAtPath(state, path);
  const description = workingSchema.description;
  const childrenKeys = getChildOrderForPath(state, path) || [];
  const isSelected = state.lastSelected === path;
  const errors = getSchemaErrorsByPath(state)[path] || [];
  const togglePlaceholder = `${isOpen ? 'Close' : 'Open'} ${path}`;
  const isDefaultRoot = getIsDefaultRoot(state, path);
  const isAddingProperty = 'addTo:' + path === state.lastSelected && state.addingProperty;
  const isFocusedOnAddProperty = 'addTo:' + path === state.lastSelected && !state.addingProperty;

  // Event handlers
  const onSelect = useCallback(
    (e: React.MouseEvent) => {
      if (isEditing) {
        // don't let parent elements grab focus
        e.stopPropagation();

        return;
      }
      if (state.editing && state.lastSelected) {
        // clicked off a row being edited; save changes and end edit
        dispatch(setData(state.lastSelected, state.editingData));
        dispatch(endEdit());
      }
      e.stopPropagation();
      dispatch(selectPath(path || ''));
    },
    [dispatch, path, state.editing, state.editingData, state.lastSelected, isEditing],
  );
  const onToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch(setPathClosed(path, isOpen));
    },
    [isOpen, path, dispatch],
  );
  const onChangeValue = useCallback(
    (val: any) => {
      dispatch(editValue(val));
    },
    [dispatch],
  );
  const onAddChild = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleAddChild(path, context);
    },
    [dispatch, path, data, state.schemaLib, workingSchema],
  );
  const onChangeAddProperty = useCallback(
    (val: any) => {
      dispatch(editAddProperty(val));
    },
    [dispatch],
  );

  // Handle focus
  const displayRef = React.useRef<HTMLDivElement>(null);
  const addPropertyRef = React.useRef<HTMLInputElement>(null);
  const addPropRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isEditing) {
      // TODO: handle multiple refs
      editRefs[0].current?.focus();
    } else if (isAddingProperty) {
      addPropertyRef.current?.focus();
    } else if (isSelected) {
      displayRef.current?.focus();
    } else if (isFocusedOnAddProperty) {
      addPropRef.current?.focus();
    }
  });

  // No more hooks allowed below here...
  if (workingSchema.format === 'hidden') {
    return null;
  }

  // CSS classes
  const classNames = [
    'treema-node',
    isOpen ? 'treema-open' : 'treema-closed',
    path === '' ? 'treema-root' : '',
    isSelected ? 'treema-selected' : '',
    errors.length ? 'treema-has-error' : '',
    isDefaultRoot ? 'treema-default-stub' : '',
  ];

  const valueClassNames = ['treema-value', 'treema-' + definition.id, isEditing ? 'treema-edit' : 'treema-display'];

  // Render
  return (
    <div className={classNames.join(' ')} onClick={onSelect}>
      {canOpen && path !== '' && <span className="treema-toggle" role="button" onClick={onToggle} placeholder={togglePlaceholder}></span>}

      {errors.length ? <span className="treema-error">{errors[0].message}</span> : null}

      <div ref={displayRef} tabIndex={-1} className="treema-row">
        {name !== undefined && (
          <span className="treema-key" title={description}>
            {name === '' ? '(empty string)' : name}:{' '}
          </span>
        )}

        <div className={valueClassNames.join(' ')}>
          {isEditing && definition.Edit ? (
            <definition.Edit data={state.editingData} schema={workingSchema} onChange={onChangeValue} />
          ) : (
            <definition.Display data={data} schema={workingSchema} />
          )}
        </div>
      </div>

      {childrenKeys.length && canOpen && isOpen ? (
        <div className="treema-children">
          {childrenKeys.map((childPath: JsonPointer) => {
            return <TreemaNode key={childPath} path={childPath} />;
          })}
        </div>
      ) : null}

      {isAddingProperty && (
        <>
          <input
            className="treema-new-prop"
            type="text"
            ref={addPropertyRef}
            list="treema-new-prop-datalist"
            onChange={(e) => {
              onChangeAddProperty(e.target.value);
            }}
            data-testid="treema-new-prop-input"
          />
          <datalist id="treema-new-prop-datalist">
            {getPropertiesAvailableAtPath(state, path).map((prop) => (
              <option label={prop.title} value={prop.key} key={prop.key} />
            ))}
          </datalist>
        </>
      )}
      {canAddChildAtPath(state, path) && (
        <div className="treema-add-child" onClick={onAddChild} ref={addPropRef} tabIndex={-1}>
          <span>+</span>
        </div>
      )}
    </div>
  );
};

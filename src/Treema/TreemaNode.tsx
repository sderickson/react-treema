import React, { FC, useCallback, useContext, useEffect } from 'react';
import { JsonPointer } from './types';
import { TreemaContext } from './context';
import { setData, editValue, editAddProperty, setWorkingSchema } from './state/actions';
import {
  getClosed,
  getSchemaErrorsByPath,
  getWorkingSchema,
  getWorkingSchemas,
  getDataAtPath,
  getIsDefaultRoot,
  getChildOrderForPath,
  getDefinitionAtPath,
  canAddChildAtPath,
  getPropertiesAvailableAtPath,
  hasChildrenAtPath,
} from './state/selectors';
import './base.scss';
import { clone, getJsonPointerLastChild, getParentJsonPointer, getValueForRequiredType } from './utils';
import { is } from 'bluebird';

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
  const workingSchemas = getWorkingSchemas(state, path);
  const workingSchemaIndex = workingSchemas.indexOf(workingSchema);
  const parentIsArray = path && getWorkingSchema(state, getParentJsonPointer(path)).type === 'array';
  const isRoot = path === '';
  let name = workingSchema.title;
  const definition = getDefinitionAtPath(state, path);
  const canOpen = hasChildrenAtPath(state, path);
  const description = workingSchema.description;
  const childrenKeys = getChildOrderForPath(state, path) || [];
  const isSelected = !!state.selected[path];
  const isFocused = state.focused === path;
  const errors = getSchemaErrorsByPath(state)[path] || [];
  const togglePlaceholder = `${isOpen ? 'Close' : 'Open'} ${path}`;
  const isDefaultRoot = getIsDefaultRoot(state, path);
  const isAddingProperty = 'addTo:' + path === state.focused && state.addingProperty;
  const isFocusedOnAddProperty = 'addTo:' + path === state.focused && !state.addingProperty;
  const clipboardMode = state.clipboardMode;

  // Determine string for key
  if (name === undefined) {
    if (isRoot) {
      name = '(Document Root)';
    } else if (parentIsArray) {
      // keep undefined
    } else {
      name = getJsonPointerLastChild(path || '');
    }
  }

  // Event handlers
  const onChangeValue = useCallback(
    (val: any) => {
      dispatch(editValue(val));
    },
    [dispatch],
  );
  const onChangeAddProperty = useCallback(
    (val: any) => {
      dispatch(editAddProperty(val));
    },
    [dispatch],
  );
  const onSetWorkingModel = useCallback(
    (val: any) => {
      const newIndex = parseInt(val.target.value);
      const newSchema = workingSchemas[newIndex];
      let newData = clone(newSchema.default);
      if (newData === undefined) {
        newData = getValueForRequiredType(newSchema.type);
      }
      dispatch(setData(path, newData));
      dispatch(setWorkingSchema(path, newIndex));
    },
    [dispatch, path, workingSchemas],
  );

  // Handle focus
  const displayRef = React.useRef<HTMLDivElement>(null);
  const addPropertyRef = React.useRef<HTMLInputElement>(null);
  const addPropRef = React.useRef<HTMLDivElement>(null);
  const clipboardRef = React.useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    let focusable = null;
    let andSelectAll = false;
    if (isEditing) {
      // TODO: handle multiple refs
      focusable = editRefs[0]?.current;
    } else if (isAddingProperty) {
      focusable = addPropertyRef.current;
    } else if (clipboardMode !== 'standby' && isFocused) {
      focusable = clipboardRef.current;
      andSelectAll = true;
    } else if (isFocused) {
      focusable = displayRef.current;
    } else if (isFocusedOnAddProperty) {
      focusable = addPropRef.current;
    }
    if (focusable && focusable.focus) {
      focusable.focus();
      if (andSelectAll) {
        // select the contents of the hidden text area so that it will be copied
        clipboardRef.current?.select();
      }
    }
  });

  const onPaste = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      dispatch(setData(path, JSON.parse(e.target.value)));
    },
    [dispatch, path],
  );

  // No more hooks allowed below here...
  // CSS classes
  const classNames = [
    'treema-node',
    isOpen ? 'treema-open' : 'treema-closed',
    isRoot ? 'treema-root' : '',
    isSelected ? 'treema-selected' : '',
    errors.length ? 'treema-has-error' : '',
    isDefaultRoot ? 'treema-default-stub' : '',
    definition.shortened ? 'treema-shortened' : '',
  ];

  const rowNames = [
    'treema-row',
    isFocused ? 'treema-focused' : '',
  ]

  const valueClassNames = ['treema-value', 'treema-' + definition.id, isEditing ? 'treema-edit' : 'treema-display'];

  // Render
  return (
    <div className={classNames.join(' ')} data-path={path} data-testid={path}>
      {canOpen && path !== '' && <span className="treema-toggle" role="button" placeholder={togglePlaceholder}></span>}

      <div ref={displayRef} tabIndex={-1} className={rowNames.join(' ')}>
        {clipboardMode === 'active' && isFocused && (
          <>
            <span className="treema-clipboard-mode">📋</span>
            <div className="treema-clipboard-container">
              {/* This hidden text area contains text to copy, and receives pasted text. */}
              <textarea
                className="treema-clipboard"
                ref={clipboardRef}
                value={JSON.stringify(data, null, '\t')}
                onChange={onPaste}
              ></textarea>
            </div>
          </>
        )}

        {workingSchemas.length > 1 ? (
          <select onChange={onSetWorkingModel} value={workingSchemaIndex} className="treema-schema-select">
            {workingSchemas.map((schema, index) => (
              <option key={index} value={index}>
                {schema.title || schema.type || '(untitled schema)'}
              </option>
            ))}
          </select>
        ) : null}

        {name !== undefined ? (
          <span className="treema-key" title={description}>
            {`${name === '' ? '(empty string)' : name}: `}
          </span>
        ) : null}

        <div className={valueClassNames.join(' ')}>
          {isEditing && definition.Edit ? (
            <definition.Edit data={state.editingData} schema={workingSchema} onChange={onChangeValue} />
          ) : (
            <definition.Display data={data} schema={workingSchema} path={path} />
          )}
        </div>

        {errors.length ? <span className="treema-error">{errors[0].message}</span> : null}
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
      {isOpen && canAddChildAtPath(state, path) && (
        <div className="treema-add-child" ref={addPropRef} tabIndex={-1}>
          <span>+</span>
        </div>
      )}
    </div>
  );
};

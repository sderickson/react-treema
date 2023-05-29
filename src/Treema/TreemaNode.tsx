import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import './base.scss';
import {
  JsonPointer,
} from './types';
import {
  TreemaContext,
} from './state';
import {
  selectPath,
  setPathClosed,
  setData,
  endEdit,
  editValue,
} from './state/actions';
import {
  getClosed,
  getSchemaErrorsByPath,
  getWorkingSchema,
  getDataAtPath,
  getIsDefaultRoot,
  getChildOrderForPath,
  getDefinitionAtPath,
  canAddChildAtPath,
} from './state/selectors';
import './base.scss';


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
  const { dispatch, state } = useContext(TreemaContext);
  const data = getDataAtPath(state, path);
  const isOpen = !getClosed(state)[path];
  const isEditing = state.editing === path;
  const workingSchema = getWorkingSchema(state, path);
  const name = workingSchema.title || path?.split('/').pop();
  const canOpen = workingSchema.type === 'object' || workingSchema.type === 'array';
  const definition = getDefinitionAtPath(state, path);
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
  const onChange = useCallback(
    (val: any) => {dispatch(editValue(val))},
    [dispatch],
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
    definition.valueClassName,
    isEditing ? 'treema-edit' : 'treema-display'
  ]

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
            return <TreemaNode key={childPath} path={childPath} />;
          })}
        </div>
      ) : null}

      {canAddChildAtPath(state, path) && (
        <div className='treema-add-child'>
          +
        </div>)
      }
    </div>
  );
};

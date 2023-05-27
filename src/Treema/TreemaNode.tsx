import React, {
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  forwardRef
} from 'react';
import './base.scss';
import {
  JsonPointer,
  BaseType,
} from './types';
import {
  DisplayProps,
  EditProps,
  TreemaTypeDefinition
} from './definitions/types';
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
} from './state/selectors';
import {
  TreemaArrayNodeDefinition,
  TreemaBooleanNodeDefinition,
  TreemaIntegerNodeDefinition,
  TreemaNullNodeDefinition,
  TreemaNumberNodeDefinition,
  TreemaObjectNodeDefinition,
  TreemaStringNodeDefinition
} from './definitions';
import './base.scss';


/**
 * TreemaNode creates and uses refs to the inputs that these definitions set up. Apparently in order
 * for these to work in hook-land, you have to wrap the functional component in forwardRef.
 * Definitions don't worry about this, but TreemaNode does, so it handles wrapping definitions
 * so that they're usable.
 */
interface TreemaTypeDefinitionWrapped {
  display: (props: DisplayProps) => ReactNode;
  edit?: React.ForwardRefExoticComponent<EditProps & React.RefAttributes<HTMLInputElement>>;
  usesTextarea?: boolean;
}

const wrapTypeDefinition: ((typeDefinition: TreemaTypeDefinition) => TreemaTypeDefinitionWrapped) = (typeDefinition: TreemaTypeDefinition) => {
  const wrapped: TreemaTypeDefinitionWrapped = {
    display: typeDefinition.display,
    usesTextarea: typeDefinition.usesTextarea,
  };
  if (typeDefinition.edit) {
    wrapped.edit = forwardRef<HTMLInputElement, EditProps>(typeDefinition.edit);
  }
  return wrapped;
};

const typeMapping: { [key: string]: TreemaTypeDefinitionWrapped } = {
  'object': wrapTypeDefinition(TreemaObjectNodeDefinition),
  'array': wrapTypeDefinition(TreemaArrayNodeDefinition),
  'string': wrapTypeDefinition(TreemaStringNodeDefinition),
  'number': wrapTypeDefinition(TreemaNumberNodeDefinition),
  'boolean': wrapTypeDefinition(TreemaBooleanNodeDefinition),
  'null': wrapTypeDefinition(TreemaNullNodeDefinition),
  'integer': wrapTypeDefinition(TreemaIntegerNodeDefinition),
};

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
    'treema-' + schemaType,
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
    </div>
  );
};

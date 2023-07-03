import { TreemaAction, beginAddProperty, beginEdit, selectPath, setData } from './state/actions';
import { getDataAtPath, getWorkingSchema } from './state/selectors';
import { TreemaState } from './state/types';
import { JsonPointer } from './types';
import { clone, getChildWorkingSchema, getValueForRequiredType, joinJsonPointers } from './utils';

export const handleAddChild = (path: JsonPointer, state: TreemaState, dispatch: React.Dispatch<TreemaAction>) => {
  const schema = getWorkingSchema(state, path);
  const data = getDataAtPath(state, path);
  if (schema.type === 'object') {
    dispatch(beginAddProperty(path));
  } else if (schema.type === 'array') {
    const childSchema = getChildWorkingSchema(data.length, schema, state.schemaLib);
    const newData = childSchema.default ? clone(childSchema.default) : getValueForRequiredType(childSchema.type);
    const newDataPath = joinJsonPointers(path, data.length);
    dispatch(setData(newDataPath, newData));
    dispatch(selectPath(newDataPath));
    dispatch(beginEdit(newDataPath));
  }
};

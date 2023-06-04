import { ContextInterface } from "./context";
import { beginAddProperty, beginEdit, selectPath, setData } from "./state/actions";
import { getDataAtPath, getWorkingSchema } from "./state/selectors";
import { JsonPointer } from "./types";
import { clone, getChildWorkingSchema, getValueForRequiredType } from "./utils";

export const handleAddChild = (path: JsonPointer, context: ContextInterface) => {
  const schema = getWorkingSchema(context.state, path);
  const data = getDataAtPath(context.state, path);
  if (schema.type === 'object') {
    context.dispatch(beginAddProperty(path));
  } else if (schema.type === 'array') {
    const childSchema = getChildWorkingSchema(data.length, schema, context.state.schemaLib);
    const newData = childSchema.default ? clone(childSchema.default) : getValueForRequiredType(childSchema.type);
    context.dispatch(setData(path + '/' + data.length, newData));
    context.dispatch(selectPath(path + '/' + data.length));
    context.dispatch(beginEdit(path + '/' + data.length));
  }
} 
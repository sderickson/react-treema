import { SchemaValidator, SupportedJsonSchema, SchemaLib, TreemaNodeWalkContext, WorkingSchema, BaseType } from './types';
import { JsonPointer } from './types';

export const noopValidator: SchemaValidator = () => {
  return { valid: true, errors: [], missing: [] };
};

export const noopLib: SchemaLib = {
  validateMultiple: noopValidator,
  getSchemaRef: () => ({}),
  addSchema: () => {},
};

type Tv4 = any;

// https://github.com/geraintluff/tv4
export const wrapTv4 = (tv4: Tv4): SchemaLib => {
  return {
    validateMultiple: (data, schema) => {
      let tv4Result = tv4.validateMultiple(data, schema);

      return {
        valid: tv4Result.valid,
        missing: tv4Result.missing,
        errors: tv4Result.errors.map((error: any) => {
          return {
            id: error.code,
            message: error.message,
            dataPath: error.dataPath,
          };
        }),
      };
    },
    getSchemaRef: (ref) => {
      return tv4.getSchema(ref);
    },
    addSchema: (schema, id) => {
      id ? tv4.addSchema(id, schema) : tv4.addSchema(schema);
    },
  };
};

// https://ajv.js.org/api.html
export const wrapAjv = (ajv: any): SchemaLib => {
  ajv.addKeyword('displayProperty');

  return {
    validateMultiple: (data, schema) => {
      const valid = ajv.validate(schema, data);
      const errors = ajv.errors || [];

      return {
        valid,
        missing: [],
        errors: errors.map((error: any) => {
          return {
            id: error.keyword,
            message: error.message,
            dataPath: error.instancePath,
          };
        }),
      };
    },
    getSchemaRef: (ref) => {
      return ajv.getSchema(ref);
    },
    addSchema: (schema, id) => {
      ajv.addSchema(schema, id);
    },
  };
};

/**
 * Walks the provided JSON data and, for each path within the data, calls the provided callback with schema info.
 * The callback for each path in the data with an object that includes:
 * * path: the JSON pointer of the data
 * * data: the data at that path
 * * schema: the default working schema for that path (see docs on Working Schemas)
 * * possibleSchemas: an array of all possible working schemas for that path
 *
 * The callback may return one of the possibleSchemas to override the provided default. If the callback does this,
 * that will affect further steps in the walking process. For example if an object could be `oneOf` an array of
 * schemas, with different properties and names for them, callbacks for those properties will provide different
 * schema and possibleSchemas values.
 *
 * @param data The JSON data to walk.
 * @param schema The schema for the whole data.
 * @param lib Validator which can be used to dereference $ref.
 * @param callback A function which will be called for each path in the data.
 * @param path Optional. The JSON pointer "to" the data provided. All callbacked paths will be prepended with this.
 */
export const walk: (
  data: any,
  schema: SupportedJsonSchema,
  lib: SchemaLib,
  callback: (context: TreemaNodeWalkContext) => void | WorkingSchema,
  path?: string,
) => any = (data, schema, lib, callback, path) => {
  const workingSchemas = buildWorkingSchemas(schema, lib);
  let workingSchema = chooseWorkingSchema(data, workingSchemas, lib);

  // If the caller knows more than we do about which working schema to use, they can override it.
  const schemaOverride = callback({ path: path || '', data, schema: workingSchema, possibleSchemas: workingSchemas });
  if (schemaOverride) {
    workingSchema = schemaOverride;
  }

  // This actually works for both arrays and objects...
  const dataType = getType(data);

  if (['array', 'object'].includes(dataType)) {
    const f = (key: string | number, value: any) => {
      value = data[key];
      const childPath = (path || '') + '/' + key;
      let childSchema = getChildSchema(key, workingSchema);
      walk(value, childSchema, lib, callback, childPath);
    };

    if (dataType === 'array') {
      data.forEach((value: any, index: number) => {
        f(index, value);
      });
    } else {
      Object.entries(data).forEach((entry) => {
        f(entry[0], entry[1]);
      });
    }
  }
};

export const getType = (function () {
  const classToType: { [key: string]: string } = {};
  const ref = 'Boolean Number String Function Array Date RegExp Undefined Null'.split(' ');
  for (let i = 0, len = ref.length; i < len; i++) {
    let name = ref[i];
    classToType['[object ' + name + ']'] = name.toLowerCase();
  }

  return function (obj: any) {
    var strType;
    strType = Object.prototype.toString.call(obj);

    return classToType[strType] || 'object';
  };
})();

export const getJsonType = (data: any): BaseType | undefined => {
  const type = getType(data);
  switch (type) {
    case 'boolean':
      return 'boolean';
    case 'number':
      return 'number';
    case 'string':
      return 'string';
    case 'array':
      return 'array';
    case 'object':
      return 'object';
    case 'null':
      return 'null';
  }

  return undefined;
};

export const buildWorkingSchemas = (schema: SupportedJsonSchema, lib: SchemaLib): WorkingSchema[] => {
  const givenSchema = resolveReference(schema, lib);
  if (!givenSchema.allOf && !givenSchema.anyOf && !givenSchema.oneOf) {
    return spreadTypes(givenSchema);
  }
  let baseSchema = cloneSchema(givenSchema);
  const allOf = baseSchema.allOf;
  const anyOf = baseSchema.anyOf;
  const oneOf = baseSchema.oneOf;
  delete baseSchema.allOf;
  delete baseSchema.anyOf;
  delete baseSchema.oneOf;

  if (allOf) {
    for (const schema of allOf) {
      baseSchema = combineSchemas(baseSchema, resolveReference(schema, lib));
    }
  }

  let singularSchemas: SupportedJsonSchema[] = [];
  if (anyOf) {
    singularSchemas = singularSchemas.concat(anyOf);
  }
  if (oneOf) {
    singularSchemas = singularSchemas.concat(oneOf);
  }

  let workingSchemas: WorkingSchema[] = [];
  for (let singularSchema of singularSchemas) {
    singularSchema = resolveReference(singularSchema, lib);
    let newBase = cloneSchema(baseSchema);
    newBase = combineSchemas(newBase, singularSchema);
    workingSchemas = workingSchemas.concat(spreadTypes(newBase));
  }

  if (workingSchemas.length === 0) {
    workingSchemas = spreadTypes(baseSchema);
  }

  return workingSchemas;
};

// Notes that the first base type is effectively the "default" type for a schema without a type specified
const baseTypes: BaseType[] = ['string', 'boolean', 'number', 'array', 'object', 'null'];

const spreadTypes = (schema: SupportedJsonSchema): WorkingSchema[] => {
  const workingSchemas: WorkingSchema[] = [];
  if (schema.type === undefined) {
    baseTypes.forEach((type: BaseType) => {
      workingSchemas.push({
        ...schema,
        type,
      });
    });
  } else if (getType(schema.type) === 'string') {
    return [schema as WorkingSchema];
  } else {
    (schema.type as BaseType[]).forEach((type: BaseType) => {
      workingSchemas.push({
        ...schema,
        type,
      });
    });
  }

  return workingSchemas;
};

export const chooseWorkingSchema = (data: any, workingSchemas: WorkingSchema[], lib: SchemaLib): WorkingSchema => {
  if (workingSchemas.length === 1) {
    return workingSchemas[0];
  }
  let bestNumErrors = Infinity;
  let bestSchema = workingSchemas[0];
  for (const schema of workingSchemas) {
    const result = lib.validateMultiple(data, schema);
    if (result.valid && getJsonType(data) === schema.type) {
      return schema;
    }
    // simple heuristic to try and find the "best" schema if none are valid: least errors
    if (bestNumErrors > result.errors.length) {
      bestSchema = schema;
      bestNumErrors = result.errors.length;
    }
  }

  return bestSchema;
};

export const getChildSchema = (key: string | number, schema: SupportedJsonSchema): SupportedJsonSchema => {
  if (typeof key === 'string') {
    for (const [childKey, childSchema] of Object.entries(schema.properties || {})) {
      if (childKey === key) {
        return childSchema;
      }
    }
    for (const [childKey, childSchema] of Object.entries(schema.patternProperties || {})) {
      if (key.match(new RegExp(childKey))) {
        return childSchema;
      }
    }
    if (typeof schema.additionalProperties === 'object') {
      return schema.additionalProperties;
    }
  }

  if (typeof key === 'number') {
    if (schema.items) {
      if (Array.isArray(schema.items)) {
        if (key < schema.items.length) {
          return schema.items[key];
        } else if (schema.additionalItems) {
          return schema.additionalItems;
        }
      } else if (schema.items) {
        return schema.items;
      }
    }
  }

  return {};
};

export const getChildWorkingSchema: (key: string | number, schema: SupportedJsonSchema, lib: SchemaLib) => WorkingSchema = (
  key: string | number,
  schema: SupportedJsonSchema,
  lib: SchemaLib,
) => {
  const childSchema = getChildSchema(key, schema);
  const workingSchemas = buildWorkingSchemas(childSchema, lib);
  const workingSchema = chooseWorkingSchema(undefined, workingSchemas, lib);

  return workingSchema;
};

const resolveReference = (schema: SupportedJsonSchema, lib: SchemaLib): SupportedJsonSchema => {
  if (schema.$ref) {
    const resolved = lib.getSchemaRef(schema.$ref);
    if (!resolved) {
      console.warn('could not resolve reference', schema.$ref);

      return {};
    }

    return resolved;
  } else {
    return schema;
  }
};

const cloneSchema = (schema: SupportedJsonSchema): SupportedJsonSchema => {
  return Object.assign({}, schema);
};

/**
 * Combines two schemas, with the second schema overriding the first.
 *
 * There's opportunity to combine schemas more here, but... should probably have good use cases.
 */
export const combineSchemas = (baseSchema: SupportedJsonSchema, schema: SupportedJsonSchema): SupportedJsonSchema => {
  const result = Object.assign({}, baseSchema, schema);
  if (schema.properties && baseSchema.properties) {
    // combine recursively
    result.properties = Object.assign({}, baseSchema.properties, schema.properties);
    for (const [key] of Object.entries(schema.properties)) {
      if (key in baseSchema.properties) {
        result.properties[key] = combineSchemas(baseSchema.properties[key], schema.properties[key]);
      }
    }
  }
  if (schema.required && baseSchema.required) {
    result.required = baseSchema.required.concat(schema.required);
  }

  return result;
};

export const getParentPath = (path: JsonPointer): JsonPointer => {
  const parts = path.split('/');
  parts.pop();

  return parts.join('/');
};

export const getDataByPath = (data: any, path: JsonPointer): any => {
  if (path === '') {
    return data;
  }
  let returnData = data;
  path
    .slice(1)
    .split('/')
    .forEach((key) => {
      if (getType(returnData) === 'array') {
        returnData = returnData[parseInt(key)];
      } else {
        returnData = returnData[key];
      }
    });

  return returnData;
};

interface CloneOptions {
  shallow?: boolean;
}
export const clone = (data: any, options?: CloneOptions): any => {
  let result = data;
  const type = getType(data);
  if (type === 'object') {
    result = {};
  }
  if (type === 'array') {
    result = [];
  }
  if (['object', 'array'].includes(type)) {
    const shallow = options && options.shallow;
    for (const [key, value] of Object.entries(data)) {
      if (shallow) {
        result[key] = value;
      } else {
        result[key] = clone(value, options);
      }
    }
  }

  return result;
};

export const getValueForRequiredType: (type: BaseType) => any = (type: BaseType) => {
  switch (type) {
    case 'boolean':
      return false;
    case 'number':
    case 'integer':
      return 0;
    case 'string':
      return '';
    case 'array':
      return [];
    case 'object':
      return {};
    case 'null':
      return null;
  }
};

export const populateRequireds = (givenData: any, schema: SupportedJsonSchema, lib: SchemaLib): any => {
  const returnData = clone(givenData) || {};
  walk(returnData, schema, lib, ({ data, schema }) => {
    if (schema.required && getType(data) === 'object') {
      for (const key of schema.required) {
        if (data[key] !== undefined) {
          continue;
        }
        if (schema.default && schema.default[key]) {
          data[key] = clone(schema.default[key]);
        } else {
          const childSchema = getChildSchema(key, schema);
          const workingSchema = buildWorkingSchemas(childSchema, lib)[0];
          const schemaDefault = workingSchema.default;
          if (schemaDefault) {
            data[key] = clone(schemaDefault);
          } else {
            const type = workingSchema.type;
            data[key] = getValueForRequiredType(type);
          }
        }
      }
    }
  });

  return returnData;
};

export const splitJsonPointer = (path: JsonPointer): string[] => {
  // Not actually following the whole spec, but this'll do for now.
  return path.split('/').slice(1);
};

export const joinJsonPointers = (paths: string[]): JsonPointer => {
  return paths.join('');
};

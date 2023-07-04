import { TreemaSupportedJsonSchema, TreemaWrappedSchemaLib, TreemaNodeWalkContext, TreemaWorkingSchema, SchemaBaseType, TreemaValidator } from './types';
import { JsonPointer } from './types';

export const noopValidator: TreemaValidator = () => {
  return { valid: true, errors: [], missing: [] };
};

class NoopLib implements TreemaWrappedSchemaLib {
  _schemas: { [key: string]: TreemaSupportedJsonSchema } = {};
  constructor() {
    this._schemas = {};
  }
  validateMultiple(d: any, s: TreemaSupportedJsonSchema) {
    return noopValidator(d, s);
  }
  getSchemaRef(id: string) {
    return this._schemas[id];
  }
  addSchema(schema: TreemaSupportedJsonSchema, id: string) {
    this._schemas[id] = schema;
  }
}

export const getNoopLib: () => TreemaWrappedSchemaLib = () => {
  return new NoopLib();
};

type Tv4 = any;

// https://github.com/geraintluff/tv4
export const wrapTv4 = (tv4: Tv4): TreemaWrappedSchemaLib => {
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
export const wrapAjv = (ajv: any): TreemaWrappedSchemaLib => {
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
  schema: TreemaSupportedJsonSchema,
  lib: TreemaWrappedSchemaLib,
  callback: (context: TreemaNodeWalkContext) => void | TreemaWorkingSchema,
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
      const childPath = joinJsonPointers((path || ''), key.toString());
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

export const getJsonType = (data: any): SchemaBaseType | undefined => {
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

/**
 * Create a list of "working schemas" from a given schema. See TreemaWorkingSchema for more info.
 * @param schema 
 * @param lib 
 * @returns array of working schemas
 */
export const buildWorkingSchemas = (schema: TreemaSupportedJsonSchema, lib: TreemaWrappedSchemaLib): TreemaWorkingSchema[] => {
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

  let singularSchemas: TreemaSupportedJsonSchema[] = [];
  if (anyOf) {
    singularSchemas = singularSchemas.concat(anyOf);
  }
  if (oneOf) {
    singularSchemas = singularSchemas.concat(oneOf);
  }

  let workingSchemas: TreemaWorkingSchema[] = [];
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
const baseTypes: SchemaBaseType[] = ['string', 'boolean', 'number', 'array', 'object', 'null'];

const spreadTypes = (schema: TreemaSupportedJsonSchema): TreemaWorkingSchema[] => {
  const workingSchemas: TreemaWorkingSchema[] = [];
  if (schema.type === undefined) {
    baseTypes.forEach((type: SchemaBaseType) => {
      workingSchemas.push({
        ...schema,
        type,
      });
    });
  } else if (getType(schema.type) === 'string') {
    return [schema as TreemaWorkingSchema];
  } else {
    (schema.type as SchemaBaseType[]).forEach((type: SchemaBaseType) => {
      workingSchemas.push({
        ...schema,
        type,
      });
    });
  }

  return workingSchemas;
};

/**
 * Returns the first working schema that the data is valid for. Otherwise, returns the one with
 * the fewest errors.
 * 
 * @param data 
 * @param workingSchemas 
 * @param lib 
 * @returns best guess which working schema the data is intended for
 */
export const chooseWorkingSchema = (data: any, workingSchemas: TreemaWorkingSchema[], lib: TreemaWrappedSchemaLib): TreemaWorkingSchema => {
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

/**
 * Given a key and a schema, returns the schema for the child at that key, based on keywords like
 * properties and items.
 * 
 * @param key 
 * @param schema
 * @returns the raw schema 
 */
export const getChildSchema = (key: string | number, schema: TreemaSupportedJsonSchema): TreemaSupportedJsonSchema => {
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

export const getChildWorkingSchema: (key: string | number, schema: TreemaSupportedJsonSchema, lib: TreemaWrappedSchemaLib) => TreemaWorkingSchema = (
  key: string | number,
  schema: TreemaSupportedJsonSchema,
  lib: TreemaWrappedSchemaLib,
) => {
  const childSchema = getChildSchema(key, schema);
  const workingSchemas = buildWorkingSchemas(childSchema, lib);
  const workingSchema = chooseWorkingSchema(undefined, workingSchemas, lib);

  return workingSchema;
};

const resolveReference = (schema: TreemaSupportedJsonSchema, lib: TreemaWrappedSchemaLib): TreemaSupportedJsonSchema => {
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

const cloneSchema = (schema: TreemaSupportedJsonSchema): TreemaSupportedJsonSchema => {
  return Object.assign({}, schema);
};

/**
 * Combines two schemas, with the second schema overriding the first.
 *
 * Currently only "properties" and "required" are combined, rather than overriding. There are use cases for
 * these (see `inlineInteraction` in `CodeCombat.story.tsx`). If there are other use cases for other keywords,
 * the logic can be extended here.
 */
export const combineSchemas = (baseSchema: TreemaSupportedJsonSchema, schema: TreemaSupportedJsonSchema): TreemaSupportedJsonSchema => {
  const result = Object.assign({}, baseSchema, schema);

  // combine properties
  if (schema.properties && baseSchema.properties) {
    // combine recursively
    result.properties = Object.assign({}, baseSchema.properties, schema.properties);
    for (const [key] of Object.entries(schema.properties)) {
      if (key in baseSchema.properties) {
        result.properties[key] = combineSchemas(baseSchema.properties[key], schema.properties[key]);
      }
    }
  }

  // combine required
  if (schema.required && baseSchema.required) {
    result.required = baseSchema.required.concat(schema.required);
  }

  /*
  More special combine use cases could be added here, such as:
  * Recursive combination of `default` objects
  * Max of "min" keywords (and vice versa)
  * Intersection of `type` arrays
  etc...
  */
  
  return result;
};

interface CloneOptions {
  shallow?: boolean;
}

/**
 * Creates a deep clone of data, unless shallow is true, in which case it only clones the top level.
 * 
 * @param data 
 * @param options 
 * @returns 
 */
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

export const getValueForRequiredType: (type: SchemaBaseType) => any = (type: SchemaBaseType) => {
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

/**
 * Given a schema and data, populates any required properties in the data with default values. Also
 * takes in a TreemaWrappedSchemaLib, which is used to dereference $ref and determine which working
 * schema to use.
 * 
 * @param givenData 
 * @param schema 
 * @param lib 
 * @returns a new version of givenData with required values included
 */
export const populateRequireds = (givenData: any, schema: TreemaSupportedJsonSchema, lib: TreemaWrappedSchemaLib): any => {
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
          const workingSchemas = buildWorkingSchemas(childSchema, lib);
          const workingSchema = chooseWorkingSchema(data, workingSchemas, lib);
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


// JsonPointer utils. Probably should just use a standard lib...

export const splitJsonPointer = (path: JsonPointer): string[] => {
  // Not actually following the whole spec, but this'll do for now.
  return path.split('/').slice(1);
};

export const getJsonPointerLastChild = (path: JsonPointer): string => {
  const parts = splitJsonPointer(path);
  return parts[parts.length-1];
};

export const joinJsonPointers = (...paths: string[]): JsonPointer => {
  // if the last one is just a property name, turn it into a path
  if (paths[paths.length-1][0] !== '/') {
    paths[paths.length-1] = '/' + paths[paths.length-1];
  }
  return paths.join('');
};

export const getParentJsonPointer = (path: JsonPointer): JsonPointer => {
  const parts = path.split('/');
  parts.pop();

  return parts.join('/');
};

export const getJsonPointerDepth = (path: JsonPointer): number => {
  return splitJsonPointer(path).length;
};

// Not actually used or tested anywhere... but should probably be exported as part of a set of utils.
export const getDataAtJsonPointer = (data: any, path: JsonPointer): any => {
  if (path === '') {
    return data;
  }
  let returnData = data;
  splitJsonPointer(path)
    .forEach((key) => {
      if (getType(returnData) === 'array') {
        returnData = returnData[parseInt(key)];
      } else {
        returnData = returnData[key];
      }
    });

  return returnData;
};
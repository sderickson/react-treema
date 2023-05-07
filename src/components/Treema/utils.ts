import { SchemaValidator, SupportedJsonSchema, SchemaLib, TreemaNodeContext } from './types';
import { JsonPointer } from './types';

export const noopValidator: SchemaValidator = () => {
  return { valid: true, errors: [], missing: [] };
};

export const noopLib: SchemaLib = {
  validateMultiple: noopValidator,
  getSchemaRef: () => ({}),
  addSchema: () => {},
};

interface Tv4Error {
  code: number;
  message: string;
  dataPath: JsonPointer;
  schemaPath: JsonPointer;
}

type Tv4 = any;

export const wrapTv4 = (tv4: Tv4): SchemaLib => {
  return {
    validateMultiple: (data, schema) => {
      let tv4Result = tv4.validateMultiple(data, schema);

      return {
        valid: tv4Result.valid,
        missing: tv4Result.missing,
        errors: tv4Result.errors.map((error: Tv4Error) => {
          return {
            id: error.code,
            message: error.message,
            dataPath: error.dataPath,
            schemaPath: error.schemaPath,
          };
        }),
      };
    },
    getSchemaRef: (ref) => {
      return tv4.getSchema(ref);
    },
    addSchema: (schema) => {
      tv4.addSchema(schema);
    },
  };
};

export const walk: (
  data: any,
  schema: SupportedJsonSchema,
  lib: SchemaLib,
  callback: (context: TreemaNodeContext) => void,
  path?: string,
) => any = (data, schema, lib, callback, path) => {
  const workingSchemas = buildWorkingSchemas(schema, lib);
  const workingSchema = chooseWorkingSchema(data, workingSchemas, lib);

  callback({ path: path || '', data, schema: workingSchema });

  // this actually works for both arrays and objects...
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

export const buildWorkingSchemas = (schema: SupportedJsonSchema, lib: SchemaLib): SupportedJsonSchema[] => {
  const givenSchema = resolveReference(schema, lib);
  if (!givenSchema.allOf && !givenSchema.anyOf && !givenSchema.oneOf) {
    return [givenSchema];
  }
  const baseSchema = cloneSchema(givenSchema);
  const allOf = baseSchema.allOf;
  const anyOf = baseSchema.anyOf;
  const oneOf = baseSchema.oneOf;
  delete baseSchema.allOf;
  delete baseSchema.anyOf;
  delete baseSchema.oneOf;

  if (allOf) {
    for (const schema of allOf) {
      combineSchemas(baseSchema, resolveReference(schema, lib));
    }
  }

  let workingSchemas: SupportedJsonSchema[] = [];
  let singularSchemas: SupportedJsonSchema[] = [];
  if (anyOf) {
    singularSchemas = singularSchemas.concat(anyOf);
  }
  if (oneOf) {
    singularSchemas = singularSchemas.concat(oneOf);
  }
  for (let singularSchema of singularSchemas) {
    singularSchema = resolveReference(singularSchema, lib);
    const newBase = cloneSchema(baseSchema);
    combineSchemas(newBase, singularSchema);
    workingSchemas.push(newBase);
  }

  if (workingSchemas.length === 0) {
    workingSchemas = [baseSchema];
  }

  return workingSchemas;
};

const chooseWorkingSchema = (data: any, workingSchemas: SupportedJsonSchema[], lib: SchemaLib) => {
  if (workingSchemas.length === 1) {
    return workingSchemas[0];
  }
  for (const schema of workingSchemas) {
    const result = lib.validateMultiple(data, schema);
    if (result.valid) {
      return schema;
    }
  }

  return workingSchemas[0];
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

const combineSchemas = (baseSchema: SupportedJsonSchema, schema: SupportedJsonSchema): SupportedJsonSchema => {
  return Object.assign(baseSchema, schema);
};

export const getParentPath = (path: JsonPointer): JsonPointer => {
  const parts = path.split('/');
  parts.pop();

  return parts.join('/');
};

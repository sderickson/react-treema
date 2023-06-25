import { SupportedJsonSchema } from './types';
import {
  buildWorkingSchemas,
  wrapTv4,
  getChildSchema,
  walk,
  getParentPath,
  clone,
  populateRequireds,
  combineSchemas,
  wrapAjv,
  chooseWorkingSchema,
} from './utils';
import tv4 from 'tv4';
import Ajv from 'ajv';

const schemaLib = wrapTv4(tv4);

describe('walk', () => {
  it('calls a callback on every piece of data in a JSON object, providing path, data and working schema', () => {
    const schema: SupportedJsonSchema = {
      type: 'object',
      properties: {
        key1: { title: 'Number 1' },
        key2: { title: 'Number 2' },
      },
    };

    const data = { key1: 1, key2: 2 };
    const paths: string[] = [];
    const values: any[] = [];

    walk(data, schema, schemaLib, ({ path, data }) => {
      paths.push(path);
      values.push(data);
    });

    expect(paths.length).toBe(3);

    expect(paths.includes('')).toBe(true);
    expect(paths.includes('/key1')).toBe(true);
    expect(paths.includes('/key2')).toBe(true);

    expect(values.includes(data)).toBe(true);
    expect(values.includes(data.key1)).toBe(true);
    expect(values.includes(data.key2)).toBe(true);
  });

  it('traverses arrays', () => {
    const schema: SupportedJsonSchema = {
      type: 'array',
      items: {
        type: 'object',
        title: 'marker',
      },
    };

    const data = [{}];
    let foundIt = false;

    walk(data, schema, schemaLib, ({ path, schema }) => {
      if (path === '/0' && schema.title === 'marker') {
        foundIt = true;
      }
    });

    expect(foundIt).toBe(true);
  });
});

describe('getChildSchema', () => {
  it('returns child schemas from properties', () => {
    const schema: SupportedJsonSchema = { properties: { key1: { title: 'some title' } } };
    const childSchema = getChildSchema('key1', schema);
    expect(childSchema.title).toBe('some title');
  });

  it('returns child schemas from additionalProperties', () => {
    const schema: SupportedJsonSchema = { additionalProperties: { title: 'some title' } };
    const childSchema = getChildSchema('key1', schema);
    expect(childSchema.title).toBe('some title');
  });

  it('returns child schemas from patternProperties', () => {
    const schema: SupportedJsonSchema = { patternProperties: { '^[a-z]+$': { title: 'some title' } } };
    const childSchema = getChildSchema('key', schema);
    expect(childSchema.title).toBe('some title');
    const childSchema2 = getChildSchema('123', schema);
    expect(childSchema2.title).toBeUndefined();
  });

  it('returns child schemas from an items schema', () => {
    const schema: SupportedJsonSchema = { items: { title: 'some title' } };
    const childSchema = getChildSchema(0, schema);
    expect(childSchema.title).toBe('some title');
  });

  it('returns child schemas from an items array of schemas', () => {
    const schema: SupportedJsonSchema = { items: [{ title: 'some title' }] };
    const childSchema = getChildSchema(0, schema);
    expect(childSchema.title).toBe('some title');
    const childSchema2 = getChildSchema(1, schema);
    expect(childSchema2.title).toBeUndefined();
  });

  it('returns child schemas from additionalItems', () => {
    const schema: SupportedJsonSchema = { items: [{ title: 'some title' }], additionalItems: { title: 'another title' } };
    const childSchema = getChildSchema(1, schema);
    expect(childSchema.title).toBe('another title');
  });
});

describe('buildWorkingSchemas', () => {
  it('returns the same single schema if there are no combinatorials or references', () => {
    const schema: SupportedJsonSchema = { type: 'string' };
    const workingSchemas = buildWorkingSchemas(schema, schemaLib);
    expect(workingSchemas[0] === schema).toBeTruthy();
  });

  it('combines allOf into a single schema', () => {
    const schema: SupportedJsonSchema = { title: 'title', allOf: [{ description: 'description' }, { type: 'number' }] };
    const workingSchemas = buildWorkingSchemas(schema, schemaLib);
    expect(workingSchemas.length).toBe(1);
    const workingSchema = workingSchemas[0];
    expect(workingSchema.title).toBe('title');
    expect(workingSchema.description).toBe('description');
    expect(workingSchema.type).toBe('number');
  });

  it('creates a separate working schema for each anyOf', () => {
    const schema: SupportedJsonSchema = { title: 'title', anyOf: [{ type: 'string' }, { type: 'number' }] };
    const workingSchemas = buildWorkingSchemas(schema, schemaLib);
    expect(workingSchemas.length).toBe(2);
    const types = workingSchemas.map((schema) => schema.type);
    expect(types.includes('string')).toBeTruthy();
    expect(types.includes('number')).toBeTruthy();
  });

  it('creates a separate working schema for each oneOf', () => {
    const schema: SupportedJsonSchema = { title: 'title', oneOf: [{ type: 'string' }, { type: 'number' }] };
    const workingSchemas = buildWorkingSchemas(schema, schemaLib);
    expect(workingSchemas.length).toBe(2);
    const types = workingSchemas.map((schema) => schema.type);
    expect(types.includes('string')).toBeTruthy();
    expect(types.includes('number')).toBeTruthy();
  });

  it('creates one working schema for every type if no type is specified', () => {
    const schema: SupportedJsonSchema = {};
    const workingSchemas = buildWorkingSchemas(schema, schemaLib);
    expect(workingSchemas.length).toBe(6);
    const types = workingSchemas.map((schema) => schema.type);
    types.sort();
    expect(types).toEqual(['array', 'boolean', 'null', 'number', 'object', 'string']);
  });

  it('creates one working schema for every type if type is an array', () => {
    const schema: SupportedJsonSchema = { type: ['boolean', 'number'] };
    const workingSchemas = buildWorkingSchemas(schema, schemaLib);
    expect(workingSchemas.length).toBe(2);
    const types = workingSchemas.map((schema) => schema.type);
    types.sort();
    expect(types).toEqual(['boolean', 'number']);
  });
});

describe('chooseWorkingSchema', () => {
  it('can use pattern (for tv4) or const (for ajv) to disambiguate which oneOf the data is using', () => {
    const schema: SupportedJsonSchema = {
      type: 'object',
      oneOf: [
        {
          title: 'type a',
          properties: {
            type: { const: 'a', type: 'string' },
            foo: { type: 'number', title: 'Numbered Foo' },
          },
          default: { type: 'a', foo: 1 },
          required: ['foo'],
        },
        {
          title: 'type b',
          properties: {
            type: { const: 'b', type: 'string' },
            foo: { type: 'string', title: 'Stringed Foo' },
          },
          default: { type: 'b', foo: 'bar' },
          required: ['foo'],
        },
      ],
    };
    const schemaLib = wrapAjv(new Ajv({ allErrors: true }));
    const workingSchemas = buildWorkingSchemas(schema, schemaLib);
    const workingSchema = chooseWorkingSchema({ type: 'b', foo: 'bar' }, workingSchemas, schemaLib);
    expect(workingSchema.title).toBe('type b');
  });
});

describe('getParentPath', () => {
  it('returns the parent path of a path', () => {
    expect(getParentPath('/')).toBe('');
    expect(getParentPath('/a')).toBe('');
    expect(getParentPath('/a/b')).toBe('/a');
  });
});

describe('combineSchemas', () => {
  it('merges properties', () => {
    const result = combineSchemas(
      {
        properties: {
          key1: { title: 'key1' },
        },
      },
      {
        properties: {
          key2: { title: 'key2' },
        },
      },
    );
    expect(result.properties).toEqual({
      key1: { title: 'key1' },
      key2: { title: 'key2' },
    });

    const result2 = combineSchemas(
      {
        properties: {
          key1: { title: 'key1' },
        },
      },
      {},
    );
    expect(result2.properties).toEqual({
      key1: { title: 'key1' },
    });
  });
});

describe('clone', () => {
  it('clones all JSON types', () => {
    expect(clone(null)).toBe(null);
    expect(clone(1)).toBe(1);
    expect(clone('string')).toBe('string');
    expect(clone(true)).toBe(true);
    expect(clone([1])).toEqual([1]);
    expect(clone({ foo: 'bar' })).toEqual({ foo: 'bar' });
    const originalObject = { foo: 'bar' };
    expect(clone(originalObject)).not.toBe(originalObject);
    const originalArray = [1];
    expect(clone(originalArray)).not.toBe(originalArray);
  });

  it('takes a shallow option', () => {
    const originalObject = { foo: { bar: 'baz' } };
    const clonedObject = clone(originalObject, { shallow: true });
    expect(clonedObject).toEqual(originalObject);
    expect(clonedObject).not.toBe(originalObject);
    expect(clonedObject.foo).toBe(originalObject.foo);
  });
});

describe('populateRequireds', () => {
  const schema: SupportedJsonSchema = {
    'type': 'object',
    'additionalProperties': false,
    'properties': {
      'string': { type: 'string' },
      'number': { type: 'number' },
      'null': { type: 'null' },
      'boolean': { type: 'boolean' },
      'array': { type: 'array', items: { type: 'number', default: 42 } },
      'object': { type: 'object' },
      'integer': { type: 'integer' },
      'def': { 'default': 1337 },
    },
    'required': ['integer', 'string', 'number', 'null', 'boolean', 'array', 'object', 'def'],
  };
  const data = {};

  it('populates all required values with generic data', () => {
    const result = populateRequireds(data, schema, schemaLib);
    expect(result['string']).toBe('');
    expect(result['number']).toBe(0);
    expect(result['integer']).toBe(0);
    expect(result['null']).toBe(null);
    expect(result['boolean']).toBe(false);
    expect(JSON.stringify(result['array'])).toBe(JSON.stringify([]));
    expect(JSON.stringify(result['object'])).toBe(JSON.stringify({}));
    expect(result['def']).toBe(1337);
  });

  it("populates data from the object's default property", () => {
    const schema: SupportedJsonSchema = {
      type: 'object',
      default: { key1: 'object default' },
      required: ['key1'],
    };
    const result = populateRequireds({}, schema, schemaLib);
    expect(result['key1']).toBe('object default');
  });

  it('populates data based on the child schema type', () => {
    const schema: SupportedJsonSchema = {
      type: 'object',
      required: ['key2'],
      properties: {
        key2: { type: 'number' },
      },
    };
    const result = populateRequireds({}, schema, schemaLib);
    expect(result['key2']).toBe(0);
  });

  it("populates data from the child schema's default property", () => {
    const schema: SupportedJsonSchema = {
      type: 'object',
      required: ['key3'],
      properties: {
        key3: { default: 'inner default' },
      },
    };
    const result = populateRequireds({}, schema, schemaLib);
    expect(result['key3']).toBe('inner default');
  });

  it('populates data as an empty string if nothing else is available', () => {
    const schema: SupportedJsonSchema = {
      required: ['key4'],
    };
    const result = populateRequireds({}, schema, schemaLib);
    expect(result['key4']).toBe('');
  });
});

// it 'populates required values with defaults', ->
//   expect(treema.get('/def')).toBe(1337)
//   treema.childrenTreemas['array'].addNewChild()
//   expect(treema.$el.find('input').val()).toBe('42')

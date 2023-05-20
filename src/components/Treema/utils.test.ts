import { SupportedJsonSchema } from './types';
import { buildWorkingSchemas, wrapTv4, getChildSchema, walk, getParentPath } from './utils';
import tv4 from 'tv4';

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

describe('utils', () => {
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
      const schema: SupportedJsonSchema = {type:'string'};
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
      const schema: SupportedJsonSchema = {type:['boolean', 'number']};
      const workingSchemas = buildWorkingSchemas(schema, schemaLib);
      expect(workingSchemas.length).toBe(2);
      const types = workingSchemas.map((schema) => schema.type);
      types.sort();
      expect(types).toEqual(['boolean', 'number']);
    });
  });

  describe('getParentPath', () => {
    it('returns the parent path of a path', () => {
      expect(getParentPath('/')).toBe('');
      expect(getParentPath('/a')).toBe('');
      expect(getParentPath('/a/b')).toBe('/a');
    });
  });
});

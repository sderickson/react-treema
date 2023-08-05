import { TreemaState } from './types';
import { getAllDatasAndSchemas, getListOfPaths, getSchemaErrorsByPath } from './selectors';
import { getDefaultState } from '../test-utils';
import { wrapAjv, wrapTv4 } from '../utils';
import Ajv from 'ajv';
import tv4 from 'tv4';

describe('getAllDatasAndSchemas', () => {
  it('includes default data information', () => {
    const state: TreemaState = {
      ...getDefaultState(),
      data: {
        explicitlySetValue: 'explicitly set value',
        deepDefaultValue: {
          setString: 'string',
        },
      },
      rootSchema: {
        'type': 'object',
        default: {
          'default': 'default value',
          'deepDefaultValue': {
            'setString': 'default string',
            'setNumber': 123,
            'setArray': [1, 2, 3],
          },
        },
      },
    };
    const result = getAllDatasAndSchemas(state);

    // "default" should be included, and is the root of a set of default data
    expect(result['/default']).toBeTruthy();
    expect(result['/default'].data).toEqual('default value');
    expect(result['/default'].defaultRoot).toEqual(true);

    // Even though "deepDafaultValue" is set one level up, it should be included
    expect(result['/deepDefaultValue/setNumber']).toBeTruthy();
    expect(result['/deepDefaultValue/setNumber'].data).toEqual(123);
    expect(result['/deepDefaultValue/setNumber'].defaultRoot).toEqual(true);

    // Numbers within "setArray" should have "defaultRoot" be false, though, since "setArray" is their defaultRoot
    expect(result['/deepDefaultValue/setArray/0']).toBeTruthy();
    expect(result['/deepDefaultValue/setArray/0'].data).toEqual(1);
    expect(result['/deepDefaultValue/setArray/0'].defaultRoot).toEqual(false);
  });

  it('includes properties for object nodes which are specified in a default object that are not included in the data', () => {
    const state: TreemaState = {
      ...getDefaultState(),
      rootSchema: {
        default: { key: 'value' },
      },
    };
    const result = getAllDatasAndSchemas(state);
    expect(result['/key']).toBeTruthy();
    expect(result['/key'].data).toEqual('value');
    expect(result['/key'].defaultRoot).toEqual(true);
  });
});

describe('getListOfPaths', () => {
  it('properly orders', () => {
    const state: TreemaState = {
      ...getDefaultState(),
      data: {
        explicitlySetValue: 'explicitly set value',
        deepDefaultValue: {
          setString: 'string',
        },
      },
      rootSchema: {
        'type': 'object',
        default: {
          'default': 'default value',
          'deepDefaultValue': {
            'setString': 'default string',
            'setNumber': 123,
            'setArray': [1, 2, 3],
          },
        },
      },
    };
    const result = getListOfPaths(state);
    expect(result).toEqual([
      '',
      '/explicitlySetValue',
      '/deepDefaultValue',
      '/deepDefaultValue/setString',
      '/deepDefaultValue/setNumber',
      '/deepDefaultValue/setArray',
      '/deepDefaultValue/setArray/0',
      '/deepDefaultValue/setArray/1',
      '/deepDefaultValue/setArray/2',
      'addTo:/deepDefaultValue/setArray',
      'addTo:/deepDefaultValue',
      '/default',
      'addTo:',
    ]);
  });

  it('includes recursive default paths', () => {
    const state: TreemaState = {
      ...getDefaultState(),
      rootSchema: {
        type: 'object',
        default: { a: {} }, // the default of the root object doe not include a default value for `b` in `a`
        properties: {
          a: {
            type: 'object',
            default: { b: {} }, // but the default for `a` does
          },
        },
      },
      data: {},
    };
    const result = getListOfPaths(state);
    // both /a and /a/b and their addTo: paths should be included
    expect(result).toEqual(['', '/a', '/a/b', 'addTo:/a/b', 'addTo:/a', 'addTo:']);
  });

  it('takes into account filters', () => {
    const state: TreemaState = {
      ...getDefaultState(),
      rootSchema: {},
      data: {
        a: {
          b: [
            'c',
            'd',
            'e',
          ],
          f: 'f',
        },
        g: 'g',
        h: [],
      },
      filter: 'd',
    };
    const result = getListOfPaths(state);
    // /a/b/1 and all parents/addTo: paths along the path should be included
    expect(result).toEqual(['', '/a', '/a/b', '/a/b/1', 'addTo:/a/b', 'addTo:/a', 'addTo:']);
  });
});

describe('getSchemaErrorsByPath', () => {
  it('returns errors based on the chosen working schema', () => {
    // In this schema, the example property must either have a type of 'a' or 'b', and foo of number or string respectively.
    // This tests that if the data doesn't match either schema, for each working schema chosen and each validator (tv4 or ajv),
    // there is one correct error returned.
    const state: TreemaState = {
      ...getDefaultState(),
      rootSchema: {
        title: 'One of example',
        type: 'object',
        properties: {
          example: {
            type: 'object',
            oneOf: [
              {
                title: 'type a',
                properties: {
                  type: { pattern: '^a$', type: 'string' },
                  foo: { type: 'number' },
                },
                default: { type: 'a', foo: 1 },
                required: ['foo'],
              },
              {
                title: 'type b',
                properties: {
                  type: { pattern: '^b$', type: 'string' },
                  foo: { type: 'string' },
                },
                default: { type: 'b', foo: 'bar' },
                required: ['foo'],
              },
            ],
          },
        },
      },
    };

    // Ajv, set to "Type A" test
    expect(
      getSchemaErrorsByPath({
        ...state,
        data: {
          example: {
            type: 'a',
            foo: 'bar',
          },
        },
        workingSchemaChoices: { '/example': 0 },
        schemaLib: wrapAjv(new Ajv({ allErrors: true })),
      }),
    ).toEqual({
      '/example/foo': [{ id: 'type', message: 'must be number', dataPath: '/example/foo' }],
    });

    // Ajv, set to "Type B" test
    expect(
      getSchemaErrorsByPath({
        ...state,
        data: {
          example: {
            type: 'b',
            foo: 1,
          },
        },
        workingSchemaChoices: { '/example': 1 },
        schemaLib: wrapAjv(new Ajv({ allErrors: true })),
      }),
    ).toEqual({
      '/example/foo': [{ id: 'type', message: 'must be string', dataPath: '/example/foo' }],
    });

    // Tv4, set to "Type A" test
    expect(
      getSchemaErrorsByPath({
        ...state,
        data: {
          example: {
            type: 'a',
            foo: 'bar',
          },
        },
        workingSchemaChoices: { '/example': 0 },
        schemaLib: wrapTv4(tv4),
      }),
    ).toEqual({
      '/example/foo': [{ id: 0, message: 'Invalid type: string (expected number)', dataPath: '/example/foo' }],
    });

    // Tv4, set to "Type B" test
    expect(
      getSchemaErrorsByPath({
        ...state,
        data: {
          example: {
            type: 'b',
            foo: 1,
          },
        },
        workingSchemaChoices: { '/example': 1 },
        schemaLib: wrapTv4(tv4),
      }),
    ).toEqual({
      '/example/foo': [{ id: 0, message: 'Invalid type: number (expected string)', dataPath: '/example/foo' }],
    });
  });
});

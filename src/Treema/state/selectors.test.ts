import { TreemaState } from './types';
import { getAllDatasAndSchemas, getListOfPaths } from './selectors';
import { getDefaultState } from '../test-utils';

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

  // it 'does not put default data into the containing data object', ->
  //   data = { }
  //   schema = { default: { key: 'value' } }
  //   treema = TreemaNode.make(null, {data: data, schema: schema})
  //   treema.build()
  //   expect(treema.data.key).toBeUndefined()

  // it 'puts data into the containing data object when its value is changed', ->
  //   data = { }
  //   schema = { default: { key: 'value' } }
  //   treema = TreemaNode.make(null, {data: data, schema: schema})
  //   treema.build()
  //   treema.set('key', 'testValue')
  //   expect(treema.data.key).toBe('testValue')
  //   expect(treema.childrenTreemas.key.integrated).toBe(true)
  //   expect(treema.$el.find('.treema-node').length).toBe(1)

  // it 'keeps a default node around when you delete one with backup default data', ->
  //   data = { key: 'setValue' }
  //   schema = { default: { key: 'value' } }
  //   treema = TreemaNode.make(null, {data: data, schema: schema})
  //   treema.build()
  //   treema.delete('key')
  //   expect(treema.data.key).toBeUndefined()
  //   expect(treema.childrenTreemas.key).toBeDefined()
  //   expect(treema.childrenTreemas.key.integrated).toBe(false)
  //   expect(Object.keys(treema.data).length).toBe(0)
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
      '/default',
    ]);
  });
});
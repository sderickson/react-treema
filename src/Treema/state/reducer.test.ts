import { TreemaState } from './types';
import { setData, beginAddProperty, endAddProperty, editAddProperty, deleteAction } from './actions';
import { reducer } from './reducer';
import { dispatchMultiple, getDefaultState } from '../test-utils';

describe('setData action', () => {
  it('takes a path and sets the given data there, returning an object cloned where necessary', () => {
    const state: TreemaState = {
      ...getDefaultState(),
      data: {
        'a': {},
        'b': [{}, {}],
      },
    };
    const action = setData('/b/1/foo', 'bar');
    const result = reducer(state, action);

    // data has been set
    expect(result.data.b[1].foo).toEqual('bar');

    // arrays and objects along the way have been cloned
    expect(result.data).not.toBe(state.data);
    expect(result.data.b).not.toBe(state.data.b);
    expect(result.data.b[1]).not.toBe(state.data.b[1]);

    // siblings though still reference the previous data object
    expect(result.data.a).toBe(state.data.a);
    expect(result.data.b[0]).toBe(state.data.b[0]);
  });

  it('fills in defaults if needed', () => {
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
    const action = setData('/deepDefaultValue/setArray/1', 5);
    const result = reducer(state, action);
    expect(result.data).toEqual({
      explicitlySetValue: 'explicitly set value',
      deepDefaultValue: { setString: 'string', setArray: [1, 5, 3] },
    });
  });
});

describe('add property actions', () => {
  it('adds a property to an object', () => {
    const state: TreemaState = {
      ...getDefaultState(),
      data: {
        'a': {},
        'b': [{}, {}],
      },
    };
    const newState = dispatchMultiple(state, [beginAddProperty('/a'), editAddProperty('foo'), endAddProperty()]);

    // data has been set
    expect(newState.data.a.foo).toEqual('');
  });
});

describe('delete action', () => {
  it('deletes a property from an object', () => {
    const state: TreemaState = {
      ...getDefaultState(),
      data: {
        'a': {
          'foo': 'bar',
        },
        'b': [{}, {}],
      },
    };
    const action = deleteAction('/a/foo');
    const result = reducer(state, action);

    // data has been set
    expect(result.data).toEqual({
      'a': {},
      'b': [{}, {}],
    });
  });

  it('deletes an item from an array', () => {
    const state: TreemaState = {
      ...getDefaultState(),
      data: ['first', 'second'],
    };
    const action = deleteAction('/0');
    const result = reducer(state, action);

    // data has been set
    expect(result.data).toEqual(['second']);
  });
});

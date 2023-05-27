import { TreemaState } from './types';
import { setData } from './actions';
import { noopLib } from '../utils';
import { reducer } from './reducer';
import { coreDefinitions } from '../definitions';

describe('setData action', () => {
  it('takes a path and sets the given data there, returning an object cloned where necessary', () => {
    const state: TreemaState = {
      data: {
        'a': {},
        'b': [
          {},
          {},
        ]
      },
      rootSchema: {},
      schemaLib: noopLib,
      closed: {},
      definitions: coreDefinitions
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
});
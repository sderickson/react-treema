import { TreemaState } from './state/types';
import { noopLib } from './utils';
import { coreDefinitions } from './definitions';
import { TreemaAction } from './state/actions';
import { reducer } from './state/reducer';

export const getDefaultState = (): TreemaState => {
  return {
    data: {},
    schemaLib: noopLib,
    rootSchema: {},
    closed: {},
    definitions: coreDefinitions,
    settings: {},
  };
};

export const dispatchMultiple = (state: TreemaState, actions: TreemaAction[]) => {
  return actions.reduce((s, action) => {
    return reducer(s, action);
  }, state);
};

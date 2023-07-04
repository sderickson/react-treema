import { TreemaState } from './state/types';
import { noopLib } from './utils';
import { coreDefinitionsMap } from './definitions';
import { TreemaAction } from './state/actions';
import { reducer } from './state/reducer';
import { TreemaRootProps } from './types';

export const getDefaultState = (): TreemaState => {
  return {
    data: {},
    schemaLib: noopLib,
    rootSchema: {},
    closed: {},
    definitions: coreDefinitionsMap,
    settings: {},
    workingSchemaChoices: {},
  };
};

export const dispatchMultiple = (state: TreemaState, actions: TreemaAction[]) => {
  return actions.reduce((s, action) => {
    return reducer(s, action);
  }, state);
};

export const getDefaultProps = (): TreemaRootProps => {
  return {
    data: {},
    schema: {},
  };
};

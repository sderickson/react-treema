import { TreemaState } from './state/types';
import { noopLib } from './utils';
import { coreDefinitions } from './definitions';

export const getDefaultState = (): TreemaState => {
  return {
    data: {},
    schemaLib: noopLib,
    rootSchema: {},
    closed: {},
    definitions: coreDefinitions,
    settings: {},
  };
}

import { onEvent } from './context';
import { noopLib } from '../utils';
import { TreemaRootProps } from 'Treema/TreemaRoot';
import { GenericTest } from './types';

export const deleteAllData: GenericTest = {
  name: 'deletes all entries in an array',
  test: async (ctx) => {
    await ctx.fireFocus();
    await ctx.fireArrowDown();
    await ctx.fireBackspace();
    await ctx.fireBackspace();
    await ctx.fireBackspace();
    const data = ctx.getData();
    ctx.expect(data).toEqual([]);
  },
};

export const deleteKeyTests: GenericTest[] = [deleteAllData];

export const args: TreemaRootProps = {
  schemaLib: noopLib,
  onEvent,
  data: [1, 2, 3],
  schema: {
    type: 'array',
    items: {
      type: 'number',
    },
  },
};

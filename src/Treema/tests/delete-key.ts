import { onEvent } from './context';
import { getNoopLib } from '../utils';
import { TreemaRootProps } from '../types';
import { GenericTest } from './types';

export const deleteAllData: GenericTest = {
  name: 'deletes all entries in an array',
  test: async (ctx) => {
    await ctx.fireFocus();
    await ctx.fireArrowDown();
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
  schemaLib: getNoopLib(),
  onEvent,
  data: [1, 2, 3],
  schema: {
    type: 'array',
    items: {
      type: 'number',
    },
  },
};

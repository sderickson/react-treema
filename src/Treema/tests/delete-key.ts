import { onEvent } from './context';
import { getNoopLib } from '../utils';
import { TreemaRootProps } from '../types';
import { GenericTest } from './types';

export const deleteAllData: GenericTest = {
  name: 'deletes all entries in an array and undo/redo',
  test: async (ctx) => {
    await ctx.fireFocus();
    await ctx.fireArrowDown();
    await ctx.fireArrowDown();
    await ctx.fireBackspace();
    await ctx.fireBackspace();
    await ctx.fireBackspace();
    const data = ctx.getData();
    ctx.expect(data).toEqual([]);
    await ctx.fireUndo();
    await ctx.fireUndo();
    await ctx.fireUndo();
    ctx.expect(ctx.getData()).toEqual([1,2,3]);
    await ctx.fireRedo();
    await ctx.fireRedo();
    await ctx.fireRedo();
    ctx.expect(ctx.getData()).toEqual([]);
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

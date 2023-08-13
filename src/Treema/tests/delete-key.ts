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

export const deleteMetaSelect: GenericTest = {
  name: 'deletes all entries in an array selected with meta/ctrl + click, handles undo',
  test: async (ctx) => {
    await ctx.fireFocus();
    await ctx.keyboard("{Meta>}");
    await ctx.click(ctx.query().getByTestId('/0'));
    await ctx.click(ctx.query().getByTestId('/2'));
    await ctx.keyboard("{/Meta}");
    await ctx.fireBackspace();
    ctx.expect(ctx.getData()).toEqual([2]);
    ctx.expect(ctx.getAllSelected()).toEqual({'/0': true});
    await ctx.fireUndo();
    ctx.expect(ctx.getData()).toEqual([1,2,3]);
    ctx.expect(ctx.getAllSelected()).toEqual({'/0': true, '/2': true});
    await ctx.fireRedo();
    ctx.expect(ctx.getData()).toEqual([2]);
    ctx.expect(ctx.getAllSelected()).toEqual({'/0': true});
  }
}

export const deleteShiftSelect: GenericTest = {
  name: 'deletes all entries in an array selected with shift + click, handles undo',
  test: async (ctx) => {
    await ctx.fireFocus();
    await ctx.keyboard("{Shift>}");
    await ctx.click(ctx.query().getByTestId('/0'));
    await ctx.click(ctx.query().getByTestId('/2'));
    await ctx.keyboard("{/Shift}");
    await ctx.fireBackspace();
    ctx.expect(ctx.getAllSelected()).toEqual({'': true});
    ctx.expect(ctx.getData()).toEqual([]);
    await ctx.fireUndo();
    ctx.expect(ctx.getAllSelected()).toEqual({ '/0': true, '/1': true, '/2': true });
    ctx.expect(ctx.getData()).toEqual([1,2,3]);
    await ctx.fireRedo();
    ctx.expect(ctx.getAllSelected()).toEqual({'': true});
    ctx.expect(ctx.getData()).toEqual([]);
  }
}

export const deleteKeyTests: GenericTest[] = [deleteAllData, deleteMetaSelect, deleteShiftSelect];

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

import { onEvent } from './context';
import { noopLib } from '../utils';
import { TreemaRootProps } from 'Treema/TreemaRoot';
import { GenericTest } from './types';

export const editRow: GenericTest = {
  name: 'edits the selected row, if editable',
  test: async (ctx) => {
    await ctx.fireFocus();
    await ctx.fireEnter();
    await ctx.type('Hi!');
    await ctx.fireEnter();
    const data = ctx.getData();
    ctx.expect(data.name).toEqual('BobHi!');
  },
};

export const enterKeyTests: GenericTest[] = [editRow];

export const args: TreemaRootProps = {
  schemaLib: noopLib,
  onEvent,
  initOpen: 1,
  data: { name: 'Bob', numbers: ['401-401-1337', ['123-456-7890']], address: 'Mars' },
  schema: {
    type: 'object',
    displayProperty: 'name',
    properties: {
      name: { type: 'string', title: 'NAME' },
      numbers: { type: 'array', items: { 'type': ['string', 'array'] } },
      address: { type: 'string' },
    },
  },
};

export const editRootArrayTest: GenericTest = {
  name: 'can get to the final row and add another element to the array',
  test: async (ctx) => {
    await ctx.fireFocus();
    await ctx.fireTab();
    await ctx.fireTab();
    await ctx.fireTab();
    await ctx.fireTab();
    await ctx.fireEnter();
    await ctx.fireArrowRight();
    await ctx.type('9001');
    await ctx.fireEnter();
    await ctx.type('9002');
    await ctx.fireEnter();
    const data = ctx.getData();
    ctx.expect(data).toEqual([1,2,3,90010, 90020, 0]); // not sure what's going on with "type" here... should be 9001
  },
};

export const editRootArrayArgs: TreemaRootProps = {
  data: [1,2,3],
  schema: { type: 'array', items: { type: 'number' }},
  onEvent,
}
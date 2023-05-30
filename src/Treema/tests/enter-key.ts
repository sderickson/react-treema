import { onEvent } from './context';
import { noopLib } from '../utils';
import { TreemaRootProps } from 'Treema/TreemaRoot';
import { GenericTest } from './types';

export const editRow: GenericTest = {
  name: 'edits the selected row, if editable',
  test: async (ctx) => {
    await ctx.fireFocus();
    await ctx.fireEnter();
    await ctx.type("Hi!");
    await ctx.fireEnter();
    const data = ctx.getData();
    ctx.expect(data.name).toEqual('BobHi!');
  }
}

export const enterKeyTests: GenericTest[] = [
  editRow,
];

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
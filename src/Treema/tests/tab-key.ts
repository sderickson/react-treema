import { onEvent } from './context';
import { noopLib } from '../utils';
import { TreemaRootProps } from '../types';
import { GenericTest } from './types';

export const tabHiddenAndClosedRowTest: GenericTest = {
  name: 'edits the selected row, if editable',
  test: async (ctx) => {
    await ctx.fireFocus();
    await ctx.fireTab();
    await ctx.fireTab();
    ctx.expect(ctx.getLastPath()).toBe('/name');
    await ctx.fireTab();
    ctx.expect(ctx.getLastPath()).toBe('/numbers');
    await ctx.fireTab();
    ctx.expect(ctx.getLastPath()).toBe('/address');
  },
};

export const tabKeyTests: GenericTest[] = [tabHiddenAndClosedRowTest];

export const args: TreemaRootProps = {
  schemaLib: noopLib,
  onEvent,
  initOpen: 1,
  data: { id: 'xyzzy', name: 'Bob', numbers: ['401-401-1337'], address: 'Mars' },
  schema: {
    type: 'object',
    displayProperty: 'name',
    properties: {
      id: { type: 'string', format: 'hidden' },
      name: { type: 'string', title: 'NAME' },
      numbers: { type: 'array', items: { type: 'string' } },
      address: { type: 'string' },
    },
  },
};

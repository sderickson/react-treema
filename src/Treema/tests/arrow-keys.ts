import { onEvent } from './context';
import { noopLib } from '../utils';
import { TreemaRootProps } from 'Treema/TreemaRoot';
import { GenericTest } from './types';

export const downStartTest: GenericTest = {
  name: 'down arrow starts at the top row, if nothing is selected',
  test: async (ctx) => {
    await ctx.fireFocus();
    await ctx.fireArrowDown();
    ctx.expect(ctx.getLastPath()).toEqual('/name');
  }
}

export const skipClosed: GenericTest = { 
  name: 'up and down arrows skip closed collections',
  test: async (ctx) => {
    await ctx.fireArrowDown();
    await ctx.fireArrowDown();
    ctx.expect(ctx.getLastPath()).toEqual('/numbers');
    await ctx.fireArrowDown();
    ctx.expect(ctx.getLastPath()).toEqual('/address');
    await ctx.fireArrowUp();
    ctx.expect(ctx.getLastPath()).toEqual('/numbers');
  }
}

export const rightOpens: GenericTest = {
  name: 'right arrow opens a collection',
  test: async (ctx) => {
    await ctx.fireArrowDown();
    await ctx.fireArrowDown();
    ctx.expect(ctx.getLastPath()).toEqual('/numbers');
    await ctx.fireArrowRight();
    await ctx.fireArrowDown();
    ctx.expect(ctx.getLastPath()).toEqual('/numbers/0');
  }
}

export const traverseOpenCollections: GenericTest = {
  name: 'up and down traverses open collections',
  test: async (ctx) => {
    await ctx.fireArrowDown();
    await ctx.fireArrowDown();
    ctx.expect(ctx.getLastPath()).toEqual('/numbers');
    await ctx.fireArrowRight();
    await ctx.fireArrowDown();
    ctx.expect(ctx.getLastPath()).toEqual('/numbers/0');
    await ctx.fireArrowDown();
    ctx.expect(ctx.getLastPath()).toEqual('/numbers/1');
    await ctx.fireArrowDown();
    ctx.expect(ctx.getLastPath()).toEqual('/numbers/1/0');
    await ctx.fireArrowDown();
    ctx.expect(ctx.getLastPath()).toEqual('/address');
    await ctx.fireArrowUp();
    ctx.expect(ctx.getLastPath()).toEqual('/numbers/1/0');
    await ctx.fireArrowUp();
    ctx.expect(ctx.getLastPath()).toEqual('/numbers/1');
    await ctx.fireArrowUp();
    ctx.expect(ctx.getLastPath()).toEqual('/numbers/0');
  }
}

export const closeCollections: GenericTest = {
  name: 'left arrow closes a collection',
  test: async (ctx) => {
    await ctx.fireArrowDown();
    await ctx.fireArrowDown();
    ctx.expect(ctx.getLastPath()).toEqual('/numbers');
    await ctx.fireArrowRight();
    await ctx.fireArrowDown();
    ctx.expect(ctx.getLastPath()).toEqual('/numbers/0');
    await ctx.fireArrowLeft();
    ctx.expect(ctx.getLastPath()).toEqual('/numbers');
    await ctx.fireArrowLeft();
    ctx.expect(ctx.getLastPath()).toEqual('/numbers');
    await ctx.fireArrowDown();
    ctx.expect(ctx.getLastPath()).toEqual('/address');
  }
}

export const eitherEnd: GenericTest = {
  name: 'up arrow wraps at the top of the collection, down arrow stays at the bottom',
  test: async (ctx) => {
    await ctx.fireArrowDown();
    ctx.expect(ctx.getLastPath()).toEqual('/name');
    await ctx.fireArrowUp();
    ctx.expect(ctx.getLastPath()).toEqual('/address');
    await ctx.fireArrowDown();
    ctx.expect(ctx.getLastPath()).toEqual('/address');
  }
}

export const arrowKeyTests: GenericTest[] = [
  downStartTest,
  skipClosed,
  rightOpens,
  traverseOpenCollections,
  closeCollections,
  eitherEnd,
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
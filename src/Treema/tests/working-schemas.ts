import { onEvent } from './context';
import { wrapAjv } from '../utils';
import Ajv from 'ajv';
import { TreemaRootProps } from '../types';
import { GenericTest } from './types';

export const switchWorkingSchema: GenericTest = {
  name: 'switching to another working schema',
  test: async (ctx) => {
    const result = await ctx.testingLibrary.within(ctx.treema).getByRole('combobox');
    await ctx.selectOptions(result, 'type a');
    ctx.expect(ctx.getData()).toEqual({ example: { type: 'a', foo: 1 } });
  },
};

export const breakCurrentWorkingSchema: GenericTest = {
  name: 'changing value to break the current working schema retains the currently selected working schema',
  test: async (ctx) => {
    // initial value starts with data that matches the "type b" schema
    await ctx.fireFocus();
    await ctx.fireTab();
    await ctx.fireTab();
    // await ctx.fireBackspace();

    await ctx.fireEnter();
    await ctx.clear();
    await ctx.keyboard('a');
    await ctx.fireTab();
    // now make the value no longer fit "type b"
    // but we should still see the "type b" schema title of the adjacent property...
    await ctx.testingLibrary.within(ctx.treema).getByText('Stringed Foo:');
  },
};

export const workingSchemaTests: GenericTest[] = [switchWorkingSchema, breakCurrentWorkingSchema];

export const args: TreemaRootProps = {
  schemaLib: wrapAjv(new Ajv({ allErrors: true })),
  onEvent,
  data: { example: { type: 'b', foo: 'bar' } },
  schema: {
    title: 'One of example',
    type: 'object',
    properties: {
      example: {
        type: 'object',
        oneOf: [
          {
            title: 'type a',
            properties: {
              type: { const: 'a', type: 'string' },
              foo: { type: 'number', title: 'Numbered Foo' },
            },
            default: { type: 'a', foo: 1 },
            required: ['foo', 'type'],
          },
          {
            title: 'type b',
            properties: {
              type: { const: 'b', type: 'string' },
              foo: { type: 'string', title: 'Stringed Foo' },
            },
            default: { type: 'b', foo: 'bar' },
            required: ['foo', 'type'],
          },
        ],
      },
    },
  },
};

/**
 * TODO Use cases:
 * * if the schema is working, and it is changed to not work, don't lose the chosen schema
 * * if not working, don't populate with defaults/required
 */

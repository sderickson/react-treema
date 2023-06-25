import { onEvent } from './context';
import { wrapAjv } from '../utils';
import Ajv from 'ajv';
import { TreemaRootProps } from 'Treema/TreemaRoot';
import { GenericTest } from './types';

export const switchWorkingSchema: GenericTest = {
  name: 'switching to another working schema',
  test: async (ctx) => {
    const result = await ctx.testingLibrary.within(ctx.treema).getByRole('combobox');
    await ctx.selectOptions(result, 'type a');
    ctx.expect(ctx.getData()).toEqual({ example: { type: 'a', foo: 1 } });
  },
};

export const workingSchemaTests: GenericTest[] = [switchWorkingSchema];

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
            required: ['foo'],
          },
          {
            title: 'type b',
            properties: {
              type: { const: 'b', type: 'string' },
              foo: { type: 'string', title: 'Stringed Foo' },
            },
            default: { type: 'b', foo: 'bar' },
            required: ['foo'],
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
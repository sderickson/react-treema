import { TreemaRootProps } from '../TreemaRoot';
import { GenericTest } from './types';

export const renderStringTest: GenericTest = {
  name: 'should render strings',
  test: async (ctx) => {
    ctx.query().getByText('testasdf');
  },
};

export const renderStringArgs: TreemaRootProps = {
  data: { "string": "testasdf" },
  schema: { 'type': 'object', properties: { 'string': { type: 'string' } } },
};

export const renderNullTest: GenericTest = {
  name: 'should render nulls',
  test: async (ctx) => {
    ctx.query().getByText('null');
  },
};

export const renderNullArgs: TreemaRootProps = {
  data: { "null": null },
  schema: { 'type': 'object', properties: { 'null': { type: 'null' } } },
};

export const renderNumberTest: GenericTest = {
  name: 'should render numbers',
  test: async (ctx) => {
    ctx.query().getByText('123');
  },
};

export const renderNumberArgs: TreemaRootProps = {
  data: { "number": 123 },
  schema: { 'type': 'object', properties: { 'number': { type: 'number' } } },
};

export const renderBooleanTest: GenericTest = {
  name: 'should render booleans',
  test: async (ctx) => {
    ctx.query().getByText('true');
  },
};

export const renderBooleanArgs: TreemaRootProps = {
  data: { "boolean": true },
  schema: { 'type': 'object', properties: { 'boolean': { type: 'boolean' } } },
};

export const renderArrayTest: GenericTest = {
  name: 'should render arrays',
  test: async (ctx) => {
    ctx.query().getByText('234');
  },
};

export const renderArrayArgs: TreemaRootProps = {
  data: { "array": [1, 234, 3] },
  schema: { 'type': 'object', properties: { 'array': { type: 'array', items: { type: 'number'} } } },
};

export const renderObjectTest: GenericTest = {
  name: 'should render objects',
  test: async (ctx) => {
    ctx.query().getByText('234');
  },
};

export const renderObjectArgs: TreemaRootProps = {
  data: { 'a': 1, 'b': 234 },
  schema: { 'type': 'object', 'properties': { 'a': { 'type': 'number' }, 'b': { 'type': 'number' } } },
};
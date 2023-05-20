import { TreemaRoot } from './TreemaRoot';
import tv4 from 'tv4';
import { wrapTv4 } from './utils';
import Ajv from 'ajv';
import { wrapAjv } from './utils';

export default {
  title: 'TreemaRoot',
  component: TreemaRoot,
  tags: ['autodocs'],
};

/**
 * This Treema shows a relatively simple data structure: an array of objects with values that are
 * all primitive data types. You can try creating a new object, editing the values, and deleting
 * entries or values.
 */
export const Addresses = {
  args: {
    schemaLib: { validateMultiple: () => ({ valid: true, errors: [] }), getSchema: () => ({}) },
    onEvent: (e: any) => console.log(e),
    data: [
      {
        'street-address': '10 Downing Street',
        'country-name': 'UK',
        'locality': 'London',
        'name': 'Prime Minister',
        'friend': true,
      },
      {
        'street-address': '1600 Amphitheatre Pkwy',
        'phone-number': '(650) 253-0000',
        'name': 'Google',
        'number': 100,
      },
      {
        'street-address': '45 Rockefeller Plaza',
        'region': 'NY',
        'locality': 'New York',
        'name': 'Rockefeller Center',
        'null': null,
      },
    ],
    schema: {
      'type': 'array',
      'items': {
        'additionalProperties': false,
        'type': 'object',
        'displayProperty': 'name',
        'properties': {
          'number': {
            'type': 'number',
            'title': 'Number',
          },
          'null': {
            'type': 'null',
            'title': 'Null',
          },
          'name': {
            'type': 'string',
            'maxLength': 20,
          },
          'street-address': {
            'title': 'Address 1',
            'description': "Don't forget the number.",
            'type': 'string',
          },
          'locality': {
            'type': 'string',
            'title': 'Locality',
          },
          'region': {
            'title': 'Region',
            'type': 'string',
          },
          'country-name': {
            'type': 'string',
            'title': 'Country',
          },
          'friend': {
            'type': 'boolean',
            'title': 'Friend',
          },
          'phone-number': {
            'type': 'string',
            'maxLength': 20,
            'minLength': 4,
            'title': 'Phone Number',
          },
        },
      },
    },
  },
};

/**
 * In this example, values in the "numbers" array can either be strings or arrays of strings.
 */
export const WithNestedArrays = {
  args: {
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
  },
};

const badData = {
  'string': 1,
  'number': '1',
  'null': '1',
  'boolean': '1',
  'object': '1',
  'array': '1',
  'anything-but-boolean': true,
  'dne': '1',
  'number-or-string': null,
};
const badSchema = {
  'type': 'object',
  'properties': {
    'string': { 'type': 'string' },
    'number': { 'type': 'number' },
    'null': { 'type': 'null' },
    'boolean': { 'type': 'boolean' },
    'object': { 'type': 'object' },
    'array': { 'type': 'array' },
    'anything-but-boolean': { 'not': { 'type': 'boolean' } },
    'number-or-string': { 'type': ['number', 'string'] },
  },
  additionalProperties: false,
};

/**
 * Tv4 is a JSON Schema validator that supports draft-4 of the spec. It is fairly old and no longer
 * maintained, but it is an example of how Treema can support a wide variety of validators.
 */
export const ValidateWithTv4 = {
  args: {
    data: badData,
    schema: badSchema,
    schemaLib: wrapTv4(tv4),
  }
}

/**
 * Ajv is a JSON Schema validator that supports draft-7 of the spec. It is a popular validator,
 * and shows how different validators might cause Treema to act differently. For example, Ajv
 * when reporting an "additionalProperties" error, will target the object with the offending
 * property, while Tv4 will target the property itself. They also clearly have different error
 * messages.
 */
export const ValidateWithAjv = {
  args: {
    data: badData,
    schema: badSchema,
    schemaLib: wrapAjv(new Ajv({allErrors: true})),
  }
}


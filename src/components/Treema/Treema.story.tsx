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
export const BasicExample = {
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
export const NestedArrays = {
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
export const Tv4Validator = {
  args: {
    data: badData,
    schema: badSchema,
    schemaLib: wrapTv4(tv4),
  },
};

/**
 * Ajv is a JSON Schema validator that supports draft-7 of the spec. It is a popular validator,
 * and shows how different validators might cause Treema to act differently. For example, Ajv
 * when reporting an "additionalProperties" error, will target the object with the offending
 * property, while Tv4 will target the property itself. They also clearly have different error
 * messages.
 */
export const AjvValidator = {
  args: {
    data: badData,
    schema: badSchema,
    schemaLib: wrapAjv(new Ajv({ allErrors: true })),
  },
};

/**
 * JSON Schema supports the `oneOf` keyword, which allows you to specify that a value can be
 * one of several different types. Treema will check which of these schemas the data matches,
 * and uses that schema as a "working schema". For example, in this array each item is "one of"
 * either an array or an object, and Treema will use the appropriate `title` depending on which
 * of the schemas the value matches.
 */
export const OneOf = {
  args: {
    data: [{ string: 'string' }, [1, 2, 3], { string: 'another' }],
    schema: {
      type: 'array',
      items: {
        oneOf: [
          {
            type: 'object',
            title: 'Object Type',
            properties: 'string',
          },
          {
            type: 'array',
            title: 'Array Type',
            items: 'number',
          },
        ],
      },
    },
  },
};

/**
 * JSON Schema also supports the `anyOf` keyword. Although it behaves differently than `oneOf` as part
 * of the spec, it is treated equivalently by Treema, since how it should handle permutations is
 * unclear.
 */
export const AnyOf = {
  args: {
    data: [{ string: 'string' }, [1, 2, 3], { string: 'another' }],
    schema: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            title: 'Object Type',
            properties: 'string',
          },
          {
            type: 'array',
            title: 'Array Type',
            items: 'number',
          },
        ],
      },
    },
  },
};

/**
 * JSON Schema supports the `allOf` keyword, but fairly simply. It just combines the schemas
 * into one, not attempting to do anything fancy to really make sure they become a single
 * schema that truly combines them all. This behavior may change if there is a valid use case.
 */
export const AllOf = {
  args: {
    data: { 'foo': 'bar' },
    schema: {
      type: 'object',
      properties: {
        foo: {
          type: 'string',
          allOf: [
            {
              title: 'Combined Title',
            },
          ],
        },
      },
    },
  },
};

const geoSchema = {
  '$id': 'https://example.com/geographical-location.schema.json',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'title': 'Longitude and Latitude Values',
  'description': 'A geographical coordinate.',
  'required': ['latitude', 'longitude'],
  'type': 'object',
  'properties': {
    'latitude': {
      'type': 'number',
      'minimum': -90,
      'maximum': 90,
    },
    'longitude': {
      'type': 'number',
      'minimum': -180,
      'maximum': 180,
    },
  },
};

const calendarSchema = {
  '$id': 'https://example.com/calendar.schema.json',
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  'description': 'A representation of an event',
  'type': 'object',
  'required': ['dtstart', 'summary'],
  'properties': {
    'dtstart': {
      'type': 'string',
      'description': 'Event starting time',
    },
    'dtend': {
      'type': 'string',
      'description': 'Event ending time',
    },
    'summary': {
      'type': 'string',
    },
    'location': {
      'type': 'string',
    },
    'url': {
      'type': 'string',
    },
    'duration': {
      'type': 'string',
      'description': 'Event duration',
    },
    'rdate': {
      'type': 'string',
      'description': 'Recurrence date',
    },
    'rrule': {
      'type': 'string',
      'description': 'Recurrence rule',
    },
    'category': {
      'type': 'string',
    },
    'description': {
      'type': 'string',
    },
    'geo': {
      '$ref': 'https://example.com/geographical-location.schema.json',
    },
  },
};

tv4.addSchema(geoSchema.$id, geoSchema);
tv4.addSchema(calendarSchema.$id, calendarSchema);

/**
 * Treema relies on validators to resolve `$ref` references as well as validate data. In this example,
 * the schema given to Treema is an array of calendar events, which are defined by another schema
 *  (specifically the one [here](https://json-schema.org/learn/examples/calendar.schema.json)).
 * This schema references
 * [yet another schema](https://json-schema.org/learn/examples/geographical-location.schema.json)
 * for a geographic location. Both of these schemas are added to the validator (in this case tv4)
 * before it is given to the Treema React component. Then Treema is able to validate the data,
 * in this case the invalid latitude data, even through two references.
 */
export const Refs = {
  args: {
    data: [
      {
        'dtstart': '2021-01-01T00:00:00Z',
        'summary': "New Year's Day",
        'geo': {
          'latitude': 9000,
          'longitude': 74.006,
        },
      },
    ],
    schema: {
      'type': 'array',
      'items': {
        '$ref': 'https://example.com/calendar.schema.json',
      },
    },
    schemaLib: wrapTv4(tv4),
  },
};

/**
 * Treema supports `properties`, `patternProperties`, and `additionalProperties`, taking into
 * account precedence.
 */
export const Properties = {
  args: {
    data: {
      'asdf': 'explicitly defined value',
      'abc': 'lower case value',
      'ABC': 'upper case value',
      'foo1': 'additional value',
    },
    schema: {
      'type': 'object',
      'properties': {
        'asdf': { 'type': 'string', 'title': 'Explicitly Defined Property' },
      },
      'patternProperties': {
        '^[a-z]+$': { 'type': 'string', 'title': 'Lower Case Regex' },
        '^[A-Z]+$': { 'type': 'string', 'title': 'Upper Case Regex' },
      },
      'additionalProperties': { 'type': 'string', title: 'Additional Property' },
    },
  },
};

/**
 * Treema supports `items` and `additionalItems`.
 */
export const ItemsAndAdditionalItems = {
  args: {
    data: [1, 2, 3, 4, 5],
    schema: {
      'type': 'array',
      'items': [
        { 'type': 'number', 'title': 'First Item' },
        { 'type': 'number', 'title': 'Second Item' },
      ],
      'additionalItems': { 'type': 'number', 'title': 'Additional Item' },
    },
  },
};

/**
 * Treema fills in default values, but leaves them unset in data unless explicitly set, or required.
 */
export const DefaultValues = {
  args: {
    data: {
      explicitlySetValue: 'explicitly set value',
      deepDefaultValue: {
        setString: 'string',
      },
    },
    schema: {
      'type': 'object',
      default: {
        'default': 'default value',
        'deepDefaultValue': {
          'setString': 'default string',
          'setNumber': 123,
          'setArray': [1, 2, 3],
        },
      },
    },
  },
};

/**
 * Treema automatically fills required values, either for data passed in or as it is entered.
 */
export const RequiredValues = {
  args: {
    data: {},
    schema: {
      'type': 'object',
      'additionalProperties': false,
      'properties': {
        'string': { type: 'string' },
        'number': { type: 'number' },
        'null': { type: 'null' },
        'boolean': { type: 'boolean' },
        'array': { type: 'array', items: { type: 'number', default: 42 } },
        'object': { type: 'object' },
        'integer': { type: 'integer' },
        'def': { 'default': 1337 },
      },
      'required': ['integer', 'string', 'number', 'null', 'boolean', 'array', 'object', 'def'],
    },
  },
};

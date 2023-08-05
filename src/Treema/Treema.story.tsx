import { TreemaRoot } from './index';
import tv4 from 'tv4';
import { wrapTv4 } from './utils';
import Ajv from 'ajv';
import { wrapAjv } from './utils';
import { TreemaPoint2dNodeDefinition } from './definitions/point2d';
import { TreemaLongStringNodeDefinition } from './definitions/long-string';
import { TreemaMarkdownNodeDefinition } from './definitions/markdown';

export default {
  title: 'Main/TreemaRoot',
  component: TreemaRoot,
  tags: ['autodocs'],
};

/**
 * This Treema shows a relatively simple data structure: an array of objects with values that are
 * all primitive data types. You can try creating a new object, editing the values, and deleting
 * entries or values.
 *
 * Navigate quickly and easily by keyboard. Try using arrow keys, enter,
 * tab, and escape. Use shift to reverse direction. When entering a new property, press arrow-down
 * to use the native browser autocomplete for available properties.
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
      },
    ],
    schema: {
      'title': 'Address Book',
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
 * Schemas are highly flexible, including allowing properties to be of various types. In this example, the "numbers"
 * property can either by an array or string. Treema provides a `select` box in this case, allowing switching between
 * those two types.
 */
export const TypeSelector = {
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
  'title': 'Data w/Lots of Errors',
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
 * maintained, but it is an example of how Treema can support a wide variety of validators. The original
 * Treema library was tightly coupled to tv4, but not this one!
 */
export const Tv4Validator = {
  args: {
    data: badData,
    schema: badSchema,
    schemaLib: wrapTv4(tv4),
  },
};

/**
 * Ajv is a JSON Schema validator that supports various drafs of the spec, including the most recent (2020-12).
 * It is a popular validator (as of 2023), and shows how different validators might cause Treema to act differently.
 * For example, Ajv when reporting an "additionalProperties" error, will target the object with the offending
 * property, while Tv4 will target the property itself. They also clearly have different error messages.
 */
export const AjvValidator = {
  args: {
    data: badData,
    schema: badSchema,
    schemaLib: wrapAjv(new Ajv({ allErrors: true })),
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
      'title': 'Calendar Events with Locations',
      'type': 'array',
      'items': {
        '$ref': 'https://example.com/calendar.schema.json',
      },
    },
    schemaLib: wrapTv4(tv4),
  },
};

/**
 * Treema has an internal concept of "Working Schemas". Basically if you have a complex schema (uses combinatorial applicators like
 * `oneOf` or `anyOf`, or has more than one possible `type`), Treema will generate a set of "working schemas" for the user to
 * choose from, and based on the selection will show the correct errors (ignoring errors from other options).
 *
 * In this example, an object can either be of "type a" or "type b", but the data fits neither schema. The user can switch between
 * the two and see how the data doesn't fit with either and then fix the data in whichever direction.
 *
 * Treema will also attempt to smartly merge schemas together, for example the schema with its oneOf, or every allOf together.
 * It will tend to simply override one property with another, except for properties which it will recursively merge. You can
 * see the recursive merging here where the title for "type" is provided in the base schema but shows up for each working
 * schema. It will also concat `required` lists together, which you can see by trying to delete any of the defined properties.
 *
 * You should each `oneOf` and `anyOf` schema a distinct `title` to make it easier for the user to understand what they are choosing between.
 */
export const WorkingSchemas = {
  args: {
    data: {
      example: {
        type: 'a',
        foo: 'bar',
      },
    },
    schema: {
      title: 'Object with Example Property of Type A or B',
      type: 'object',
      properties: {
        example: {
          type: 'object',

          properties: {
            type: { title: 'Inherited Type Title' },
          },
          required: ['type'],

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
    schemaLib: wrapAjv(new Ajv({ allErrors: true })),
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
      'title': 'Object with Properties, PatternProperties, and AdditionalProperties Schemas',
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
      'title': 'Array with Items and AdditionalItems Schemas',
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
      'title': 'Object with Complex Default Values',
      default: {
        'default': 'default value',
        'deepDefaultValue': {
          'setString': 'default string',
          'setNumber': 123,
          'setArray': [1, 2, 3],
        },
        'recurseDefault': {},
      },
      'properties': {
        'default': { 'type': 'string' },
        'explicitlySetValue': { 'type': 'string' },
        'deepDefaultValue': {
          'type': 'object',
          'properties': {
            'setString': { 'type': 'string' },
            'setNumber': { 'type': 'number' },
            'setArray': { 'type': 'array', 'items': { 'type': 'number' } },
          },
        },
        'recurseDefault': {
          'type': 'object',
          default: {
            'deepRecurse': 'recursive default value',
          },
          properties: {
            'deepRecurse': { 'type': 'string' },
          },
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
      'title': 'Object with Required Values of All Basic Types',
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

/**
 * Schema `format` values will often use the equivalent browser input type. The following example includes
 * all supported string input types. Support may vary based on browser.
 *
 * See the [MDN docs](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#input_types) for more information.
 * 
 * Note that fields with format set to `"hidden"` will not be visible. There is a hidden field in this example.
 */
export const StringInputTypes = {
  args: {
    data: {
      'color': '#ff0000',
      'date': '2021-01-01',
      'datetime-local': '2021-01-01T00:00:00',
      'email': 'test@example.com',
      'password': 'password',
      'tel': '1234567890',
      'text': 'text',
      'time': '00:00:00',
      'url': 'https://example.com',
      'hidden': 'you cannot see me',
    },
    schema: {
      'type': 'object',
      'title': 'Object with All String Input Types',
      'properties': {
        'color': { 'type': 'string', 'format': 'color' },
        'date': { 'type': 'string', 'format': 'date' },
        'datetime-local': { 'type': 'string', 'format': 'datetime-local' },
        'email': { 'type': 'string', 'format': 'email' },
        'password': { 'type': 'string', 'format': 'password' },
        'tel': { 'type': 'string', 'format': 'tel' },
        'text': { 'type': 'string', 'format': 'text' },
        'time': { 'type': 'string', 'format': 'time' },
        'url': { 'type': 'string', 'format': 'url' },
        'hidden': { type: 'string', 'format': 'hidden' },
      },
    },
  },
};

/**
 * In some cases, Treema will fill `<input>` attribute fields. Currently the following are supported:
 * * For strings, schema values for `maxLength` and `minLength` are set as `maxlength` and `minlength` input attributes.
 * * For numbers, schema values for `minimum` and `maximum` are set to `min` and `max` input attributes.
 *
 * See the [MDN docs](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attributes) for more information.
 *
 * TODO: Add support for more input attributes.
 */
export const InputAttributes = {
  args: {
    data: {
      max10: 9,
      maxLength10: '1234567890',
      min10: 11,
      minLength10: '12345678901',
    },
    schema: {
      'type': 'object',
      'title': 'Object with All Kinds of Input Attributes',
      'properties': {
        'max10': { 'type': 'number', 'maximum': 10 },
        'maxLength10': { 'type': 'string', 'maxLength': 10 },
        'min10': { 'type': 'number', 'minimum': 10 },
        'minLength10': { 'type': 'string', 'minLength': 10 },
      },
    },
  },
};

/**
 * See [TreemaTypeDefinition](https://github.com/sderickson/react-treema/blob/4923128ed24089d8677b11608cbe9afbfde1c51b/src/Treema/types.ts#L319)
 * for how to define your own custom node types, extending beyond the basic types like strings and numbers. The following example
 * has a long string use a `textarea`, a 2d point object with a custom display, and markdown with an ace editor and rendered display.
 */
export const CustomNodes = {
  args: {
    data: {
      point2d: { x: 50, y: 80 },
      longString:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      markdown: `## Markdown document
      *hello world!*`,
    },
    schema: {
      'type': 'object',
      'title': 'Object with a Couple Custom Node Types',
      'properties': {
        'point2d': { $ref: TreemaPoint2dNodeDefinition.schema?.$id },
        'longString': { $ref: TreemaLongStringNodeDefinition.schema?.$id },
        'markdown': { $ref: TreemaMarkdownNodeDefinition.schema?.$id },
      },
    },
    definitions: [TreemaPoint2dNodeDefinition, TreemaLongStringNodeDefinition, TreemaMarkdownNodeDefinition],
  },
};

/**
 * If no schema is provided, essentially Treema acts as a free-form JSON data editor.
 *
 * TODO: combine this with a view of the raw JSON.
 */
export const UnspecifiedJson = {
  args: {
    data: {
      'a': {
        'b': {},
      },
    },
    schema: {},
  },
};

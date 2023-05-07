import { TreemaRoot } from './TreemaRoot';

export default {
  title: 'TreemaRoot',
  component: TreemaRoot,
};

export const Addresses = {
  args: {
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
}
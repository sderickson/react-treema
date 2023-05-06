import { TreemaNode } from './TreemaNode';

export default {
  title: 'TreemaNode',
  component: TreemaNode,
};

export const Default = {
  args: {
    data: [
      {
        "street-address": "10 Downing Street",
        "country-name": "UK",
        "locality": "London",
        "name": "Prime Minister"
      },
      {
        "street-address": "1600 Amphitheatre Pkwy",
        "phone-number": "(650) 253-0000",
        "name": "Google"
      },
      {
        "street-address": "45 Rockefeller Plaza",
        "region": "NY",
        "locality": "New York",
        "name": "Rockefeller Center"
      }
    ],
    schema: {
      "type": "array",
      "items": {
        "additionalProperties": false,
        "type": "object",
        "displayProperty": "name",
        "properties": {
          "name": {
            "type": "string",
            "maxLength": 20
          },
          "street-address": {
            "title": "Address 1",
            "description": "Don't forget the number.",
            "type": "string"
          },
          "locality": {
            "type": "string",
            "title": "Locality"
          },
          "region": {
            "title": "Region",
            "type": "string"
          },
          "country-name": {
            "type": "string",
            "title": "Country"
          },
          "friend": {
            "type": "boolean",
            "title": "Friend"
          },
          "phone-number": {
            "type": "string",
            "maxLength": 20,
            "minLength": 4,
            "title": "Phone Number"
          }
        }
      }
    },
  },
};

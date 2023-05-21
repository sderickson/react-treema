import { TreemaState } from "./state";
import { getAllDatasAndSchemas, getListOfPaths } from "./state";
import { noopLib } from "./utils";

describe('getAllDatasAndSchemas', () => {
  it('includes default data information', () => {
    const state: TreemaState = {
      data: {
        explicitlySetValue: "explicitly set value",
        deepDefaultValue: {
          setString: 'string',
        }
      },
      rootSchema: {
        "type": "object",
        default: {
          "default": "default value",
          "deepDefaultValue": {
            "setString": "default string",
            "setNumber": 123,
            "setArray": [1, 2, 3],
          }
        }
      },
      schemaLib: noopLib,
      closed: {},
    };
    const result = getAllDatasAndSchemas(state);

    // "default" should be included, and is the root of a set of default data
    expect(result['/default']).toBeTruthy();
    expect(result['/default'].data).toEqual("default value");
    expect(result['/default'].defaultRoot).toEqual(true);

    // Even though "deepDafaultValue" is set one level up, it should be included
    expect(result['/deepDefaultValue/setNumber']).toBeTruthy();
    expect(result['/deepDefaultValue/setNumber'].data).toEqual(123);
    expect(result['/deepDefaultValue/setNumber'].defaultRoot).toEqual(true);

    // Numbers within "setArray" should have "defaultRoot" be false, though, since "setArray" is their defaultRoot
    expect(result['/deepDefaultValue/setArray/0']).toBeTruthy();
    expect(result['/deepDefaultValue/setArray/0'].data).toEqual(1);
    expect(result['/deepDefaultValue/setArray/0'].defaultRoot).toEqual(false);
  });
});

describe('getListOfPaths', () => {
  it('properly orders', () => {
    const state: TreemaState = {
      data: {
        explicitlySetValue: "explicitly set value",
        deepDefaultValue: {
          setString: 'string',
        }
      },
      rootSchema: {
        "type": "object",
        default: {
          "default": "default value",
          "deepDefaultValue": {
            "setString": "default string",
            "setNumber": 123,
            "setArray": [1, 2, 3],
          }
        }
      },
      schemaLib: noopLib,
      closed: {},
    };
    const result = getListOfPaths(state);
    expect(result).toEqual([
      '',
      '/explicitlySetValue',
      '/deepDefaultValue',
      '/deepDefaultValue/setString',
      '/deepDefaultValue/setNumber',
      '/deepDefaultValue/setArray',
      '/deepDefaultValue/setArray/0',
      '/deepDefaultValue/setArray/1',
      '/deepDefaultValue/setArray/2',
      '/default'
    ]);
  });
});

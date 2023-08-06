[react-treema](README.md) / Exports

# react-treema

## Table of contents

### Interfaces

- [TreemaChangeDataEvent](interfaces/TreemaChangeDataEvent.md)
- [TreemaChangeSelectEvent](interfaces/TreemaChangeSelectEvent.md)
- [TreemaCloneOptions](interfaces/TreemaCloneOptions.md)
- [TreemaDisplayProps](interfaces/TreemaDisplayProps.md)
- [TreemaEditProps](interfaces/TreemaEditProps.md)
- [TreemaNodeContext](interfaces/TreemaNodeContext.md)
- [TreemaRootProps](interfaces/TreemaRootProps.md)
- [TreemaSupportedJsonSchema](interfaces/TreemaSupportedJsonSchema.md)
- [TreemaTypeDefinition](interfaces/TreemaTypeDefinition.md)
- [TreemaValidatorError](interfaces/TreemaValidatorError.md)
- [TreemaValidatorResponse](interfaces/TreemaValidatorResponse.md)
- [TreemaWrappedSchemaLib](interfaces/TreemaWrappedSchemaLib.md)

### Type Aliases

- [JsonPointer](modules.md#jsonpointer)
- [SchemaBaseType](modules.md#schemabasetype)
- [TreemaEvent](modules.md#treemaevent)
- [TreemaEventHandler](modules.md#treemaeventhandler)
- [TreemaFilter](modules.md#treemafilter)
- [TreemaFilterFunction](modules.md#treemafilterfunction)
- [TreemaNodeEventCallbackHandler](modules.md#treemanodeeventcallbackhandler)
- [TreemaValidator](modules.md#treemavalidator)
- [TreemaWorkingSchema](modules.md#treemaworkingschema)

### Functions

- [TreemaRoot](modules.md#treemaroot)
- [buildWorkingSchemas](modules.md#buildworkingschemas)
- [chooseWorkingSchema](modules.md#chooseworkingschema)
- [clone](modules.md#clone)
- [combineSchemas](modules.md#combineschemas)
- [defaultForType](modules.md#defaultfortype)
- [getChildSchema](modules.md#getchildschema)
- [populateRequireds](modules.md#populaterequireds)
- [useTreemaEditRef](modules.md#usetreemaeditref)
- [useTreemaKeyboardEvent](modules.md#usetreemakeyboardevent)
- [walk](modules.md#walk)

## Type Aliases

### JsonPointer

Ƭ **JsonPointer**: `string`

JsonPointers. See [RFC 6901](https://datatracker.ietf.org/doc/html/rfc6901).
These are used by Treema, and also typically by validator libraries such
as Ajv and Tv4.

#### Defined in

[src/Treema/types.ts:89](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L89)

___

### SchemaBaseType

Ƭ **SchemaBaseType**: ``"null"`` \| ``"boolean"`` \| ``"object"`` \| ``"array"`` \| ``"number"`` \| ``"string"`` \| ``"integer"``

The list of valid JSON Schema types.

#### Defined in

[src/Treema/types.ts:191](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L191)

___

### TreemaEvent

Ƭ **TreemaEvent**: [`TreemaChangeSelectEvent`](interfaces/TreemaChangeSelectEvent.md) \| [`TreemaChangeDataEvent`](interfaces/TreemaChangeDataEvent.md)

Comprehensive list of events emitted by Treema.

#### Defined in

[src/Treema/types.ts:108](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L108)

___

### TreemaEventHandler

Ƭ **TreemaEventHandler**: (`event`: [`TreemaEvent`](modules.md#treemaevent)) => `void`

#### Type declaration

▸ (`event`): `void`

Callback handler for Treema events.

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`TreemaEvent`](modules.md#treemaevent) |

##### Returns

`void`

#### Defined in

[src/Treema/types.ts:103](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L103)

___

### TreemaFilter

Ƭ **TreemaFilter**: `string` \| `RegExp` \| [`TreemaFilterFunction`](modules.md#treemafilterfunction)

#### Defined in

[src/Treema/types.ts:82](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L82)

___

### TreemaFilterFunction

Ƭ **TreemaFilterFunction**: (`context`: [`TreemaNodeContext`](interfaces/TreemaNodeContext.md)) => `boolean`

#### Type declaration

▸ (`context`): `boolean`

Determine for each node, given its path, data, and schema, whether it should be visible.

##### Parameters

| Name | Type |
| :------ | :------ |
| `context` | [`TreemaNodeContext`](interfaces/TreemaNodeContext.md) |

##### Returns

`boolean`

#### Defined in

[src/Treema/types.ts:80](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L80)

___

### TreemaNodeEventCallbackHandler

Ƭ **TreemaNodeEventCallbackHandler**: (`event`: `KeyboardEvent`) => `boolean`

#### Type declaration

▸ (`event`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `KeyboardEvent` |

##### Returns

`boolean`

#### Defined in

[src/Treema/types.ts:390](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L390)

___

### TreemaValidator

Ƭ **TreemaValidator**: (`data`: `any`, `schema`: [`TreemaSupportedJsonSchema`](interfaces/TreemaSupportedJsonSchema.md)) => [`TreemaValidatorResponse`](interfaces/TreemaValidatorResponse.md)

#### Type declaration

▸ (`data`, `schema`): [`TreemaValidatorResponse`](interfaces/TreemaValidatorResponse.md)

##### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `any` |
| `schema` | [`TreemaSupportedJsonSchema`](interfaces/TreemaSupportedJsonSchema.md) |

##### Returns

[`TreemaValidatorResponse`](interfaces/TreemaValidatorResponse.md)

#### Defined in

[src/Treema/types.ts:156](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L156)

___

### TreemaWorkingSchema

Ƭ **TreemaWorkingSchema**: `Omit`<[`TreemaSupportedJsonSchema`](interfaces/TreemaSupportedJsonSchema.md), ``"$ref"`` \| ``"allOf"`` \| ``"anyOf"`` \| ``"oneOf"``\> & { `type`: [`SchemaBaseType`](modules.md#schemabasetype)  }

Working schemas are internally used in Treema to simplify logic and make sense of
more complex JSON Schema keywords. For example, resolving which of the oneOf schemas,
or getting a schema referenced by $ref, can be done once and logic can then focus on
enforcing the more straightforward schema keywords.

This also is reflected to the user when choosing what form a given piece of data
should take. If a value could be an array or an object, then these are two "working
schemas" the user can choose from, and in so choosing, updates the data.

Working schemas:
- Always have a single type.
- Do not have oneOf, anyOf, or allOf.
- Have all $refs resolved.

In the future, they should also resolve if/then/else, dependentSchemas.

Note that working schemas do *not* contain other working schemas. It is expected if you
are considering a child value, you will get the working schema for it as needed separately.

#### Defined in

[src/Treema/types.ts:313](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L313)

## Functions

### TreemaRoot

▸ **TreemaRoot**(`props`, `context?`): ``null`` \| `ReactElement`<`any`, `any`\>

The main entrypoint for any Treema rendered on your site. Provide data and a schema and this component
will render that data, and enable edits, according to that schema. You can and probably should also
provide a JSON Schema validator library which will thoroughly enforce the schema and provide error messages.

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`TreemaRootProps`](interfaces/TreemaRootProps.md) |
| `context?` | `any` |

#### Returns

``null`` \| `ReactElement`<`any`, `any`\>

#### Defined in

node_modules/@types/react/ts5.0/index.d.ts:499

___

### buildWorkingSchemas

▸ **buildWorkingSchemas**(`schema`, `lib`): [`TreemaWorkingSchema`](modules.md#treemaworkingschema)[]

Create a list of "working schemas" from a given schema. See TreemaWorkingSchema for more info.

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | [`TreemaSupportedJsonSchema`](interfaces/TreemaSupportedJsonSchema.md) |
| `lib` | [`TreemaWrappedSchemaLib`](interfaces/TreemaWrappedSchemaLib.md) |

#### Returns

[`TreemaWorkingSchema`](modules.md#treemaworkingschema)[]

array of working schemas

#### Defined in

[src/Treema/utils.ts:195](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/utils.ts#L195)

___

### chooseWorkingSchema

▸ **chooseWorkingSchema**(`data`, `workingSchemas`, `lib`): [`TreemaWorkingSchema`](modules.md#treemaworkingschema)

Returns the first working schema that the data is valid for. Otherwise, returns the one with
the fewest errors.

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `any` |
| `workingSchemas` | [`TreemaWorkingSchema`](modules.md#treemaworkingschema)[] |
| `lib` | [`TreemaWrappedSchemaLib`](interfaces/TreemaWrappedSchemaLib.md) |

#### Returns

[`TreemaWorkingSchema`](modules.md#treemaworkingschema)

best guess which working schema the data is intended for

#### Defined in

[src/Treema/utils.ts:272](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/utils.ts#L272)

___

### clone

▸ **clone**(`data`, `options?`): `any`

Creates a deep clone of data, unless shallow is true, in which case it only clones the top level.

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `any` |
| `options?` | [`TreemaCloneOptions`](interfaces/TreemaCloneOptions.md) |

#### Returns

`any`

#### Defined in

[src/Treema/utils.ts:410](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/utils.ts#L410)

___

### combineSchemas

▸ **combineSchemas**(`baseSchema`, `schema`): [`TreemaSupportedJsonSchema`](interfaces/TreemaSupportedJsonSchema.md)

Combines two schemas, with the second schema overriding the first.

Currently only "properties" and "required" are combined, rather than overriding. There are use cases for
these (see `inlineInteraction` in `CodeCombat.story.tsx`). If there are other use cases for other keywords,
the logic can be extended here.

#### Parameters

| Name | Type |
| :------ | :------ |
| `baseSchema` | [`TreemaSupportedJsonSchema`](interfaces/TreemaSupportedJsonSchema.md) |
| `schema` | [`TreemaSupportedJsonSchema`](interfaces/TreemaSupportedJsonSchema.md) |

#### Returns

[`TreemaSupportedJsonSchema`](interfaces/TreemaSupportedJsonSchema.md)

#### Defined in

[src/Treema/utils.ts:373](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/utils.ts#L373)

___

### defaultForType

▸ **defaultForType**(`type`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`SchemaBaseType`](modules.md#schemabasetype) |

#### Returns

`any`

#### Defined in

[src/Treema/utils.ts:433](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/utils.ts#L433)

___

### getChildSchema

▸ **getChildSchema**(`key`, `schema`): [`TreemaSupportedJsonSchema`](interfaces/TreemaSupportedJsonSchema.md)

Given a key and a schema, returns the schema for the child at that key, based on keywords like
properties and items.

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` \| `number` |
| `schema` | [`TreemaSupportedJsonSchema`](interfaces/TreemaSupportedJsonSchema.md) |

#### Returns

[`TreemaSupportedJsonSchema`](interfaces/TreemaSupportedJsonSchema.md)

the raw schema

#### Defined in

[src/Treema/utils.ts:301](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/utils.ts#L301)

___

### populateRequireds

▸ **populateRequireds**(`givenData`, `schema`, `lib`): `any`

Given a schema and data, populates any required properties in the data with default values. Also
takes in a TreemaWrappedSchemaLib, which is used to dereference $ref and determine which working
schema to use.

#### Parameters

| Name | Type |
| :------ | :------ |
| `givenData` | `any` |
| `schema` | [`TreemaSupportedJsonSchema`](interfaces/TreemaSupportedJsonSchema.md) |
| `lib` | [`TreemaWrappedSchemaLib`](interfaces/TreemaWrappedSchemaLib.md) |

#### Returns

`any`

a new version of givenData with required values included

#### Defined in

[src/Treema/utils.ts:461](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/utils.ts#L461)

___

### useTreemaEditRef

▸ **useTreemaEditRef**(): `MutableRefObject`<``null``\>

Provides a ref which should be used for the input element rendered. This is so
that Treema can manage focus and blur events.

Currently Treema only supports one input per "node".

#### Returns

`MutableRefObject`<``null``\>

#### Defined in

[src/Treema/definitions/hooks.tsx:35](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/definitions/hooks.tsx#L35)

___

### useTreemaKeyboardEvent

▸ **useTreemaKeyboardEvent**(`callback`): `void`

Use this in `edit` for definitions to register a callback for keyboard events.
Return `false` to prevent Treema's default handling of that event. This is useful
for example to cancel moving to the next node, such as when editing multiple
lines where tab and enter are normally used. This can also be used to implement
custom errors where navigation is prevented until an error is fixed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`TreemaNodeEventCallbackHandler`](modules.md#treemanodeeventcallbackhandler) |

#### Returns

`void`

#### Defined in

[src/Treema/definitions/hooks.tsx:13](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/definitions/hooks.tsx#L13)

___

### walk

▸ **walk**(`data`, `schema`, `lib`, `callback`, `path?`): `any`

Walks the provided JSON data and, for each path within the data, calls the provided callback with schema info.
The callback for each path in the data with an object that includes:
* path: the JSON pointer of the data
* data: the data at that path
* schema: the default working schema for that path (see docs on Working Schemas)
* possibleSchemas: an array of all possible working schemas for that path

The callback may return one of the possibleSchemas to override the provided default. If the callback does this,
that will affect further steps in the walking process. For example if an object could be `oneOf` an array of
schemas, with different properties and names for them, callbacks for those properties will provide different
schema and possibleSchemas values.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | `any` | The JSON data to walk. |
| `schema` | [`TreemaSupportedJsonSchema`](interfaces/TreemaSupportedJsonSchema.md) | The schema for the whole data. |
| `lib` | [`TreemaWrappedSchemaLib`](interfaces/TreemaWrappedSchemaLib.md) | Validator which can be used to dereference $ref. |
| `callback` | (`context`: [`TreemaNodeContext`](interfaces/TreemaNodeContext.md)) => `void` \| [`TreemaWorkingSchema`](modules.md#treemaworkingschema) | A function which will be called for each path in the data. |
| `path?` | `string` | Optional. The JSON pointer "to" the data provided. All callbacked paths will be prepended with this. |

#### Returns

`any`

#### Defined in

[src/Treema/utils.ts:114](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/utils.ts#L114)

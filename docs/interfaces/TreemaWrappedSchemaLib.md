[react-treema](../README.md) / [Exports](../modules.md) / TreemaWrappedSchemaLib

# Interface: TreemaWrappedSchemaLib

So that Treema is not tied to any specific validator library, it expects
any validator to be wrapped in this generic interface. The validator library
is not only used to validate data, but as a store for schemas.

Treema exports two example and workable wrapping functions: wrapAjv and wrapTv4.

## Table of contents

### Properties

- [addSchema](TreemaWrappedSchemaLib.md#addschema)
- [getSchemaRef](TreemaWrappedSchemaLib.md#getschemaref)
- [validateMultiple](TreemaWrappedSchemaLib.md#validatemultiple)

## Properties

### addSchema

• **addSchema**: (`schema`: `object`, `id`: `string`) => `void`

#### Type declaration

▸ (`schema`, `id`): `void`

Populates the schema library with a schema.

##### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | `object` |
| `id` | `string` |

##### Returns

`void`

#### Defined in

[src/Treema/types.ts:153](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L153)

___

### getSchemaRef

• **getSchemaRef**: (`ref`: `string`) => [`TreemaSupportedJsonSchema`](TreemaSupportedJsonSchema.md)

#### Type declaration

▸ (`ref`): [`TreemaSupportedJsonSchema`](TreemaSupportedJsonSchema.md)

Looks up a reference string and returns the schema it refers to.

##### Parameters

| Name | Type |
| :------ | :------ |
| `ref` | `string` |

##### Returns

[`TreemaSupportedJsonSchema`](TreemaSupportedJsonSchema.md)

#### Defined in

[src/Treema/types.ts:149](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L149)

___

### validateMultiple

• **validateMultiple**: [`TreemaValidator`](../modules.md#treemavalidator)

Used to validate arbitrary data/schema combinations. Schema may be a
reference schema.

#### Defined in

[src/Treema/types.ts:145](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L145)

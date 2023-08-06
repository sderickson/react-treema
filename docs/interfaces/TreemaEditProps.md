[react-treema](../README.md) / [Exports](../modules.md) / TreemaEditProps

# Interface: TreemaEditProps

## Table of contents

### Properties

- [data](TreemaEditProps.md#data)
- [onChange](TreemaEditProps.md#onchange)
- [schema](TreemaEditProps.md#schema)

## Properties

### data

• **data**: `any`

#### Defined in

[src/Treema/types.ts:374](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L374)

___

### onChange

• **onChange**: (`data`: `any`) => `void`

#### Type declaration

▸ (`data`): `void`

The edit component manages taking whatever input values there are and converting
them into the appropriate data type, then calling onChange with the new value.

##### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `any` |

##### Returns

`void`

#### Defined in

[src/Treema/types.ts:383](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L383)

___

### schema

• **schema**: [`TreemaWorkingSchema`](../modules.md#treemaworkingschema)

See WorkingSchema type for more information about these.

#### Defined in

[src/Treema/types.ts:378](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L378)

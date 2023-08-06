[react-treema](../README.md) / [Exports](../modules.md) / TreemaValidatorError

# Interface: TreemaValidatorError

## Table of contents

### Properties

- [dataPath](TreemaValidatorError.md#datapath)
- [id](TreemaValidatorError.md#id)
- [message](TreemaValidatorError.md#message)

## Properties

### dataPath

• **dataPath**: `string`

The path to the data that caused the error. This is a JsonPointer. Validator
libraries may differ in what they consider to be the correct path, for example
if `additionalProperties` is `false` and one exists, the object or the
additional property may be pointed to.

#### Defined in

[src/Treema/types.ts:185](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L185)

___

### id

• **id**: `string` \| `number`

Validator libraries typically categorize validation errors by an id, either a
string or number. Expose this in the error so it can be used if desired (e.g.
with utility functions).

#### Defined in

[src/Treema/types.ts:173](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L173)

___

### message

• **message**: `string`

Human-readable message describing the error. The library is responsible for
any localization.

#### Defined in

[src/Treema/types.ts:178](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L178)

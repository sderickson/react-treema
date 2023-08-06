[react-treema](../README.md) / [Exports](../modules.md) / TreemaChangeDataEvent

# Interface: TreemaChangeDataEvent

Whenever the user edits the data, this event is emitted. If data is an
array or object, it will be a new instance; Treema does not mutate the
given data. It *will* however reference as much of the previous data
structure as it can. This data should be not be mutated, and should be
given back to Treema in the "data" prop if Treema is not being used as
the "source of truth".

## Table of contents

### Properties

- [data](TreemaChangeDataEvent.md#data)
- [type](TreemaChangeDataEvent.md#type)

## Properties

### data

• **data**: `any`

#### Defined in

[src/Treema/types.ts:130](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L130)

___

### type

• **type**: ``"change_data_event"``

#### Defined in

[src/Treema/types.ts:129](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L129)

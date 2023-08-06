[react-treema](../README.md) / [Exports](../modules.md) / TreemaTypeDefinition

# Interface: TreemaTypeDefinition

Treema may have its functionality extended with custom TypeDefinitions. A TypeDefinition
specifies how data of a certain `format` or `type` should be displayed and edited. See
`/definitions` directory for plenty of examples and core uses (all basic types are defined
with this interface).

## Table of contents

### Properties

- [Display](TreemaTypeDefinition.md#display)
- [Edit](TreemaTypeDefinition.md#edit)
- [id](TreemaTypeDefinition.md#id)
- [schema](TreemaTypeDefinition.md#schema)
- [shortened](TreemaTypeDefinition.md#shortened)

## Properties

### Display

• **Display**: `FC`<[`TreemaDisplayProps`](TreemaDisplayProps.md)\>

Renders the data value as a viewable React component. May also be used to render
the value as part of the containing node.

#### Defined in

[src/Treema/types.ts:348](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L348)

___

### Edit

• `Optional` **Edit**: `FC`<[`TreemaEditProps`](TreemaEditProps.md)\>

Renders the data value as an editable React component. The component *must* use
`useTreemaEditRef` and provide that as a ref to the input element. This is so that
Treema can manage keyboard navigation and focus. Edit elements may also use
`useTreemaKeyboardEvent` to override Treema's default keyboard behavior.

#### Defined in

[src/Treema/types.ts:356](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L356)

___

### id

• **id**: `string`

The `format` or `type` this definition applies to. Also the div surrounding the display
and edit components will have a classname of the form `treema-${id}` which can be used
to target css rules for those nodes.

#### Defined in

[src/Treema/types.ts:334](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L334)

___

### schema

• `Optional` **schema**: [`TreemaSupportedJsonSchema`](TreemaSupportedJsonSchema.md)

A schema to associate with this definition. If provided, this definition will be used
for data with this schema. Schemas in definitions must have an $id. The schema
provided to TreemaRoot can contain $refs to the $id of this schema; Treema will automatically
call `addSchema` on the schema library with schemas in definitions.

#### Defined in

[src/Treema/types.ts:342](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L342)

___

### shortened

• `Optional` **shortened**: `boolean`

If true, the display value will be truncated to a single line.

#### Defined in

[src/Treema/types.ts:361](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L361)

[react-treema](../README.md) / [Exports](../modules.md) / TreemaSupportedJsonSchema

# Interface: TreemaSupportedJsonSchema

Typing for supported JSON Schema keywords. Properties listed here will be used to create
the Treema interface. Of course, anything not listed can still be used as part of validation.

## Indexable

▪ [x: `string`]: `any`

## Table of contents

### Properties

- [$ref](TreemaSupportedJsonSchema.md#$ref)
- [additionalItems](TreemaSupportedJsonSchema.md#additionalitems)
- [additionalProperties](TreemaSupportedJsonSchema.md#additionalproperties)
- [allOf](TreemaSupportedJsonSchema.md#allof)
- [anyOf](TreemaSupportedJsonSchema.md#anyof)
- [default](TreemaSupportedJsonSchema.md#default)
- [displayProperty](TreemaSupportedJsonSchema.md#displayproperty)
- [enum](TreemaSupportedJsonSchema.md#enum)
- [format](TreemaSupportedJsonSchema.md#format)
- [items](TreemaSupportedJsonSchema.md#items)
- [maxItems](TreemaSupportedJsonSchema.md#maxitems)
- [maxLength](TreemaSupportedJsonSchema.md#maxlength)
- [maximum](TreemaSupportedJsonSchema.md#maximum)
- [minLength](TreemaSupportedJsonSchema.md#minlength)
- [minimum](TreemaSupportedJsonSchema.md#minimum)
- [oneOf](TreemaSupportedJsonSchema.md#oneof)
- [patternProperties](TreemaSupportedJsonSchema.md#patternproperties)
- [properties](TreemaSupportedJsonSchema.md#properties)
- [readOnly](TreemaSupportedJsonSchema.md#readonly)
- [required](TreemaSupportedJsonSchema.md#required)
- [title](TreemaSupportedJsonSchema.md#title)
- [type](TreemaSupportedJsonSchema.md#type)

## Properties

### $ref

• `Optional` **$ref**: `string`

The given validator library will be used to dereference `$ref` strings.

#### Defined in

[src/Treema/types.ts:236](https://github.com/sderickson/react-treema/blob/3868d5e/src/Treema/types.ts#L236)

___

### additionalItems

• `Optional` **additionalItems**: [`TreemaSupportedJsonSchema`](TreemaSupportedJsonSchema.md)

#### Defined in

[src/Treema/types.ts:216](https://github.com/sderickson/react-treema/blob/3868d5e/src/Treema/types.ts#L216)

___

### additionalProperties

• `Optional` **additionalProperties**: `boolean` \| [`TreemaSupportedJsonSchema`](TreemaSupportedJsonSchema.md)

#### Defined in

[src/Treema/types.ts:219](https://github.com/sderickson/react-treema/blob/3868d5e/src/Treema/types.ts#L219)

___

### allOf

• `Optional` **allOf**: [`TreemaSupportedJsonSchema`](TreemaSupportedJsonSchema.md)[]

Treema will combine `allOf` schemas into the "root" schema to form a single working schema.

#### Defined in

[src/Treema/types.ts:241](https://github.com/sderickson/react-treema/blob/3868d5e/src/Treema/types.ts#L241)

___

### anyOf

• `Optional` **anyOf**: [`TreemaSupportedJsonSchema`](TreemaSupportedJsonSchema.md)[]

#### Defined in

[src/Treema/types.ts:248](https://github.com/sderickson/react-treema/blob/3868d5e/src/Treema/types.ts#L248)

___

### default

• `Optional` **default**: `any`

Treema will display default values semi-transparently. If the user changes the value,
it will become part of the actual data. If a value is required, Treema will use the
default value if one is provided (by the schema for the data or an ancestor schema).

#### Defined in

[src/Treema/types.ts:255](https://github.com/sderickson/react-treema/blob/3868d5e/src/Treema/types.ts#L255)

___

### displayProperty

• `Optional` **displayProperty**: `string`

If the schema is an object, the value for this property will be displayed as its label.
Note that this is *not* a valid JSON Schema keyword. If it is used, the validator library
may need to have this keyword added to it as part of the wrapper (see wrapAjv example).

#### Defined in

[src/Treema/types.ts:226](https://github.com/sderickson/react-treema/blob/3868d5e/src/Treema/types.ts#L226)

___

### enum

• `Optional` **enum**: `any`[]

Enum values will be chosen with a select box.

#### Defined in

[src/Treema/types.ts:293](https://github.com/sderickson/react-treema/blob/3868d5e/src/Treema/types.ts#L293)

___

### format

• `Optional` **format**: `string`

Mainly used to lookup what TypeDefinition to use if a custom one is provided. Also if
`type` is `"string"`, and format is one of a handful of valid values, Treema will use
the format as the HTML input `type` attribute. These are:

'color', 'date', 'datetime-local', 'email', 'password', 'tel', 'text', 'time', 'url'

#### Defined in

[src/Treema/types.ts:278](https://github.com/sderickson/react-treema/blob/3868d5e/src/Treema/types.ts#L278)

___

### items

• `Optional` **items**: [`TreemaSupportedJsonSchema`](TreemaSupportedJsonSchema.md) \| [`TreemaSupportedJsonSchema`](TreemaSupportedJsonSchema.md)[]

`items` and other "child" schema keywords will be used to apply to the appropriate data.

#### Defined in

[src/Treema/types.ts:215](https://github.com/sderickson/react-treema/blob/3868d5e/src/Treema/types.ts#L215)

___

### maxItems

• `Optional` **maxItems**: `number`

Once an array reaches the maximum number of items, it will not allow adding more.

#### Defined in

[src/Treema/types.ts:288](https://github.com/sderickson/react-treema/blob/3868d5e/src/Treema/types.ts#L288)

___

### maxLength

• `Optional` **maxLength**: `number`

#### Defined in

[src/Treema/types.ts:267](https://github.com/sderickson/react-treema/blob/3868d5e/src/Treema/types.ts#L267)

___

### maximum

• `Optional` **maximum**: `number`

#### Defined in

[src/Treema/types.ts:269](https://github.com/sderickson/react-treema/blob/3868d5e/src/Treema/types.ts#L269)

___

### minLength

• `Optional` **minLength**: `number`

The following values are provided as input attributes, but beyond that are unused.

#### Defined in

[src/Treema/types.ts:266](https://github.com/sderickson/react-treema/blob/3868d5e/src/Treema/types.ts#L266)

___

### minimum

• `Optional` **minimum**: `number`

#### Defined in

[src/Treema/types.ts:268](https://github.com/sderickson/react-treema/blob/3868d5e/src/Treema/types.ts#L268)

___

### oneOf

• `Optional` **oneOf**: [`TreemaSupportedJsonSchema`](TreemaSupportedJsonSchema.md)[]

Treema will combine each `oneOf` and `anyOf` schema int working schemas, and then use
the resulting title (or type) as the label.

#### Defined in

[src/Treema/types.ts:247](https://github.com/sderickson/react-treema/blob/3868d5e/src/Treema/types.ts#L247)

___

### patternProperties

• `Optional` **patternProperties**: `Object`

#### Index signature

▪ [key: `string`]: [`TreemaSupportedJsonSchema`](TreemaSupportedJsonSchema.md)

#### Defined in

[src/Treema/types.ts:218](https://github.com/sderickson/react-treema/blob/3868d5e/src/Treema/types.ts#L218)

___

### properties

• `Optional` **properties**: `Object`

#### Index signature

▪ [key: `string`]: [`TreemaSupportedJsonSchema`](TreemaSupportedJsonSchema.md)

#### Defined in

[src/Treema/types.ts:217](https://github.com/sderickson/react-treema/blob/3868d5e/src/Treema/types.ts#L217)

___

### readOnly

• `Optional` **readOnly**: `boolean`

Treema disables editing for values which are readOnly.

#### Defined in

[src/Treema/types.ts:283](https://github.com/sderickson/react-treema/blob/3868d5e/src/Treema/types.ts#L283)

___

### required

• `Optional` **required**: `string`[]

Treema will automatically fill required fields, using `default` data if available,
otherwise a default "empty" value depending on the type ('', 0, etc).

#### Defined in

[src/Treema/types.ts:261](https://github.com/sderickson/react-treema/blob/3868d5e/src/Treema/types.ts#L261)

___

### title

• `Optional` **title**: `string`

The data's "title" will be shown as its label.

#### Defined in

[src/Treema/types.ts:231](https://github.com/sderickson/react-treema/blob/3868d5e/src/Treema/types.ts#L231)

___

### type

• `Optional` **type**: [`SchemaBaseType`](../modules.md#schemabasetype) \| [`SchemaBaseType`](../modules.md#schemabasetype)[]

Determines what sort of data input to use. If multiple are given, Treema will provide
a selector for the user to choose from.

#### Defined in

[src/Treema/types.ts:210](https://github.com/sderickson/react-treema/blob/3868d5e/src/Treema/types.ts#L210)

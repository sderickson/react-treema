[react-treema](../README.md) / [Exports](../modules.md) / TreemaRootProps

# Interface: TreemaRootProps

This file contains type definitions for everything exposed publicly. It also
is the reference documentation.

## Table of contents

### Properties

- [data](TreemaRootProps.md#data)
- [definitions](TreemaRootProps.md#definitions)
- [filter](TreemaRootProps.md#filter)
- [initOpen](TreemaRootProps.md#initopen)
- [onEvent](TreemaRootProps.md#onevent)
- [schema](TreemaRootProps.md#schema)
- [schemaLib](TreemaRootProps.md#schemalib)

## Properties

### data

• **data**: `any`

The data to display in the treema. Should conform to the schema given.

**`Default`**

```ts
An "empty" or "falsy" value of whatever type is given in the schema.
```

#### Defined in

[src/Treema/types.ts:12](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L12)

___

### definitions

• `Optional` **definitions**: [`TreemaTypeDefinition`](TreemaTypeDefinition.md)[]

Custom Treema node definitions. Use these to customize how Treema renders data
of certain types. Treema will first see if there's a match for the "format" on the
data's schema, then will match its "type". If no match is found, Treema will use the
default node definitions, keying off what type the data currently is.

See [TreemaTypeDefinition](https://github.com/sderickson/react-treema/blob/4923128ed24089d8677b11608cbe9afbfde1c51b/src/Treema/types.ts#L319)
for documentation on definitions.

**`Default`**

```ts
The default definitions, which cover all JSON Schema types and a few advanced examples.
```

#### Defined in

[src/Treema/types.ts:57](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L57)

___

### filter

• `Optional` **filter**: [`TreemaFilter`](../modules.md#treemafilter)

Filters what nodes are visible. If a string, filters nodes that do not contain it.
If a regex, filters nodes that do not match it. If a function, filters nodes which
the function returns false.

If you are using a function and its behavior changes, be sure to provide a new
function with each change otherwise Treema will not update.

#### Defined in

[src/Treema/types.ts:74](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L74)

___

### initOpen

• `Optional` **initOpen**: `number`

The number of levels deep to open the tree by default.

**`Default`**

```ts
All levels are open by default
```

#### Defined in

[src/Treema/types.ts:64](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L64)

___

### onEvent

• `Optional` **onEvent**: [`TreemaEventHandler`](../modules.md#treemaeventhandler)

A callback for when the user interacts with the treema.

Supported events:
- `change_select_event`: when the user selects a node. Includes `path` in the event.

#### Defined in

[src/Treema/types.ts:44](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L44)

___

### schema

• **schema**: [`TreemaSupportedJsonSchema`](TreemaSupportedJsonSchema.md)

The schema to use to validate the data. Treema will use this to determine
how to construct the UI, and how the data may be edited

**`See`**

https://json-schema.org/understanding-json-schema/

**`Default`**

```ts
{} (any JSON object allowed)
```

#### Defined in

[src/Treema/types.ts:21](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L21)

___

### schemaLib

• `Optional` **schemaLib**: [`TreemaWrappedSchemaLib`](TreemaWrappedSchemaLib.md)

A schema library instance to use to validate the data.
There are [many JavaScript libraries](https://json-schema.org/implementations.html#validators)
that support various drafts of the JSON Schema spec.
Wrap your chosen library to match the TypeScript interface "SchemaLib".
Generally you should initialize the library, which may provide options
which will affect the behavior of Treema. Treema also depends on this library
to provide error messages.

See wrapTv4 and wrapAjv for examples.

**`Default`**

```ts
A noop version - no validation, no error messages
```

#### Defined in

[src/Treema/types.ts:36](https://github.com/sderickson/react-treema/blob/cecfce1/src/Treema/types.ts#L36)

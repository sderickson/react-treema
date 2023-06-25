# State
There should be a central store for each root node. We can't rely on this state living in React components because sometimes they won't be rendered, such as if an array or object is opened or closed.

Let's rely on useContext here to provide dispatch and state via useReducer. This way treema doesn't need to rely on any third party store, such as redux, which will end up working similarly anyway.

I do think we need reselect, though. The state includes the data and things like selected rows, but other data can be derived such as errors and working schemas. It will involve storing more in memory, but it'll be worth it so that less validation and schema calculation is needed whenever data changes.

# Validation
tv4 is no longer being maintained. There have been several iterations on json schema since version 4, so it would be nice to support all the latest features. But given that validators may come and go, I'm hesitant to depend on yet another library.

One option would be to build out validation just as part of treema. A lot of the spec needs to be built anyway just for treema to work; not sure it's worth depending on another library. Then again, that's work that doesn't really *need* to get done.

What I did instead is allow a validator to be passed in, with a defined interface. Then it's more future-proof, and flexible in that a simple validator could be built and passed in, or really any library of the future. All that needs to be done with the validator is resolve references and validate the immediate (not child) data. And this way treema users can do all sorts of fancy things like adding keywords and setting up translations and compiling before passing in the validator function.

# Working Schemas
Working schemas are derived from the base data and schema of the treema. Therefore, they should not be stored explicitly but should be cached in selectors and updated appropriately.

What I might do is have a selector which takes a JSON pointer input to get the working schema for that path. That path will get the working schema of its parent and so on. Then if data changes somewhere in the middle of the tree, the working schema for that data and all its children get recalculated, but nothing else does.

I tried this, and it didn't work out. At least my initial attempt didn't cache the way I wanted; the parent schema was re-evaluated for each child. So instead I'm doing a much selector which runs the walk function, caches that result, and then selectors for data and working schemas pull from that. Perhaps this could be made more efficient... especially when data starts changing. But that can be an optimization for another day.

Also, I'm making one change with how working schemas work from before: they now spread types, so that working schemas have one single defined type. I think this will simplify logic and UI as well. Or I might run into some reason why I didn't do this before. Tally ho.

# Editing Nodes
I got away with having a simple function for display for each type of node, but I don't think it's going to be that simple for editing, due to hooks. I think though I can just specify a ReactNode type, and use the props as the interface. What should the interface be?

* ref -> to be used for the input so Treema can manage focus
* data, schema -> both needed in current code quite a bit
* onChange -> for when the input changes

Then the layout node just renders the edit node, focuses the ref, and all's good.

Also, should just have one ref, most likely? Don't need one ref for each node in the tree; that might be unnecessarily slow.

# Switching b/w Working Schemas & Data
One of the ways the old Treema doesn't work so well is with various working schemas. I've set up this new version to show errors based on the selected working schema, which allows the user to see better what's going on and bring the data to match the intended schema. One kind of interesting case is where you switch from one working schema for an object to another. You could:

1. wipe the old data completely, replacing with a new empty object or clone of the default
2. keep the old data completely, with a bunch of errors showing, or
3. some fancy merging of old data and any given default data, maybe giving precedence to the default data.

I tried #2, but there's a problem. In order to get show errors based on working schema, I rerun the validator on the data with the working schema wherever there's a global error. This way the global "no matching oneOf" error is replaced with "here's why the data doesn't match this particular oneOf". But, if you switch working schemas without changing the data at all, there's no global error because the data still matches a oneOf, but not the one you care about. The alternative here is to run the validator on all working schemas for all paths... but that's going to get expensive. Every other heuristic I could think of feels brittle.

So I tried going down #3 a bit, but it feels unintuitive. It's hard to guess accurately what everyone is going to want in this case, and it's complex.

So I'm going with #1. If the user wants to take some data of the old data and apply it to the new, they'll have to do that manually. Unless a solution that's more like #2 or #3 can be found.
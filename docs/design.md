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
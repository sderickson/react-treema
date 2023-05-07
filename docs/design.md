# State
There should be a central store for each root node. We can't rely on this state living in React components because sometimes they won't be rendered, such as if an array or object is opened or closed.

Let's rely on useContext here to provide dispatch and state via useReducer. This way treema doesn't need to rely on any third party store, such as redux, which will end up working similarly anyway.

I do think we need reselect, though. The state includes the data and things like selected rows, but other data can be derived such as errors and working schemas. It will involve storing more in memory, but it'll be worth it so that less validation and schema calculation is needed whenever data changes.

# Validation
tv4 is no longer being managed. There have been several iterations on json schema since version 4, so it would be nice to support all the latest features. But given that validators may come and go, I'm hesitant to depend on yet another library.

One option would be to build out validation just as part of treema. A lot of the spec needs to be built anyway just for treema to work; not sure it's worth depending on another library. Then again, that's work that doesn't really *need* to get done.

What I might do is require a validator to be passed in, with a defined interface. Then it's more future-proof, and flexible in that a simple validator could be built and passed in. Really all that needs to be done with the validator is resolve references and validate the immediate (not child) data. And that'll make it so that treema users can do all sorts of fancy things like adding keywords and setting up translations and compiling before passing in the validator function.
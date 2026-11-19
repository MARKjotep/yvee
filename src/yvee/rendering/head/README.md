# Head rendering

`../head.ts` remains the compatibility entry point. The folder separates shared
configuration and rendering from browser resource ownership:

- `config.ts`: head types, normalization, merging and app defaults.
- `elements.ts`: renders owned DOM elements for both browser and SSR use.
- `browser.ts`: creates/removes browser nodes, activates bindings and manages title ownership.
- `stylesheets.ts`: waits for stylesheet load/error/timeout and cancels pending waits.

`HeadCleanup.ready` settles staging. `activate()` installs deferred title and
bindings. Calling the cleanup releases owned nodes and restores the prior title
only while that head still owns it. The runtime coordinates these operations
with body commits in `client/runtime/view.ts`.

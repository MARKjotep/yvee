# Test layout

`bun test` discovers these suites through `bunfig.toml`:

- `core/`: state, derived values, scopes and disposal.
- `dom/`: DOM helpers, rendering and trust boundaries.
- `network/`: validated requests, WebSockets and EventSource.
- `storage/`: local/session storage, migrations and IndexedDB.
- `yvee/`: app runtime, routing, SSR and example regressions.

`yvee-bun/` is the runnable demo fixture; its tests live in `yvee/`.
Real browser suites remain in `../browser/`, and consumer TypeScript contracts
remain in `../type-tests/`.

Run a group with `bun test ./test/storage` or `bun test ./test/core`.

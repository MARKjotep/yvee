# Yvee source map

See the repository root [Yvee guide](../../Yvee.md) for usage, TSX examples, and framework features.

- `app.ts` — app setup and public Yvee class
- `routing/` — URL parsing and route registration
- `guards/` — guard types, decorators, composition, and reusable conditions
- `pages/` — page controller base classes
- `client/` — browser mounting and navigation
- `client/runtime/` — transition coordination, view rollback, history, scroll and accessibility ownership; see its [source map](client/runtime/README.md)
- `rendering/` — server rendering and [head configuration/rendering](rendering/head/README.md)
- `platform/` — browser storage, WebSocket, and EventSource helpers
- `index.ts` — public exports

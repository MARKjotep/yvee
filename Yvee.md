# Yvee documentation

This root-level guide has moved into the [`docs/`](docs/) folder for `yvee@0.1.0`.
The package entry is `yvee`; start with [Getting started](docs/getting-started.md),
browse the topic guides below, or look up an export in the
[API reference](docs/api-reference.md).

| Topic | Guide |
| --- | --- |
| Install, TSX setup, package structure, first app | [docs/getting-started.md](docs/getting-started.md) |
| Reactive values, derived state, batching, hooks, resource ownership | [docs/state.md](docs/state.md) |
| Shared objects and field injection | [docs/scopes.md](docs/scopes.md) |
| Pages, route parameters, guards, error pages, SPA focus | [docs/routing.md](docs/routing.md) |
| TSX and DOM, `$` helpers, document head, SSR, static HTML, CSP | [docs/rendering.md](docs/rendering.md) |
| Browser storage, IndexedDB, JSON requests, WebSockets, event streams | [docs/data.md](docs/data.md) |
| Public exports and compatibility | [docs/api-reference.md](docs/api-reference.md) |
| Proposed leave guards and current guard boundary | [docs/guard-design.md](docs/guard-design.md) |

## Routing and guards

See [Routing](docs/routing.md) for page registration, base paths, route guards
and error pages.

## Async state updates

See [State: async updates and `flush`](docs/state.md#async-updates-and-flush)
for batching, `flush()`, cancellation and error reporting.

## Rendering trust and CSP

See [Rendering trust and CSP](docs/rendering.md#rendering-trust-and-csp) for
attribute/URL validation, trusted raw HTML, JSON bootstrap helpers and nonce
handling.

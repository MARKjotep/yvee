# API reference

The package root `yvee` re-exports the groups below. Browser-only helpers need
browser globals when called; importing their modules is safe during SSR. Types
are compile-time contracts unless a runtime validator is explicitly described.
Public signatures are authoritative; internal source paths are not stable
subpath imports.

For usage guidance see [Getting started](getting-started.md), [State](state.md),
[Scopes](scopes.md), [Routing](routing.md), [Rendering](rendering.md) and
[Data](data.md).

## App, page and routing

| Export | Description |
| --- | --- |
| `Yvee<TData>` | Creates an app with typed data, routes, guards, loading state, head defaults, sockets and client/server rendering. Use `render()` in a browser or as a callable server renderer, `server()` for explicit SSR, `renderHTML()` for one URL, `listPaths()` for export, and `dispose()` to release the current mount. |
| `YveeOptions` | App construction settings: route `base`, browser `history`, stable root `id`, browser entry `client` (defaults to `.`, resolving to `./index.js` relative to the base) and optional `index` script URL added through the head `js` list. |
| `MountOptions<TData>` | Browser mount settings for root `id`, client `data`, wrapper `class`, hydration and CSP `nonce`. |
| `RenderResult<TData>` | Callable server renderer that also behaves as the browser mount promise. `then`, `catch` and `finally` are available for client startup. |
| `Layout` | Async-capable function that wraps the root content state in a DOM context. |
| `Page<TData>` | Base route controller. Override `fetch`, `body` and `head`; each instance has URL/params/data/status/error and a `resources` disposal scope. |
| `PageFetchContext<TData>` | Fetch input: parsed Yvee URL, string params, request data, abort signal and page-owned resources. |
| `MissingPage` | Default 404 controller rendered when no page route matches, unless the app registers another page for that status. |
| `FailurePage` | Default 500 controller rendered after a page load/render failure when no custom error page applies. |
| `page(path)` / `route(path)` | Class decorators that register page route metadata; `route` is the common page alias. Registration occurs when the decorated class is passed to `app.register()`. |
| `error(status)` | Class decorator that associates a controller with an HTTP error status for later app registration. |
| `socketRoute(path)` | Decorator that registers a WebSocket controller route when its class is registered with the app. |
| `RouteBook` | Stores page and socket route registrations, matches paths and lists registered entries. |
| `RouteEntry<T>` | One registered route's pattern, transport and controller type. |
| `Constructor<T>` | Constructor type used by route registration APIs. |
| `Transport` | Route kind: `page` or `socket`. |
| `interpolate(pattern, params)` | Fills named route segments from supplied parameter values. |
| `toURL(value)` | Parses a string or URL into Yvee's normalized path, search, hash and query parameters. |
| `normalizePath(path)` | Normalizes leading, repeated and trailing slashes in a route path. |
| `YveeURL` | Parsed URL shape containing normalized `path`, `search`, `hash`, and `URLSearchParams`. |

`RouteMatch` exists in `src/yvee/routing/routes.ts` but is not exported from the
package root; treat it as internal.

## Guards

| Export | Description |
| --- | --- |
| `Guard<TApp,TPage,TData>` | Sync or async route decision callback. It can allow, stop or redirect based on the supplied context. |
| `GuardContext<TApp,TPage,TData>` | Per-transition app, page, URL, readonly string params, data and abort signal. |
| `GuardResult` | `allow`, `stop`, `redirect` with optional replace behavior, or `void` to continue. |
| `GuardApp<TData>` | Minimal app shape with data and reactive URL for guard typing. |
| `GuardFactory<Args,Context>` | Typed factory for producing reusable guards from configuration. |
| `createGuard(factory)` | Preserves a typed factory for guards that capture application configuration. |
| `use(...guards)` | Class decorator attaching guards to a page controller in declaration order. |
| `requireGuard(predicate, fallback)` | Allows when a boolean predicate passes; otherwise returns a stop or configured/context-derived redirect. |
| `allGuards(...guards)` | Runs guards sequentially and returns the first stop/redirect decision. Checks cancellation around each guard. |
| `whenGuard(predicate, guard)` | Runs a guard only when its condition passes. |
| `paramsGuard(validators, fallback)` | Requires each named route parameter to exist and pass its sync/async validator before page fetch. |
| `ContextGuard<Context>` | Guard function type for a chosen context shape. |
| `GuardPredicate<Context>` | Sync or async predicate used by conditional guard helpers. |
| `GuardFallback<Context>` | Stop/redirect result or a callback that derives one from guard context. |
| `GuardRejection` | Stop or redirect subset of `GuardResult`. |

Client guards are destination entry checks. Unsaved-change departure checks,
session readiness and active-route revalidation are future design work described
in [guard-design.md](guard-design.md).

## Server rendering and document head

| Export | Description |
| --- | --- |
| `ServerOptions<TData>` | SSR app options including document root metadata, data defaults and a per-request `dataFactory`. |
| `ServerRequest<TData>` | One render request: URL, optional data/error, CSP nonce and abort signal. |
| `ServerStatusResult` | `{ html, status }` returned by `ServerRenderer.withStatus()`. |
| `ServerDataContext<TData>` | Request data-factory input with normalized signal and `onDispose` registration. |
| `ServerRenderer<TData>` | Callable HTML renderer with `withStatus()` for the HTML and status pair. |
| `HeadConfig` | Document metadata and resources: title, base, meta, links, scripts, styles, CSS/JS URLs and reactive DOM elements. |
| `HeadResult` | Head input accepted from a page or app: `HeadConfig`, DOM node, trusted style string, or nothing. |
| `HeadDefaults` | Accumulates app-level head values; `head()` adds defaults inherited by page head values. |
| `applyHead(config, owner, options)` | Mounts owned head nodes in a browser and returns a cleanup object with stylesheet readiness, deferred activation and cancellation. |
| `serializePayload(value)` | Safely serializes JSON-compatible bootstrap data for an HTML script context. |
| `renderJSONScript(value, { id, nonce })` | Produces a non-executable JSON script element with escaped payload and optional CSP nonce. |

SSR copies/freezes plain data as documented in
[SSR request ownership](rendering.md#ssr-request-ownership). `snapshotData` is an
internal helper and is not a supported package export.

## Reactive state, references and lifecycle

| Export | Description |
| --- | --- |
| `State<T>(value, options)` | Creates a reactive value with `Object.is` equality by default, async `flush()`, optional error reporting and abort signal. |
| `RecState<T>(record)` | Creates reactive record state with key-level `set`, `delete` and `entries` operations. |
| `SetState<T>(values)` | Creates reactive set state with `add`, `delete`, `has` and `clear` operations. |
| `QState<T>(value, verify?)` | Deprecated compatibility constructor. Defaults to notifying every assignment; prefer `State(value, { equals: false })`. |
| `Stateful<T>` | Concrete event-target implementation behind `State`; most consumers should use the factory. |
| `StateOptions<T>` | State equality, error callback and event-listener options. Equality callbacks return true to keep the existing value. |
| `Equality<T>` | Comparator contract used by state assignments. |
| `shallowEqual(a, b)` | Compares own enumerable string/symbol properties one level deep using `Object.is`. |
| `IStateful<T>` | Read/write state interface with `value`, structured `clone` and async `flush`. |
| `IRecStateful<T>` | `IStateful` plus record mutation methods. |
| `ISetStateful<T>` | `IStateful<Set<T>>` plus set mutation methods. |
| `Derived(inputs, compute, options)` | Creates read-only derived state from explicit dependencies. Await installation; calculations are synchronous. Call `dispose()` or attach a scope/signal. |
| `DerivedValue<T>` | Read-only derived state interface with `value`, `clone`, `flush` and `dispose`. |
| `DerivedOptions<T>` | State equality/error options plus optional disposal scope. |
| `StateHook(callback, states, options)` | Subscribes to state changes, optionally runs initially, and returns cleanup. |
| `StateLoaded(callback, states, options)` | Runs after current successful state bindings/hooks and returns cleanup. |
| `StateEffect(callback, states, options)` | Runs cooperative async work with a signal/currentness check; newer updates abort earlier work. |
| `StateHookOptions` | Subscription ID, initial-run flag, abort signal and disposal scope. |
| `StateUpdate` | Update signal and `isCurrent()` check supplied to effect/binding callbacks. |
| `hook(...)` / `loaded(...)` | Legacy tuple helpers for registering ordinary or post-load hooks. |
| `batch(callback)` | Synchronous nestable update batch; values change immediately, subscribers run after the outer callback. |
| `DisposalScope` | Owns cleanups, listeners, timers and closeable/disposable resources; idempotent disposal runs cleanups in reverse order. |
| `Cleanup` | Synchronous zero-argument cleanup callback. |
| `Disposable` | Object with a `dispose()` or `close()` method accepted by a disposal scope. |
| `RefState<T>` | Mutable reference state that emits an `updated` event on identity changes. |
| `Ref<T>` | Mutable holder for an element reference, available through `.element` and `.$`. |
| `useRef<T>()` | Creates an empty typed element reference. |

## Scopes and stored objects

| Export | Description |
| --- | --- |
| `Scope.register(config)` | Registers named plain objects in the package-wide scope registry; names cannot be registered twice. |
| `Scope.use<T>(name)` | Retrieves a registered object. Generic typing is an assertion and does not validate runtime shape. |
| `Scope.create(config)` | Creates an independent sealed scope container, suitable for request-owned services when passed explicitly. |
| `ScopeSet<C>` | Typed handle for using scopes from a known configuration. |
| `Field.register(config)` / `Field.use(name)` | Registers scopes or creates typed standard field decorators resolved when instances are constructed. |
| `ScopeDecorator<V>` | Standard class-field decorator type used by `Field`. |
| `ScopeProxy<T>` | Typed property proxy returned by a field-scope handle. |
| `FieldScopeSet<C>` | Typed decorator set for one registered scope. |
| `Stored<T>` | Legacy shallow-sealed object helper with one-time `bind`, nested `set`, `safe` and a callback wrapper `fn`. It is not reactive storage. |
| `successStatus<T>` | Generic success response shape with `success`, `data` and optional `message`. |
| `errorStatus` | Generic error response shape with `success` and an `error` record. |

## Browser storage, IndexedDB and network

| Export | Description |
| --- | --- |
| `BrowserStore` | JSON wrapper for local or session storage with staged/immediate writes, versioned values and cross-document watchers. |
| `local` / `session` | Preconfigured `BrowserStore` instances for `localStorage` and `sessionStorage`. |
| `StoredValue<T>` | Staged JSON value. Assign/set changes memory; `save()` persists and `remove()` deletes its key. |
| `VersionedValue<T>` | Validated versioned-key accessor with sequential migrations, fallback, set/remove and event watching. |
| `StorageSchema<T>` | Version, type-guard validator, fallback factory and destination-version migration map. |
| `StorageChange` | Native storage-event key and raw old/new JSON strings. |
| `StorageWatchOptions` | Abort signal or disposal scope for a storage-event listener. |
| `IndexedDatabase.open(name, version, schemas, options)` | Opens/upgrades a browser IndexedDB database and returns repositories for registered schema objects. Call `close()` to release the connection. |
| `OpenOptions` | IndexedDB factory override, blocked-upgrade callback and synchronous upgrade transaction callback. |
| `Schema<T>` | Typed object-store schema with one primary column, validation defaults and index declarations. |
| `Column` / `ColumnType` | IndexedDB field definition and its supported value-type name. |
| `t` | Column builders: text, safe integer, finite number, boolean, timestamp, structured-clone JSON and generated serial key. |
| `DbRepository<T>` | Async store operations: insert/put/find/findAll/index query/count/update/delete/clear. Each operation uses its own transaction. |
| `requestJSON<T>(input, options)` | Fetches and parses JSON, checks HTTP status, validates through a caller type predicate, forwards cancellation and supports bounded safe-method retries. |
| `JSONRequestOptions<T>` | Fetch options plus required validator and optional retry policy/custom fetch implementation. |
| `RequestRetry` | Additional-attempt count and fixed retry delay for eligible idempotent methods. |
| `HTTPError` | Error carrying the non-success `Response` from `requestJSON`. |
| `SocketHub` | App-owned WebSocket route loader, reconnect policy, unload and close-all manager. |
| `SocketController` | Base route controller with lifecycle callbacks, JSON sending and typed/validated message handling. |
| `SocketLoadOptions` | Socket abort signal and optional bounded reconnect policy. |
| `JsonMessageOptions<T>` | Socket payload type guard and parse/validation/handler error callback. |
| `MessageFailure` | Socket error phase: parse, validation or handler. |
| `eventStreams(url, handlers, options)` | Opens a dedicated native EventSource and closes it with its returned stream or abort signal. |
| `StreamHandlers` | Named native EventSource callbacks. |
| `StreamOptions` | Native EventSource credentials plus optional abort signal. |
| `EventStream` | Explicit shared EventSource owner; closing an owner releases only its callbacks and the last owner closes the shared connection. |
| `eventStream(...)` | Deprecated shared-stream convenience alias; prefer `eventStreams` for dedicated connections. |
| `EventMap` | Record of named EventSource handlers used by `EventStream`. |

See the [IndexedDB guide](../src/core/indexeddb/README.md) for schema examples
and data lifetime guidance. IndexedDB remains browser-managed persistent storage;
application expiry requires explicit deletion.

## DOM, TSX and browser element helpers

| Export | Description |
| --- | --- |
| `DOM` / `DOMNode` | Renderer node containing tag, attributes and child contexts; usually created through TSX. |
| `dom` | JSX element factory configured by this package's TSX settings. |
| `frag` | JSX fragment factory that groups children without a wrapper element. |
| `DOMAttr` | Attribute/event shape accepted by renderer nodes. |
| `DOMValue<T>` | Static or reactive DOM attribute value type. |
| `DOMRenderable` / `DOMContext` | Values and promise-capable contexts accepted as DOM children. |
| `DOMComponent<Props>` / `DOMComponentProps<Props>` | Typed function component and its attributes/custom props. |
| `DVal<T>` | Reactive or direct DOM value contract used by attributes and children. |
| `renderDom(value, idm?)` | Converts a DOM tree into markup plus deferred browser binding instructions. |
| `RenderedDOM` / `renderedDom` | Markup, binding instructions and optional root ID returned from rendering. Lowercase alias is retained for compatibility. |
| `$<Element>(selector, parent?)` | Queries one element and wraps it in `Elem`; returns undefined when no match or when no document exists. It also wraps an existing element directly. |
| `Elem<Element>` | Chainable browser element wrapper for class, event, content, query, animation and attribute/property operations. `insert().HTML()` and raw property APIs require trusted input. |
| `Elements` / `TagNames` | Union types of supported HTML/SVG element instances and tag names. |
| `_$<Element>` / `$_<Element>` | Optional and required `Elem` wrapper aliases. |
| `Toggled(condition, value, otherwise?)` | Returns one of two values according to a boolean condition. |
| `setContentRenderer(renderer)` | Installs an application content renderer for `$` helpers and returns a conditional reset function. |
| `renderContent(value, parentId?)` | Renders through the configured content renderer or escapes a value as text by default. |
| `ContentRenderer` / `RenderedContent` | Renderer callback and its HTML plus optional async commit operation. |
| `CSSStyle` | Style-object type accepted by element helpers. |
| `ElementAttributes` | Mapping from HTML/SVG tag names to their typed attribute interfaces. |
| `getElementById(id)` | Typed `document.getElementById` helper returning an `Elements` value. |
| `IDNotConnected()` | Reports ids referenced by the page that are not currently connected (used by element helpers). |

The root entry also re-exports typed HTML/SVG attributes, DOM event types, style
values and the `$` query/class/attribute/event/animation helpers.

### Internal renderer helpers

`Idm`, `OZ`, `Wizard`, `CTX`, `CATT`, `setNestedDOMRenderer`, `validateAttribute`
and `inlineContent` are implemented in source but are **not** exported from the
`yvee` root entry. They are lower-level renderer internals; ordinary applications
should use `Yvee.render` and the public helpers above.

## Public API compatibility and deprecations

Import consumer APIs from `yvee`. `@/index` in repository source means the root
source entry during development; `@/yvee` is the narrower app source entry. The
package does not currently promise every source file as an importable package
subpath.

`QState` and `eventStream` remain for compatibility with deprecation guidance.
`Stored`, lowercase `renderedDom`, and lower-level DOM renderer exports remain
available but are less convenient than `Scope`/`State`, `renderDom`, and app
mounting respectively.

`QState` is deprecated; migrate to `State(value, { equals: false })` for its
historic always-notify default, or normal `State` for identity equality.
`eventStream` is also deprecated as described above. Neither alias is removed.
Storage's staged and immediate operations have distinct behavior and both remain
supported. Low-level exports are retained for compatibility; new application
code should use the documented entry points and avoid depending on private maps.

`app.head()` accepts the same head result as `Page.head()`: a DOM node, a style
string, or a `HeadConfig` record. Use DOM nodes for shared markup and reactive
head attributes; existing record-based metadata remains supported.

## Version

This documentation targets `yvee@0.1.0`. The package `exports` map currently
exposes only the root entry (`import ... from "yvee"`). Run `bun run test:types`
in this repository for consumer TSX, context inference and expected-invalid
calls.

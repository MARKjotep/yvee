# Yvee

Yvee is the whole UI framework in this package: reactive state, TSX rendering,
browser element helpers, routing, and the app lifecycle. `src/core`, `src/dom`,
`src/$`, and `src/yvee` are all parts of Yvee.

The package entry point is `src/index.ts` (`@/index` inside this repository).
It exports the state API, DOM renderer, `$` helpers, and app API together.
`@/yvee` is the narrower entry for the app and routing modules.

## Package structure

| Folder | Responsibility | Examples |
| --- | --- | --- |
| `src/core/` | Reactive values, hooks, references, scopes, and storage helpers | `State`, `RecState`, `SetState`, `StateHook`, `useRef` |
| `src/dom/` | TSX nodes, HTML and SVG attributes, rendering, and reactive DOM bindings | HTML tags in TSX, `renderDom`, `DOMContext` |
| `src/$/` | Querying and working with browser elements | `$`, `Elem`, class and attribute helpers, events, animation |
| `src/yvee/` | App composition, pages, navigation, head metadata, server rendering, and transports | `Yvee`, `Page`, `route`, guards, WebSocket routes |
| `src/utils.ts` | Shared implementation utilities | Type checks, maps, and comparison helpers |

TSX creates nodes, the DOM renderer produces markup and attaches reactive
bindings, and the app connects that rendering to page transitions. `$` lets you
work with existing browser elements directly.

## Quick start

Pages are ordinary TypeScript classes. Write their markup with HTML-like TSX
(tags such as `<main>` and `<h1>`); the project JSX setup turns those tags into
nodes for Yvee's renderer.

```tsx
import { Page, route, dom } from "@/index";

@route("/users/:id")
export class UserPage extends Page<{ name?: string }> {
  override async fetch() {
    return { name: `User ${this.params.id}` };
  }

  override head() {
    return <title>{this.data.name ?? "User"}</title>;
  }

  override body() {
    return <main><h1>{this.data.name ?? "Loading user"}</h1></main>;
  }
}
```

Register pages with an app and mount it into an existing element:

```tsx
import { Yvee, dom } from "@/index";
import { UserPage } from "./user.page";

const app = new Yvee({ history: true, id: "app-root" });
app.register(UserPage);
app.Main((content) => <div class="app-shell">{content}</div>);

const unmount = await app.render({ id: "app-root" });
```

Within `src/yvee/`, the app implementation is grouped by responsibility:

- `app.ts` — app setup and public `Yvee` class
- `routing/` — URL parsing and route registration
- `guards/` — guard types, decorators, conditions, composition, and parameter validation
- `pages/` — page controller types
- `client/` — browser mount and navigation lifecycle
- `rendering/` — document head and server rendering
- `platform/` — storage, WebSocket, and EventSource helpers

## TSX and the DOM renderer

Write markup in `.tsx` files with HTML and SVG tags. The current `tsconfig.json`
uses `dom` as its JSX factory and `frag` for fragments (`<>...</>`), so import
those names where needed. They support tag syntax without manual factory calls.

```tsx
import { State, dom, frag } from "@/index";

const count = State(0);

const view = (
  <>
    <h1>Counter</h1>
    <button on={{ click() { count.value++; } }}>
      Clicks: {count}
    </button>
  </>
);
```

State values can appear in children and supported attributes. The renderer
registers bindings so updates can change the corresponding browser content.
App mounting handles rendering and activating those bindings for page content.

## Browser element helpers (`$`)

`$` selects a browser element and returns an `Elem` wrapper. A selector that
matches nothing returns `undefined`. You can also wrap an existing element.

```ts
import { $ } from "@/index";

const panel = $("#details");
panel?.add("is-open");
panel?.attr.set({ "aria-expanded": true });
```

These helpers include element queries, classes, attributes, events, content,
and animation. Use them when you need direct access to an existing browser
node; page markup and reactive bindings are provided by the DOM renderer.

## Reactive state

`State(value)` exposes `.value` for reads and assignments and `.clone` for a
structured copy. By default, assignments compare with `Object.is`: the same
object reference does not notify, while a new reference does. `NaN` equals
itself and positive and negative zero are different. Direct mutation of a
stored object does not notify; replace the value or use record methods.

```ts
import { State, RecState, SetState, shallowEqual } from "@/index";

const profile = State({ name: "Ada", city: "Manila" });
profile.value = { ...profile.value, city: "Cebu" };

// Skip new flat records whose own enumerable keys/values are unchanged.
const filters = State({ query: "", page: 1 }, { equals: shallowEqual });
// A custom comparator returns true to keep the previous value and skip work.
const item = State({ id: 1, label: "Ada" }, {
  equals: (previous, next) => previous.id === next.id && previous.label === next.label,
});
const pulse = State(0, { equals: false }); // notify on every assignment

const record = RecState({ name: "Ada", city: "Manila" });
record.set("city", "Cebu");
const selected = SetState<string>([]);
selected.add("featured");
```

`shallowEqual` compares records and arrays using their own enumerable string
and symbol keys. It compares values with `Object.is`, without recursion or JSON
serialization. Nested objects must retain their references to compare equal.
Special objects such as dates and maps compare by identity.

`RecState().set()` notifies when the key is new or its value differs by
`Object.is`; `.delete()` notifies when an existing key is removed. `SetState()`
provides `.add()`, `.delete()`, and `.clear()`, skipping changes that have no effect.

`StateHook()` observes updates and returns a cleanup function. `StateLoaded()`
runs after registered binding work has completed. Keep and call cleanup
functions when their owner is disposed.

**Migration:** `State()` no longer suppresses assignments of new objects based
on recursive content equality. Use `equals: shallowEqual` for flat records or
supply a comparator for a specific data model. `QState()` remains a legacy
convenience: its default always notifies; `QState(value, true)` now uses
`Object.is`. Prefer `State(value, { equals: false })` for new code.

## Scopes: shared objects and field injection

Scope helpers live in `src/core/scope/` and are exported from `@/index`.
Register named objects once in your application bootstrap, before creating
classes that consume them. Registration seals a shallow copy: existing keys
can be assigned, but keys cannot be added or removed. Nested references are
preserved, and registration does not mutate or seal your original object.

```ts
// main.ts (registration, before constructing pages/services)
import { Scope, State } from "@/index";

export const scopes = Scope.register({
  app: {
    count: State(0),
    title: "My app",
  },
});

const appValues = scopes.use("app"); // inferred keys and value types
appValues.count.value++;
```

Other modules can use `Scope.use<T>(name)` without importing the bootstrap.
The generic describes an expected shape; it does not validate it at runtime.
For inferred types, import the registration handle from a dedicated setup
module instead. Avoid circular imports between the entry and its consumers.

```ts
// counter.service.ts
import { Scope, type IStateful } from "@/index";

type AppScope = { count: IStateful<number>; title: string };

export function increment() {
  const app = Scope.use<AppScope>("app");
  app.count.value++;
}
```

`Field` uses the same registry and provides standard TypeScript class-field
decorators. Decorators may be declared before registration; they resolve the
value when an instance is constructed.

```ts
import { Field, type IStateful } from "@/index";

type AppScope = { count: IStateful<number>; title: string };
const appFields = Field.use<AppScope>("app");

class Counter {
  @appFields.count count!: IStateful<number>;
  @appFields.title title!: string;

  increment() {
    this.count.value++;
  }
}
```

You can also register with `Field.register({ app: { ... } })` and use its typed
`.use("app")` handle for decorators. Both registration APIs publish to the
same registry, so register each name only once. Duplicate names, missing scopes,
and missing field keys throw descriptive errors. A present key whose value is
`undefined` is valid.

A field receives the registered value during construction, replacing any
field initializer. Objects and state instances are shared references; primitive
values are snapshots. Reassigning a decorated field does not write back to the
scope. To share reactive updates, register a `State()` value and change its
`.value`. Scope itself does not emit reactive updates.

`Scope` exposes only static `register()` and `use()` methods, matching `Field`.
It is not constructed with `new` and has no instance helpers. The previous
local scope API and `TScope` alias have been removed. The existing `Stored`
helper remains available in the same folder.

Named registration is application-wide within a loaded package instance.
Use it for shared services/configuration. Keep SSR user/request data local to
the request and pass it explicitly; the global registry is not request isolation.

## Routing and guards

Use `@route(path)` on a page class, then pass the class to `app.register()`.
Named path segments such as `:id` are available as `this.params.id`. Guards
created with `createGuard()` can be reused with `@use(...)` or registered for
the whole app with `app.use(...)`.

```tsx
import { Page, createGuard, route, use, dom } from "@/index";

const signedIn = createGuard(() => () => ({ kind: "allow" as const }));

@route("/account")
@use(signedIn())
class AccountPage extends Page {
  override body() {
    return <main><h1>Account</h1></main>;
  }
}
```

## Server rendering

Configure the same routes on the server and render a URL to an HTML document:

```ts
const renderPage = app.server({ id: "app-root" });
const html = await renderPage({ url: "/users/42" });
```

`renderPage.withStatus(request)` returns the HTML and HTTP status together. The
browser renderer can reuse matching server markup; pass `hydrate: false` to
replace the mount element contents.

See `test/yvee-bun/` for a Bun server and browser fixture.

## Reusable guards

Guard helpers are exported from `@/index` and implemented in `src/yvee/guards/`.
`requireGuard(predicate, fallback)` allows a route when a sync/async predicate
passes; otherwise it stops or returns your redirect. `allGuards(...guards)`
evaluates in order and short circuits at the first stop or redirect.
`whenGuard(predicate, guard)` runs a guard conditionally. `paramsGuard()`
validates required route parameters before the page loads.

```ts
import { requireGuard, paramsGuard, allGuards } from "@/index";

const validId = paramsGuard({ id: (value) => /^\d+$/.test(value) });
const featureEnabled = requireGuard(
  ({ data }) => data.featureEnabled === true,
  { kind: "redirect", to: "/" },
);
app.use(allGuards(featureEnabled, validId));
```

Register parameter guards on the routes that actually have those parameters.
The guard runner checks the transition abort signal before and after each
guard. Async work in guards should also receive `context.signal`.
Authentication and permission predicates should use your application's session
data. Browser guards control navigation; protect server endpoints separately.

## Browser storage

`local` and `session` provide JSON storage helpers for their respective browser
stores. Existing entry-style access is supported alongside direct operations:

```ts
import { local, session } from "@/index";

local.set("theme", "dark");
const theme = local.get("theme", "light").value;
local.get("theme", "light").set("dark").save();
session.set("draft", { title: "Untitled" });
const hasDraft = session.has("draft");
session.remove("draft");
```

Missing/unreadable entries use the fallback; stored `null` remains `null`.
Writes and removals are explicit and propagate storage errors to the caller.
Without a browser, writes do nothing and reads use the fallback. Types are
compile-time hints, so validate untrusted stored data before relying on it.

For validated values with explicit migrations, use versioned keys:

```ts
const theme = local.versioned("theme", {
  version: 2,
  validate: (value): value is { dark: boolean } =>
    typeof value === "object" && value !== null && "dark" in value && typeof value.dark === "boolean",
  fallback: () => ({ dark: false }),
  migrations: { 2: previous => ({ dark: previous === "dark" }) },
});
// Reads theme:v2, or migrates theme:v1 and saves theme:v2.
const preference = theme.get();
theme.set({ dark: true });
const stop = theme.watch(change => console.log(change.newValue), { scope: app.resources });
```

Versions start at 1. Migration entries are destination versions and run in
sequence from the newest existing older key. The final result must validate
before it is saved. Missing steps, invalid data and failed writes throw; older
keys remain available. Existing unversioned keys require an explicit application
migration to `key:v1`. Fallbacks are validated and are not automatically saved.
`remove()` removes only the current version; remove old keys too when permanently
discarding a migrated value, since a later `get()` can migrate them again.

`local.watch(key, callback, { signal, scope })` and `session.watch` observe native
`storage` events, including a `key: null` event for another document's clear.
Changes contain raw `oldValue`/`newValue` strings. They do not update local state
or notify for same-document writes. Local storage events reach other same-origin
tabs; session storage events are limited to documents sharing the tab's session
storage area. Stop the watcher explicitly or give it a scope/signal.

For structured drafts, temporary caches and indexed records, use the core
`IndexedDatabase`, `Schema`, `t` and `DbRepository` exports. See the
[IndexedDB guide](src/core/indexeddb/README.md) for examples, upgrades and cleanup.
IndexedDB persists until explicitly deleted or evicted; closing it does not
expire temporary data. Register connections with `app.resources.own(db)`.

## Validated JSON requests

```ts
import { requestJSON } from "yvee";

const total = await requestJSON("/api/total", {
  signal: context.signal,
  validate: (value): value is number => typeof value === "number" && Number.isFinite(value),
  retry: { attempts: 2, delayMs: 100 },
});
```

`requestJSON` forwards Fetch options, requires a validator and checks HTTP status
before parsing JSON. Non-success responses throw `HTTPError` with the original
`response`; JSON parse failures and validator errors propagate, and a false
validator result throws `TypeError`. Successful bodies must contain JSON.
Signals are forwarded, inherited from a `Request` when unspecified, and checked
before attempts and after body parsing. An optional `fetch` transport supports
tests and application adapters.

Retries default to zero. Up to five additional attempts are allowed for bodyless
GET/HEAD/OPTIONS requests, with a fixed, abortable delay. Network `TypeError`s and
408/429/500/502/503/504 responses may retry; parsing and validation never retry.
Retry responses are cancelled before waiting. Other methods reject a retry
policy before sending. There is no automatic token handling or retry-after policy.

## Derived state

```ts
import { Derived, State, batch } from "yvee";

const price = State(10);
const quantity = State(2);
const total = await Derived([price, quantity], (price, quantity) => price * quantity, {
  scope: app.resources,
});
batch(() => { price.value = 12; quantity.value = 3; });
await total.flush(); // total.value is 36
```

Await installation before updating inputs. Dependencies are explicit and fixed;
there is no implicit read tracking. Calculations are synchronous and pure, and
must return a new value or use an appropriate equality option for mutable data.
The returned value is read-only in TypeScript and supports normal DOM bindings
and downstream derived values. Batches expose final input values; a calculation
may run once per changed dependency, while equal output suppresses notification.

`flush()` waits for inputs and derived subscribers. Calculation failures preserve
the previous output and follow the input state's error/flush contract; derived
subscriber failures follow the derived state's `onError` contract. Use
`StateEffect` for async calculations and its abort/current-update checks, rather
than returning a promise from `Derived`. `dispose()`, scope disposal or an abort
signal removes input subscriptions; the last output remains readable.

See [the authentication example](examples/README.md) for an app-specific
`requireGuard` using request-owned user data without a prescribed session format.

## Production planning

See [production planning](./PRODUCTION.md) for the current gaps and suggested
order of work across state, the renderer, browser helpers, and app runtime.

## Rendering trust and CSP

Ordinary body text and attribute values are escaped during SSR and set through
DOM APIs during browser updates. Tag names, attribute definitions, CSS, scripts
and component functions are application-authored code. Yvee does not sanitize
arbitrary HTML or untrusted CSS/JavaScript.

DOM rendering, reactive attributes, configured head attributes and
`$.attr.set(...)` share these rules:

- Invalid attribute names are not emitted. String event attributes (`onclick`,
  `onload`, etc.) and `srcdoc` are rejected. Register functions with `on={{ ... }}`.
- URL attributes accept relative URLs and HTTP(S). `href`/`xlink:href` also accept
  `mailto:` and `tel:`. `src` accepts base64 PNG, GIF, JPEG, WebP and AVIF images.
  Other explicit schemes, SVG data URLs and data URLs in `srcset` are rejected.
  `srcset` accepts comma-separated URL/descriptor candidates. These checks do not
  restrict HTTP(S) destinations; use application policy and CSP for that.
- Inline script/style children must be static trusted text. Configured head code
  and TSX code reject HTML closing-tag sequences that could terminate their
  container. Script HTML-comment/open-script sequences are also rejected. Code
  is emitted as code, so JavaScript operators such as `<` and `&&` retain meaning.

`Elem.insert(position).HTML(...)` deliberately inserts **trusted raw HTML**.
`newChild`/`newChildNS` properties and direct DOM APIs also require trusted code.
Use `insert(...).text(...)` or normal rendered content for untrusted data.
`inner`, `append` and `appendfirst` use the renderer and escape ordinary strings.
Raw HTML and arbitrary property assignments bypass the validation rules above.

For JSON handoff, use `renderJSONScript(payload, { id, nonce })` or
`serializePayload(payload)` inside a trusted JSON script container. These helpers
escape `<`, `>`, `&` and Unicode separators while preserving parsed data. They
reject cycles, BigInt, undefined, functions, symbols and nonfinite numbers as
JSON values. Native JSON behavior still applies to `toJSON` methods and omitted
symbol keys. Never put user data directly in executable script bodies.

```ts
import { renderJSONScript } from "yvee";

const nonce = crypto.randomUUID(); // Generate for each response.
const html = await renderPage({ url: request.url, data, nonce, signal: request.signal });
const responseHTML = html.replace("</head>",
  `${renderJSONScript(data, { id: "payload", nonce })}</head>`);
// Set the matching Content-Security-Policy response header in your server.
```

The server request's `nonce` overrides configured nonces on framework-created
scripts/styles, including TSX head/body elements. Pass that same response nonce
to `app.render({ nonce })` so client-created head nodes and subsequent rendered
content can use it. An authorized bootstrap script can read its `.nonce` property
and pass it to the mount. Do not store a request nonce in shared app defaults.
The server integration sets the CSP header and nonces on its own entry scripts.
A nonce does not authorize style attributes; move such CSS into allowed styles.
Scripts produced through an HTML template are inert under normal browser rules;
use configured `head.script`/`head.js` for browser-executed head scripts.

Validation failures reject SSR or initial mounting. Navigation head failures
clean up staged head nodes and report through `app.onError`. A rejected reactive
attribute update leaves the DOM attribute unchanged; it is reported through the
state error channel and rejects the next `flush()`.
State assignment is synchronous; use `onError` and `flush()` for asynchronous
subscriber failures, as described below.

## SSR request ownership

`renderPage({ url, data })` snapshots arrays and plain objects, including nested
containers, and freezes the copies. Caller objects remain untouched. Page data's
top level is local and can receive fetched fields; nested input data is read-only.
Service/class instances and accessors are rejected in this plain-data path. This
also applies to default data passed to `server({ data })` or inherited from the
app. Keep shared configuration free of user-specific mutable values.

Use a factory for mutable data or services with a request lifetime:

```ts
import { Scope } from "yvee";

const renderPage = app.server({
  async dataFactory({ data, signal, onDispose }) {
    const service = await openRequestService(signal);
    onDispose(() => service.close());
    const scopes = Scope.create({ request: { service } });
    return { ...data, scopes }; // Return fresh containers for this request.
  },
});
await renderPage({ url: request.url, data: requestData, signal: request.signal });
```

`dataFactory` takes precedence over plain-data defaults and receives the original
request data. It owns copying, validating and combining that data. Register each
resource immediately after acquiring it; cleanup runs after the entire document
has rendered, on failure, or after aborted work unwinds. Cancellation is
cooperative: async work must honor the supplied signal. Cleanup is awaited in
reverse order, and all registered cleanups are attempted. Combined render/cleanup
failures are reported in an `AggregateError` with the render error first.

`Scope.create` returns an independent `use(name)` container. It retains service
references and seals a top-level copy, like global registration. Create it per
request and pass it explicitly; it is not resolved by global `Scope.use` or
`Field` decorators. Global Scope/Field remain application-wide. They must not
contain per-user state and must never be cleared between concurrent requests.

Guards use `context.data`, `context.url` and `context.signal` for request values.
`context.app` remains the shared app; do not mutate its data, URL/loading state,
head defaults or route registration while serving requests. Lazy modules are
cached, so create mutable state in page instances or exported factories, including
`head({ page })`. A fresh controller cannot isolate a module-level singleton.
SSR collects binding descriptions locally and never stages them in the browser
`Wizard`. Use the same app root seed, data and tree for deterministic hydration.

For multiple browser apps, give every mount a distinct root ID. Links belong to
the nearest mounted app. Only the primary app should own browser history; mount
secondary apps with `history: false`. Document title remains shared: the latest
committed title wins, and disposal restores a prior title only if it still owns
the current value.

## Async state updates

State values change synchronously. Assignments outside `batch` publish an
`updated` event immediately; framework hooks, DOM bindings and loaded callbacks
may finish asynchronously. `await state.flush()` waits for current framework
work on that state, including loaded callbacks and any updates they schedule.
It does not wait for arbitrary native event listeners, unrelated states, or
work a callback starts without returning its promise. Do not await a state's
flush from inside that same state's subscriber.

```ts
const count = State(0, { onError: error => console.error(error) });
batch(() => {
  count.value = 1;
  count.value = 2;
});
await count.flush();
```

`batch` is synchronous and nestable. Each changed state publishes once when the
outer batch exits; reads inside it see the new values immediately. Notification
still occurs if the callback throws. Async callbacks are rejected; batching does
not span an `await`. A hook subscribed to several states can run once for each
changed dependency. There is no implicit global batching or cross-state flush.

A newer assignment supersedes pending work on that state. Framework DOM bindings
check ownership after asynchronous rendering and skip stale commits. Superseded
work no longer holds up `flush`; application promises must still cooperate with
cancellation to release their own external work. Ordinary `StateHook` callbacks
cannot roll back arbitrary application side effects. Use `StateEffect` for async
work that should stop on a newer update:

```ts
await StateEffect<[string]>(async (update, query) => {
  const response = await fetch(`/search?q=${encodeURIComponent(query)}`, {
    signal: update.signal,
  });
  const result = await response.json();
  if (update.isCurrent()) results.value = result;
}, [query], { scope: page.resources });
```

`StateHook`, `StateEffect` and `StateLoaded` return cleanup functions and accept a
`signal` or disposal `scope`. Default subscription IDs are unique; explicit IDs
replace the previous subscription with that ID on a state. An older cleanup
cannot remove a replacement. Failed initialization removes installed hooks.
`StateLoaded` runs after successful current hooks/bindings; a failed commit does
not announce a successful load.

Subscriber failures are reported through `StateOptions.onError`, or a cancelable
`error` event on `Stateful`, with `console.error` as the default reporter. They
also reject `flush()`; observed errors are drained by that flush. Multiple errors
use `AggregateError`. Other registered subscribers are still attempted. Native
DOM event handlers follow browser error semantics and are outside this channel.

Navigation now awaits the real root flush. Failed body or head activation
restores the last committed body and head where rollback succeeds, removes staged
head work and releases the failed page's resources. Failed rollback is reported
as an `AggregateError`; arbitrary code side effects cannot be undone. Loading
settles after commit and scroll restoration. Newer navigations cancel older
render ownership, including late `ready` cleanups.

### SPA route focus and announcements

After a successful client-side route commit, Yvee focuses the first
`[data-yvee-focus]` element, otherwise the first `h1`, otherwise the app root
(unless it is `body`). A hash target inside the app takes precedence. Headings
receive a temporary `tabindex="-1"` for programmatic focus and return to their
original markup after blur. The initial page load leaves focus where the browser
placed it. A polite, atomic status region announces the committed document title.
When `prefers-reduced-motion: reduce` is active, framework route scrolling
temporarily overrides CSS smooth scrolling so position changes happen without
motion. Framework navigation does not animate the page transition.

For frequently edited large collections, bind row values separately so one
change only updates its row:

```tsx
const labels = records.map(record => State(record.label));
return <ul>{labels.map(label => <li>{label}</li>)}</ul>;
```

Updating one state in this list retains its `<li>` nodes. Updating a single state
that contains the whole rendered list replaces that bound region's children.
The 500-row browser benchmark in `PRODUCTION.md` records the observed costs and
supports per-row bindings without requiring keyed list reconciliation.

## Resource ownership

`DisposalScope` owns synchronous cleanups. `defer(fn)` registers a cleanup and
returns an idempotent function that releases it early. `own(resource)` accepts
objects with `dispose()` or `close()`. `listen(...)` and `timeout(...)` register
listeners/timers. `scope.signal` aborts on disposal. All cleanups are attempted in
reverse order; failures are collected in an `AggregateError`. Adding a cleanup
after disposal executes it immediately. Async cleanup belongs in server
`onDispose`, or must be managed and awaited by application code.

Every `Page` owns `page.resources`; its fetch context also supplies `resources`
and a signal that ends with that page. Resources close after replacement, on
failed/stopped/redirected loads, on cancellation, or after SSR completes. Link
request work to the provided signal. A resolved page keeps its resources until
its body/head are replaced, rather than losing them as soon as fetch finishes.

`app.resources` owns resources for the current browser mount. Register them after
mounting or in browser lifecycle callbacks. `app.dispose()` and the cleanup
returned by `app.render()` remove bindings, global handlers, page scopes, head
nodes, app resources and all sockets owned by `app.socket`. Every cleanup path is
attempted even if another throws. Mounting again creates a fresh app scope. A
cleanup from an older mount cannot dispose the new mount.

```ts
const stop = await app.render();
app.resources.own(eventStreams('/events', {}, { signal: app.resources.signal }));
// Later: stop() or app.dispose().
```

Independent helpers are not automatically app-owned: explicitly register an
EventSource, shared `EventStream` owner, subscription, timer or other resource in
the appropriate scope. Do not register request resources in a shared server app
scope; use `page.resources` or server `onDispose`.

## Network helper contracts

`SocketHub.load(path, options)` accepts relative paths and HTTP(S)/WS(S) URLs,
matches the URL pathname against socket routes, converts HTTP to WS and HTTPS to
WSS, and preserves explicit `ws:`/`wss:`. It reuses an existing controller for the
same load key, including during backoff. Options belong to the first load;
`unload(path)` or `closeAll()` explicitly ends ownership and removes callbacks.
Aborting a load's signal cancels the connection and pending retry timer.

Sockets do not retry by default. Opt in with
`retry: { attempts: 3, delay: 250, maxDelay: 30000 }`. `attempts` is the maximum
number of reconnects for that load, across successful opens as well as failures;
backoff doubles and is capped. Invalid policies throw before connecting. Initial
constructor errors propagate; reconnect-constructor failures are reported and
end the load. Disposing a hub removes listeners before closing sockets, so late
native close events do not call disposed application hooks.

`controller.onMessage(handler, { validate, onError })` parses JSON text frames,
optionally validates the parsed value with a type predicate, and awaits the
handler. `onError(error, phase, event)` distinguishes `parse`, `validation` and
`handler` failures. Without it, `controller.messageError` reports the error.
Ordinary messages still reach the raw `message` hook. A generic type argument
without a validator is an application assertion, not runtime validation. Async
socket callback failures are caught and reported; they are never treated as
JSON parse failures.

`eventStreams(url, handlers, { signal, withCredentials })` creates a dedicated
EventSource and returns it. Its `close()` removes registered callbacks and abort
listeners, then closes the source exactly once. It uses native SSE reconnection
until close/abort; it does not add another retry loop. Server-supplied SSE retry
intervals follow native EventSource behavior. Message payloads are raw events;
validate their data in application code. Handler errors follow native event
semantics.

`EventStream` remains available for deliberate connection sharing. Each owner
removes only its callbacks; the final owner closes the shared source. Conflicting
credentials for the same shared URL throw. Use the owner's `close()`, rather than
closing its public shared `.stream` directly. The convenience `eventStream` is
deprecated in favor of `eventStreams` for dedicated connections; its historic
credentials default remains `true`. Dedicated `eventStreams` defaults to `false`.

## Exported API reference

The root package entry `yvee` re-exports the groups below. Browser-only helpers
need browser globals when called; importing their modules is safe during SSR.
Types are compile-time contracts unless a runtime validator is explicitly
described. Public signatures are authoritative; internal source paths are not
stable subpath imports.

### App, page and routing

| Export | Description |
| --- | --- |
| `Yvee<TData>` | Creates an app with typed data, routes, guards, loading state, head defaults, sockets and client/server rendering. Use `render()` in a browser, `server()` for SSR, and `dispose()` to release the current mount. |
| `YveeOptions` | App construction settings: route `base`, browser `history`, stable root `id`, and optional client entry `index`. |
| `MountOptions<TData>` | Browser mount settings for root `id`, client `data`, wrapper `class`, hydration and CSP `nonce`. |
| `Layout` | Async-capable function that wraps the root content state in a DOM context. |
| `Page<TData>` | Base route controller. Override `fetch`, `body`, and `head`; each instance has URL/params/data/status/error and a `resources` disposal scope. |
| `PageFetchContext<TData>` | Fetch input: parsed Yvee URL, string params, request data, abort signal and page-owned resources. |
| `MissingPage` | Default 404 controller rendered when no page route matches, unless the app registers another page for that status. |
| `FailurePage` | Default 500 controller rendered after a page load/render failure when no custom error page applies. |
| `page(path)` / `route(path)` | Class decorators that register page route metadata; `route` is the common page alias. Registration occurs when the decorated class is passed to `app.register()`. |
| `error(status)` | Class decorator that associates a controller with an HTTP error status for later app registration. |
| `socketRoute(path)` | Decorator that registers a WebSocket controller route when its class is registered with the app. |
| `RouteBook` | Stores page and socket route registrations, matches paths, and lists registered entries. |
| `RouteEntry<T>` | One registered route's pattern, transport and controller type. |
| `RouteMatch<T>` | A matched route entry and its decoded string parameter values. |
| `Constructor<T>` | Constructor type used by route registration APIs. |
| `Transport` | Route kind: `page` or `socket`. |
| `interpolate(pattern, params)` | Fills named route segments from supplied parameter values. |
| `toURL(value)` | Parses a string or URL into Yvee's normalized path, search, hash and query parameters. |
| `normalizePath(path)` | Normalizes leading, repeated and trailing slashes in a route path. |
| `YveeURL` | Parsed URL shape containing normalized `path`, `search`, `hash`, and `URLSearchParams`. |

### Guards

| Export | Description |
| --- | --- |
| `Guard<TApp,TPage,TData>` | Sync or async route decision callback. It can allow, stop, or redirect based on the supplied context. |
| `GuardContext<TApp,TPage,TData>` | Per-transition app, page, URL, readonly string params, data and abort signal. |
| `GuardResult` | `allow`, `stop`, `redirect` with optional replace behavior, or `void` to continue. |
| `GuardApp<TData>` | Minimal app shape with data and reactive URL for guard typing. |
| `GuardFactory<Args,Context>` | Typed factory for producing reusable guards from configuration. |
| `createGuard(factory)` | Preserves a typed factory for guards that capture application configuration. |
| `use(...guards)` | Class decorator attaching guards to a page controller in declaration order. |
| `requireGuard(predicate,fallback)` | Allows when a boolean predicate passes; otherwise returns a stop or configured/context-derived redirect. |
| `allGuards(...guards)` | Runs guards sequentially and returns the first stop/redirect decision. Checks cancellation around each guard. |
| `whenGuard(predicate,guard)` | Runs a guard only when its condition passes. |
| `paramsGuard(validators,fallback)` | Requires each named route parameter to exist and pass its sync/async validator before page fetch. |
| `ContextGuard<Context>` | Guard function type for a chosen context shape. |
| `GuardPredicate<Context>` | Sync or async predicate used by conditional guard helpers. |
| `GuardFallback<Context>` | Stop/redirect result or a callback that derives one from guard context. |
| `GuardRejection` | Stop or redirect subset of `GuardResult`. |

Client guards are destination entry checks. Unsaved-change departure checks,
session readiness and active-route revalidation are future design work described
in [guard-design.md](docs/guard-design.md).

### Server rendering and document head

| Export | Description |
| --- | --- |
| `ServerOptions<TData>` | SSR app options including document root metadata, data defaults and a per-request `dataFactory`. |
| `ServerRequest<TData>` | One render request: URL, optional data/status, CSP nonce and abort signal. |
| `ServerDataContext<TData>` | Request data-factory input with normalized signal and `onDispose` registration. |
| `ServerRenderer<TData>` | Callable HTML renderer with `withStatus()` for the HTML and status pair. |
| `HeadConfig` | Document metadata and resources: title, base, meta, links, scripts, styles, CSS/JS URLs and reactive DOM elements. |
| `HeadResult` | Head input accepted from a page or app: `HeadConfig`, DOM node, trusted style string, or nothing. |
| `HeadDefaults` | Accumulates app-level head values; `head()` adds defaults inherited by page head values. |
| `applyHead(config,owner,options)` | Mounts owned head nodes in a browser and returns a cleanup object with stylesheet readiness, deferred activation and cancellation. |
| `serializePayload(value)` | Safely serializes JSON-compatible bootstrap data for an HTML script context. |
| `renderJSONScript(value,{id,nonce})` | Produces a non-executable JSON script element with escaped payload and optional CSP nonce. |

SSR copies/freezes plain data as documented in [SSR request ownership](#ssr-request-ownership). `snapshotData` is an internal helper and is not a supported package export.

### Reactive state, references and lifecycle

| Export | Description |
| --- | --- |
| `State<T>(value,options)` | Creates a reactive value with `Object.is` equality by default, async `flush()`, optional error reporting and abort signal. |
| `RecState<T>(record)` | Creates reactive record state with key-level `set`, `delete` and `entries` operations. |
| `SetState<T>(values)` | Creates reactive set state with `add`, `delete`, `has` and `clear` operations. |
| `QState<T>(value,verify?)` | Deprecated compatibility constructor. Defaults to notifying every assignment; prefer `State(value,{equals:false})`. |
| `Stateful<T>` | Concrete event-target implementation behind `State`; most consumers should use the factory. |
| `StateOptions<T>` | State equality, error callback and event-listener options. Equality callbacks return true to keep the existing value. |
| `Equality<T>` | Comparator contract used by state assignments. |
| `shallowEqual(a,b)` | Compares own enumerable string/symbol properties one level deep using `Object.is`. |
| `IStateful<T>` | Read/write state interface with `value`, structured `clone` and async `flush`. |
| `IRecStateful<T>` | `IStateful` plus record mutation methods. |
| `ISetStateful<T>` | `IStateful<Set<T>>` plus set mutation methods. |
| `Derived(inputs,compute,options)` | Creates read-only derived state from explicit dependencies. Await installation; calculations are synchronous. Call `dispose()` or attach a scope/signal. |
| `DerivedValue<T>` | Read-only derived state interface with `value`, `clone`, `flush` and `dispose`. |
| `DerivedOptions<T>` | State equality/error options plus optional disposal scope. |
| `StateHook(callback,states,options)` | Subscribes to state changes, optionally runs initially, and returns cleanup. |
| `StateLoaded(callback,states,options)` | Runs after current successful state bindings/hooks and returns cleanup. |
| `StateEffect(callback,states,options)` | Runs cooperative async work with a signal/currentness check; newer updates abort earlier work. |
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

### Scopes and stored objects

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
| `Stored<T>` | Legacy shallow-sealed object helper with one-time `bind`, nested `set`, `safe`, and callback wrapper `fn`. It is not reactive storage. |
| `successStatus<T>` | Generic success response shape with `success`, `data` and optional message. |
| `errorStatus` | Generic error response shape with code/message and additional fields. |

### Browser storage, IndexedDB and network

| Export | Description |
| --- | --- |
| `BrowserStore` | JSON wrapper for local or session storage with staged/immediate writes, versioned values and cross-document watchers. |
| `local` / `session` | Preconfigured `BrowserStore` instances for `localStorage` and `sessionStorage`. |
| `StoredValue<T>` | Staged JSON value. Assign/set changes memory; `save()` persists and `remove()` deletes its key. |
| `VersionedValue<T>` | Validated versioned-key accessor with sequential migrations, fallback, set/remove and event watching. |
| `StorageSchema<T>` | Version, type-guard validator, fallback factory and destination-version migration map. |
| `StorageChange` | Native storage-event key and raw old/new JSON strings. |
| `StorageWatchOptions` | Abort signal or disposal scope for a storage-event listener. |
| `IndexedDatabase.open(name,version,schemas,options)` | Opens/upgrades a browser IndexedDB database and returns repositories for registered schema objects. Call `close()` to release the connection. |
| `OpenOptions` | IndexedDB factory override, blocked-upgrade callback and synchronous upgrade transaction callback. |
| `Schema<T>` | Typed object-store schema with one primary column, validation defaults and index declarations. |
| `Column` / `ColumnType` | IndexedDB field definition and its supported value-type name. |
| `t` | Column builders: text, safe integer, finite number, boolean, timestamp, structured-clone JSON and generated serial key. |
| `DbRepository<T>` | Async store operations: insert/put/find/findAll/index query/count/update/delete/clear. Each operation uses its own transaction. |
| `requestJSON<T>(input,options)` | Fetches and parses JSON, checks HTTP status, validates through a caller type predicate, forwards cancellation and supports bounded safe-method retries. |
| `JSONRequestOptions<T>` | Fetch options plus required validator and optional retry policy/custom fetch implementation. |
| `RequestRetry` | Additional-attempt count and fixed retry delay for eligible idempotent methods. |
| `HTTPError` | Error carrying the non-success `Response` from `requestJSON`. |
| `SocketHub` | App-owned WebSocket route loader, reconnect policy, unload and close-all manager. |
| `SocketController` | Base route controller with lifecycle callbacks, JSON sending and typed/validated message handling. |
| `SocketLoadOptions` | Socket abort signal and optional bounded reconnect policy. |
| `JsonMessageOptions<T>` | Socket payload type guard and parse/validation/handler error callback. |
| `MessageFailure` | Socket error phase: parse, validation or handler. |
| `eventStreams(url,handlers,options)` | Opens a dedicated native EventSource and closes it with its returned stream or abort signal. |
| `StreamHandlers` | Named native EventSource callbacks. |
| `StreamOptions` | Native EventSource credentials plus optional abort signal. |
| `EventStream` | Explicit shared EventSource owner; closing an owner releases only its callbacks and the last owner closes the shared connection. |
| `eventStream(...)` | Deprecated shared-stream convenience alias; prefer `eventStreams` for dedicated connections. |

See [the IndexedDB guide](src/core/indexeddb/README.md) for schema examples and
data lifetime guidance. IndexedDB remains browser-managed persistent storage;
application expiry requires explicit deletion.

### DOM, TSX and browser element helpers

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
| `renderDom(value,idm?)` | Converts a DOM tree into markup plus deferred browser binding instructions. |
| `RenderedDOM` / `renderedDom` | Markup, binding instructions and optional root ID returned from rendering. Lowercase alias is retained for compatibility. |
| `Idm` | Deterministic ID and CSP-nonce context used while rendering DOM trees. |
| `OZ` / `Wizard` | Binding instruction collection and shared browser activation manager. These are lower-level renderer APIs; ordinary apps should use `Yvee.render`. |
| `CTX`, `CATT` | Lower-level child-context and element-attribute renderer helpers. |
| `setNestedDOMRenderer(renderer)` | Installs the renderer used for nested values and returns a cleanup that clears it if still current. This is package-global configuration. |
| `$<Element>(selector,parent?)` | Queries one element and wraps it in `Elem`; returns undefined when no match or when no document exists. It also wraps an existing element directly. |
| `Elem<Element>` | Chainable browser element wrapper for class, event, content, query, animation and attribute/property operations. `insert().HTML()` and raw property APIs require trusted input. |
| `Elements` / `TagNames` | Union types of supported HTML/SVG element instances and tag names. |
| `_$<Element>` / `$_<Element>` | Optional and required `Elem` wrapper aliases. |
| `Toggled(condition,value,otherwise?)` | Returns one of two values according to a boolean condition. |
| `setContentRenderer(renderer)` | Installs an application content renderer for `$` helpers and returns a conditional reset function. |
| `renderContent(value,parentId?)` | Renders through the configured content renderer or escapes a value as text by default. |
| `ContentRenderer` / `RenderedContent` | Renderer callback and its HTML plus optional async commit operation. |
| `CSSStyle` | Style-object type accepted by element helpers. |
| `ElementAttributes` | Mapping from HTML/SVG tag names to their typed attribute interfaces. |
| `validateAttribute(name,value)` | Enforces the renderer's attribute-name, event-attribute and URL policy; throws for rejected values. |
| `inlineContent(tag,value)` | Validates trusted inline script/style content against HTML parser breakouts. It is not a sanitizer for untrusted code. |

The root entry also re-exports typed HTML/SVG attributes, events, style values,
and the `$` query/class/attribute/event/animation helpers. `src/utils.ts`,
runtime submodules and renderer staging helpers are implementation modules, not
supported root exports unless explicitly listed here.

### Public API compatibility and deprecations

Import consumer APIs from `yvee`; `@/index` in examples means the root source
entry during development. `@/yvee` is the narrower app entry. The package does
not currently promise every source file as an importable package subpath.

`QState` and `eventStream` remain for compatibility with deprecation guidance.
`Stored`, lowercase `renderedDom`, and lower-level DOM renderer exports remain
available but are less convenient than `Scope`/`State`, `renderDom`, and app
mounting respectively. State, storage, SSR, CSP, network, lifecycle and guard
behavior are described in the sections above.

`QState` is deprecated; migrate to `State(value, { equals: false })` for its
historic always-notify default, or normal `State` for identity equality.
`eventStream` is also deprecated as described above. Neither alias is removed.
Storage's staged and immediate operations have distinct behavior and both remain
supported. Low-level exports are retained for compatibility; new application
code should use the documented entry points and avoid depending on private maps.

`app.head()` accepts the same head result as `Page.head()`: a DOM node, a style
string, or a `HeadConfig` record. Use DOM nodes for shared markup and reactive
head attributes; existing record-based metadata remains supported.

Run `bun run test:types` for consumer TSX, context inference and expected-invalid
calls. This checks root source exports and types; bundled declaration/package
artifact validation remains part of the separate `builder.ts` workflow.

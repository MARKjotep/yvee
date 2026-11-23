# Data

Yvee includes small, explicit helpers for browser persistence and network
traffic. They are exported from `yvee` and work without a framework adapter.

Related guides: [State](state.md) for reactive values, [Scopes](scopes.md) for
shared services, and [Rendering](rendering.md) for request-owned data.

## Browser storage

`local` and `session` are `BrowserStore` instances backed by `localStorage` and
`sessionStorage`. Values are stored as JSON. Missing or unreadable entries use
the fallback; a stored `null` remains `null`.

```ts
import { local, session } from "yvee";

local.set("theme", "dark");
const theme = local.get("theme", "light").value;

local.get("theme", "light").set("dark").save();

session.set("draft", { title: "Untitled" });
const hasDraft = session.has("draft");
session.remove("draft");
```

`BrowserStore` methods:

- `get(key, fallback?)` returns a `StoredValue`; `.value` is the current value.
- `get(key, validate)` returns a validated `StoredValue`; `.value` is the value or `undefined`.
- `set(key, value)` writes immediately and returns the `StoredValue`.
- `remove(key)` deletes the entry.
- `has(key)` reports whether the key exists.
- `versioned(key, schema)` creates a validated versioned accessor.
- `watch(key, callback, options?)` listens for native `storage` events.

`StoredValue<T>` is a staged value. Assigning `.value` or calling `.set()`
changes memory; `.save()` persists and `.remove()` deletes its key. `.as`
provides `str()`, `int()`, `float()`, `bool()` and `json()` conversions.

Writes and removals are explicit and propagate storage errors to the caller.
Without a browser, writes do nothing and reads use the fallback. Types are
compile-time hints; pass a type predicate as the second argument to validate
untrusted stored JSON:

```ts
import { local } from "yvee";

const isSession = (value: unknown): value is { token: string } =>
  typeof value === "object" &&
  value !== null &&
  "token" in value &&
  typeof value.token === "string";

const session = local.get("session", isSession).value; // { token: string } | undefined
```

A validating `get` returns `undefined` when the entry is missing, unreadable or
fails the predicate. It leaves rejected entries in storage, so call `.remove()`
on the returned `StoredValue` to discard them. A function argument is always
treated as a validator, so use a non-function fallback with the two-argument
form.

### Versioned values

For validated values with explicit migrations, use versioned keys:

```ts
import { local } from "yvee";

const theme = local.versioned("theme", {
  version: 2,
  validate: (value): value is { dark: boolean } =>
    typeof value === "object" &&
    value !== null &&
    "dark" in value &&
    typeof value.dark === "boolean",
  fallback: () => ({ dark: false }),
  migrations: { 2: (previous) => ({ dark: previous === "dark" }) },
});

const preference = theme.get();
theme.set({ dark: true });
const stop = theme.watch(
  (change) => console.log(change.newValue),
  { scope: app.resources },
);
```

This reads `theme:v2`, or migrates `theme:v1` and saves `theme:v2`. Versions
start at 1. Migration entries are destination versions and run in sequence from
the newest existing older key. The final result must validate before it is
saved. Missing steps, invalid data and failed writes throw; older keys remain
available. Existing unversioned keys require an explicit application migration
to `key:v1`. Fallbacks are validated and are not automatically saved. `remove()`
removes only the current version; remove old keys too when permanently
discarding a migrated value, since a later `get()` can migrate them again.

### Watching storage events

`local.watch(key, callback, { signal, scope })` and `session.watch` observe
native `storage` events, including a `key: null` event for another document's
clear. Changes contain raw `oldValue`/`newValue` strings. They do not update
local state or notify for same-document writes. Local storage events reach other
same-origin tabs; session storage events are limited to documents sharing the
tab's session storage area. Stop the watcher explicitly or give it a scope or
signal.

## IndexedDB

For structured drafts, temporary caches and indexed records, use
`IndexedDatabase`, `Schema`, `t` and `DbRepository`. They are browser-only and do
not open a connection during module loading.

```ts
import { IndexedDatabase, Schema, t } from "yvee";

interface Note {
  id: number;
  title: string;
  category: string;
  done: boolean;
  createdAt: Date;
}

const schema = new Schema<Note>("notes", {
  id: t.serial().primary,
  title: t.text().notNull,
  category: t.text().index,
  done: t.boolean().default(false),
  createdAt: t.timestamp().defaultNow,
});

const db = await IndexedDatabase.open("client-app", 1, [schema], {
  onBlocked: () => console.info("Close older tabs to finish updating local storage."),
});
const notes = db.repository(schema);

const id = await notes.insert({ title: "First note", category: "work" });
const note = await notes.find(id); // Note | undefined; includes the generated id
await notes.update(id, { done: true });
```

`IndexedDatabase.open(name, version, schemas, options)` opens or upgrades a
database and returns repositories for registered schema objects. Call `close()`
to release the connection. `Schema<T>` declares one primary column, validation
defaults and indexes. `t` builds text, safe-integer, finite-number, boolean,
timestamp, structured-clone JSON and generated serial columns. `DbRepository`
provides `insert`, `put`, `find`, `findAll`, `findByIndex`, `count`, `update`,
`delete` and `clear`; each operation uses its own transaction.

IndexedDB persists until explicitly deleted or evicted; closing it does not
expire temporary data. Register connections with `app.resources.own(db)`:

```ts
app.resources.own(db);
```

See the [IndexedDB guide](../src/core/indexeddb/README.md) for upgrades,
indexes and cleanup.

## Validated JSON requests

```ts
import { requestJSON } from "yvee";

const total = await requestJSON("/api/total", {
  signal: context.signal,
  validate: (value): value is number =>
    typeof value === "number" && Number.isFinite(value),
  retry: { attempts: 2, delayMs: 100 },
});
```

`requestJSON` forwards Fetch options, requires a validator and checks HTTP
status before parsing JSON. Non-success responses throw `HTTPError` with the
original `response`; JSON parse failures and validator errors propagate, and a
false validator result throws `TypeError`. Successful bodies must contain JSON.
Signals are forwarded, inherited from a `Request` when unspecified, and checked
before attempts and after body parsing. An optional `fetch` transport supports
tests and application adapters.

Retries default to zero. Up to five additional attempts are allowed for bodyless
GET/HEAD/OPTIONS requests, with a fixed, abortable delay. Network `TypeError`s
and 408/429/500/502/503/504 responses may retry; parsing and validation never
retry. Retry responses are cancelled before waiting. Other methods reject a
retry policy before sending. There is no automatic retry-after policy or token
handling outside the CSRF option below.

`JSONRequestOptions<T>` extends `RequestInit` with the required `validate`,
optional `retry`, optional `fetch` and optional `csrf`. `RequestRetry` has
`attempts` (0–5) and an optional `delayMs`.

### CSRF tokens

```ts
requestJSON("/api/items", {
  method: "POST",
  body: JSON.stringify({ title }),
  validate: (value): value is { id: number } =>
    typeof value === "object" && value !== null && "id" in value,
  csrf: true,
});
```

`csrf: true` reads the `csrf_token` cookie, then the content of a
`meta[name="csrf-token"]` tag, then mints a token from `GET /csrf` (accepting
`csrfToken` or `token` in the JSON response). Minted tokens are cached for the
page lifetime. The token is sent in the `x-csrf-token` header and, when the
request has a JSON body, in the `csrfToken` field. A field already present in
the caller's body is never overwritten. Bodyless requests only receive the
header.

Override the defaults with `csrf: { header, field, endpoint }`;
`endpoint: false` disables minting. Without a browser (`document` unavailable)
the cookie and meta sources are skipped; minting still uses `endpoint`, which
must then be a URL the server can reach. Disabling minting without a readable
token rejects with `TypeError` before the target request is sent. Mint failures
are not cached. `header` defaults to `x-csrf-token`, `field` to `csrfToken` and
`endpoint` to `/csrf`.

### Reading cookies

```ts
import { readCookie } from "yvee";

const token = readCookie("csrf_token"); // string | undefined
```

`readCookie(name)` splits `document.cookie`, matches the exact cookie name, and
decodes the value once. It returns `undefined` when the cookie is absent or
`document` is unavailable (server rendering). Malformed percent-encoding returns
the raw value instead of throwing.

### Form submissions

```ts
import { requestForm } from "yvee";

const result = await requestForm<{ id: number }>("/api/items", {
  data: { title },
  csrf: true,
});

if (result.ok) console.log(result.data?.id);
else console.error(result.error);
```

`requestForm` posts `data` as JSON or a raw `body` such as `FormData`, reusing
`requestJSON` (including `csrf`). It never throws. Failures resolve to
`{ ok: false, status, error }` using the server's `{ error }`/`{ message }` text
when present; network failures report status `0`. A 204/205 success has no
`data`. `validate` is optional; without it the parsed JSON is asserted as `T`.
`body` takes precedence over `data`, and the method defaults to `POST`.

### HTTP errors

`HTTPError` exposes `body?: unknown`, parsed from a clone of the response when
the error is constructed, so the original `response` remains readable. The
message is an explicit constructor message, then a string `error` or `message`
field on the parsed body, then `HTTP <status> <statusText>`. Non-JSON error
bodies leave `body` undefined.

## WebSockets

`SocketHub` owns WebSocket connections for an app. `SocketController` is the
base route controller with lifecycle callbacks, JSON sending and typed message
handling.

```tsx
import { SocketController, socketRoute } from "yvee";

@socketRoute("/chat")
class ChatSocket extends SocketController {
  override open() {
    this.onMessage<{ text: string }>(
      (message) => console.log(message.text),
      { validate: (value): value is { text: string } =>
          typeof value === "object" && value !== null && "text" in value },
    );
  }
}

app.register(ChatSocket);
const controller = app.socket.load("/chat", { signal: app.resources.signal });
controller.sendJson({ text: "hello" });
```

`controller.send(value)` serializes and sends a frame immediately when the
socket is open, and otherwise queues it in FIFO order until the connection
opens. The `open` hook runs first, then the queue flushes, so a join frame sent
from `open` reaches the server before frames queued earlier. Queued frames
flush exactly once on open, including after a retry reconnect. `send` never
throws: serialization and native send failures are logged, and frames sent
after the hub disposes the controller are dropped. The queue is unbounded while
waiting, so avoid producing frames faster than the connection can open.
`sendJson(value)` stays fire-and-forget: it drops the frame unless the socket
is open at call time.

`controller.state` is a reactive `IStateful<"connecting" | "open" | "closed">`,
bindable like `app.loading`. It starts `"connecting"`, becomes `"open"` when
the native socket opens (flushing queued frames), and `"closed"` when the
socket closes or the hub disposes the controller; a retry moves it back to
`"connecting"`.

```ts
controller.send({ text: "queued until open" });
controller.state.value; // "connecting" | "open" | "closed"
```

`SocketHub.load(path, options)` accepts relative paths and HTTP(S)/WS(S) URLs,
matches the URL pathname against socket routes, converts HTTP to WS and HTTPS to
WSS, and preserves explicit `ws:`/`wss:`. It reuses an existing controller for
the same load key, including during backoff. Options belong to the first load;
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
socket callback failures are caught and reported; they are never treated as JSON
parse failures.

## Event streams

`eventStreams(url, handlers, { signal, withCredentials })` creates a dedicated
EventSource and returns it. Its `close()` removes registered callbacks and abort
listeners, then closes the source exactly once. It uses native SSE reconnection
until close/abort; it does not add another retry loop. Server-supplied SSE retry
intervals follow native EventSource behavior. Message payloads are raw events;
validate their data in application code. Handler errors follow native event
semantics.

```ts
import { eventStreams } from "yvee";

const stream = eventStreams("/events", {
  message: (event) => console.log(event.data),
}, { signal: app.resources.signal });

// Later:
stream.close();
```

`EventStream` remains available for deliberate connection sharing. Each owner
removes only its callbacks; the final owner closes the shared source. Conflicting
credentials for the same shared URL throw. Use the owner's `close()`, rather than
closing its public shared `.stream` directly. The convenience `eventStream` is
deprecated in favor of `eventStreams` for dedicated connections; its historic
credentials default remains `true`. Dedicated `eventStreams` defaults to `false`.

## Related

- [API reference: browser storage, IndexedDB and network](api-reference.md#browser-storage-indexeddb-and-network)
- [State: resource ownership](state.md#resource-ownership)
- [IndexedDB guide](../src/core/indexeddb/README.md)

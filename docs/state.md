# State

Yvee's state layer is small and explicit. `State` holds a value, `RecState` and
`SetState` add keyed and set operations, and `Derived` computes read-only values
from declared dependencies. All of it is exported from `yvee`.

Related guides: [Scopes](scopes.md) for shared services, [Rendering](rendering.md)
for DOM bindings, and [Routing](routing.md) for page lifecycle.

## `State`

`State(value)` exposes `.value` for reads and assignments and `.clone` for a
structured copy. By default, assignments compare with `Object.is`: the same
object reference does not notify, while a new reference does. `NaN` equals
itself and positive and negative zero are different. Direct mutation of a
stored object does not notify; replace the value or use record methods.

```ts
import { State, RecState, SetState, shallowEqual } from "yvee";

const profile = State({ name: "Ada", city: "Manila" });
profile.value = { ...profile.value, city: "Cebu" };

// Skip new flat records whose own enumerable keys/values are unchanged.
const filters = State({ query: "", page: 1 }, { equals: shallowEqual });

// A custom comparator returns true to keep the previous value and skip work.
const item = State(
  { id: 1, label: "Ada" },
  {
    equals: (previous, next) =>
      previous.id === next.id && previous.label === next.label,
  },
);

const pulse = State(0, { equals: false }); // notify on every assignment
```

`shallowEqual` compares records and arrays using their own enumerable string
and symbol keys. It compares values with `Object.is`, without recursion or JSON
serialization. Nested objects must retain their references to compare equal.
Special objects such as dates and maps compare by identity.

`StateOptions` also accepts an `onError` callback, event-listener options and a
`signal`. `IStateful<T>` is the read/write interface (`value`, `clone`,
`flush`). `Stateful<T>` is the concrete event-target implementation.

### Migration note

`State()` no longer suppresses assignments of new objects based on recursive
content equality. Use `equals: shallowEqual` for flat records or supply a
comparator for a specific data model.

`QState()` remains as a deprecated compatibility constructor: by default it
notifies on every assignment, and `QState(value, true)` uses `Object.is`. Prefer
`State(value, { equals: false })` for new code.

## `RecState` and `SetState`

```ts
import { RecState, SetState } from "yvee";

const record = RecState({ name: "Ada", city: "Manila" });
record.set("city", "Cebu");

const selected = SetState<string>([]);
selected.add("featured");
```

`RecState().set()` notifies when the key is new or its value differs by
`Object.is`; `.delete()` notifies when an existing key is removed. `SetState()`
provides `.add()`, `.delete()`, `.has()` and `.clear()`, skipping changes that
have no effect.

## Derived state

```ts
import { Derived, State, batch } from "yvee";

const price = State(10);
const quantity = State(2);
const total = await Derived(
  [price, quantity],
  (price, quantity) => price * quantity,
  { scope: app.resources },
);

batch(() => {
  price.value = 12;
  quantity.value = 3;
});
await total.flush(); // total.value is 36
```

Await installation before updating inputs. Dependencies are explicit and fixed;
there is no implicit read tracking. Calculations are synchronous and pure, and
must return a new value or use an appropriate equality option for mutable data.
The returned value is read-only in TypeScript and supports normal DOM bindings
and downstream derived values. Batches expose final input values; a calculation
may run once per changed dependency, while equal output suppresses notification.

`flush()` waits for inputs and derived subscribers. Calculation failures
preserve the previous output and follow the input state's error/flush contract;
derived subscriber failures follow the derived state's `onError` contract. Use
`StateEffect` for async calculations and its abort/current-update checks, rather
than returning a promise from `Derived`. `dispose()`, scope disposal or an abort
signal removes input subscriptions; the last output remains readable.

## Async updates and `flush`

State values change synchronously. Assignments outside `batch` publish an
`updated` event immediately; framework hooks, DOM bindings and loaded callbacks
may finish asynchronously. `await state.flush()` waits for current framework
work on that state, including loaded callbacks and any updates they schedule.
It does not wait for arbitrary native event listeners, unrelated states, or
work a callback starts without returning its promise. Do not await a state's
`flush()` from inside that same state's subscriber.

```ts
import { State, batch } from "yvee";

const count = State(0, { onError: (error) => console.error(error) });

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

Subscriber failures are reported through `StateOptions.onError`, or a
cancelable `error` event on `Stateful`, with `console.error` as the default
reporter. They also reject `flush()`; observed errors are drained by that flush.
Multiple errors use `AggregateError`. Other registered subscribers are still
attempted. Native DOM event handlers follow browser error semantics and are
outside this channel.

## Hooks and effects

`StateHook(callback, states, options)` observes updates and returns a cleanup
function. It receives the current values whenever a subscribed state changes.
Pass `{ init: true }` if it should also run when the subscription is installed.
The returned cleanup stops the subscription; it is not a per-run cleanup
callback like the function returned from React's `useEffect`.

`StateLoaded(callback, states, options)` runs after current framework binding
work has completed. Keep and call cleanup functions when their owner is
disposed. A failed commit does not announce a successful load.

Use `StateEffect` when the callback starts asynchronous or otherwise
long-running work that should become stale when a newer state update arrives.
Each run gets an `AbortSignal` and an `isCurrent()` check. Pass the signal to
cancellable APIs such as `fetch`, and check `isCurrent()` before committing a
result. The returned cleanup stops the subscription and aborts the active run.

Choose `StateHook` for simple observation; choose `StateEffect` when
overlapping async runs need cancellation or stale-result protection. Ordinary
`StateHook` callbacks cannot roll back arbitrary application side effects.

```ts
import { StateEffect } from "yvee";

await StateEffect<[string]>(
  async (update, query) => {
    const response = await fetch(`/search?q=${encodeURIComponent(query)}`, {
      signal: update.signal,
    });
    const result = await response.json();
    if (update.isCurrent()) results.value = result;
  },
  [query],
  { scope: page.resources },
);
```

`StateHook`, `StateEffect` and `StateLoaded` return cleanup functions and accept
a `signal` or disposal `scope`. Default subscription IDs are unique; explicit IDs
replace the previous subscription with that ID on a state. An older cleanup
cannot remove a replacement. Failed initialization removes installed hooks.

A newer assignment supersedes pending work on that state. Framework DOM
bindings check ownership after asynchronous rendering and skip stale commits.
Superseded work no longer holds up `flush`; application promises must still
cooperate with cancellation to release their own external work.

`hook(...)` and `loaded(...)` are legacy tuple helpers for registering ordinary
or post-load hooks.

## Resource ownership

`DisposalScope` owns synchronous cleanups. `defer(fn)` registers a cleanup and
returns an idempotent function that releases it early. `own(resource)` accepts
objects with `dispose()` or `close()`. `listen(...)` and `timeout(...)` register
listeners and timers. `scope.signal` aborts on disposal. All cleanups are
attempted in reverse order; failures are collected in `AggregateError`. Adding
a cleanup after disposal executes it immediately. Async cleanup belongs in
server `onDispose`, or must be managed and awaited by application code.

Every `Page` owns `page.resources`; its fetch context also supplies `resources`
and a signal that ends with that page. Resources close after replacement, on
failed/stopped/redirected loads, on cancellation, or after SSR completes. Link
request work to the provided signal. A resolved page keeps its resources until
its body/head are replaced, rather than losing them as soon as fetch finishes.

`app.resources` owns resources for the current browser mount. Register them
after mounting or in browser lifecycle callbacks. `app.dispose()` and the
cleanup returned by `app.render()` remove bindings, global handlers, page
scopes, head nodes, app resources and all sockets owned by `app.socket`. Every
cleanup path is attempted even if another throws. Mounting again creates a
fresh app scope. A cleanup from an older mount cannot dispose the new mount.

```ts
import { eventStreams } from "yvee";

const stop = await app.render();
app.resources.own(eventStreams("/events", {}, { signal: app.resources.signal }));
// Later: stop() or app.dispose().
```

Independent helpers are not automatically app-owned: explicitly register an
`EventSource`, shared `EventStream` owner, subscription, timer or other resource
in the appropriate scope. Do not register request resources in a shared server
app scope; use `page.resources` or server `onDispose`.

## Navigation and commit behavior

Client navigation awaits the real root flush. Failed body or head activation
restores the last committed body and head where rollback succeeds, removes
staged head work and releases the failed page's resources. Failed rollback is
reported as an `AggregateError`; arbitrary code side effects cannot be undone.
Loading settles after commit and scroll restoration. Newer navigations cancel
older render ownership, including late `ready` cleanups.

See [Routing](routing.md) for route focus and announcements.

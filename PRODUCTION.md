# Yvee production planning

This is a planning review of the current repository, not a claim that Yvee is
production ready. It covers the complete package: core state, DOM rendering,
`$` browser helpers, and app runtime. Items below are proposed work unless
explicitly described as implemented.

## Current assessment and next production milestones

The completed work below establishes useful contracts and regression coverage.
It does not establish release readiness: the consumer type suite imports source,
the browser suite uses local fixtures, and the new helpers have initial rather
than exhaustive failure coverage. The following is proposed work. This review
is based on the repository, not a claim that the listed failures have all been
reproduced.

| Priority | Work | Current evidence / risk | Completion criteria |
| --- | --- | --- | --- |
| P0 | Reproducible package and clean consumer | `package.json` points to `dist` while consumer type tests alias `yvee` to source. Build tooling uses local `link:` dependencies, and there is no package export map or build/check script. Source checks alone cannot establish that a published package works. | Build from a clean install with pinned tooling; inspect the packed archive; install it in an isolated consumer; compile TSX and execute browser/SSR imports from that archive. Verify declarations, supported entry points, version format and absence of workspace-only paths. |
| P0 | Navigation and guard lifecycle | Guards are destination-entry checks. History is written before the destination is approved; Back/Forward already moves the history pointer. There is no leave phase or typed navigation completion result. | Define committed/stopped/redirected/superseded/failed outcomes and source/destination ownership. Add leave checks, history-index recovery and guard cancellation coverage. See the [guard proposal](docs/guard-design.md). |
| P0 | Failure containment and bounded waiting | Guards/page work can ignore abort and never settle. Runtime reporting calls application `onError` during recovery; a throwing reporter needs explicit containment. Body/head rollback has multiple asynchronous stages. | Test never-settling work, throwing reporters and cleanup failures at each phase. Define optional deadlines, abort races and a final recovery screen when rollback fails. No stale work may write into a replacement route or mount. |
| P0 | Security and redirect policy review | Shared rendering validation and CSP tests cover defined paths, but programmatic navigation/guard redirects use URL normalization without an explicit origin/base decision. Head staging may execute scripts before body commit. | Specify accepted navigation schemes/origins/base paths, safe return URLs and redirect-cycle diagnostics. Review script activation/rollback semantics, raw DOM escape hatches and sensitive SSR payloads. Add adversarial browser cases and obtain a focused external review before a stable release. |
| P1 | Storage reliability and data lifetime | Versioned local/session keys preserve old keys; local storage migrations are not atomic across tabs. IndexedDB `open` has blocked notifications but no signal/timeout. Repository reads assume stored record types, and unbounded reads load all results. | Define invalid/corrupt/unavailable/quota behavior and migration recovery. Add cancellable open with late-connection cleanup, TTL/pruning and identity/tenant namespaces. Provide bounded cursor pagination and validate/backfill old data. Define when multi-record transactions are needed. |
| P1 | State consistency under larger graphs | `Derived` subscribes to explicit inputs and can calculate once per changed dependency. Its flush follows input flushes; current cases do not define every diamond graph, subscriber feedback or concurrent flush/error-consumption outcome. | Specify whether derived observers can see intermediate values, detect/report feedback cycles, and test diamond graphs, shared dependencies, batch failures and disposal during flush. Decide whether subscriptions should install synchronously. Measure before adding a new scheduler. |
| P1 | SSR/deployment contract | SSR follows redirects internally, embeds a fixed document language and buffers complete HTML. The demo builds assets in memory and avoids caching, which is useful for development but does not exercise production deployment. | Define server-adapter redirects/status/headers, configurable document language and request deadlines. Test proxy base paths, deep-link fallback, hashed asset caching, old-tab/new-deployment compatibility and hydration across deployed assets. Treat streaming as a later design decision unless profiling requires it. |
| P1 | Diagnostics and observability | There is an `onError` callback but no structured route lifecycle trace with phase, duration, cancellation reason and correlation identity. | Add opt-in navigation/SSR/transport diagnostics with bounded memory and no default user-payload logging. Include guard/load/head/body/scroll phases, committed vs cancelled outcomes and a documented reporter-failure policy. |
| P1 | Full accessibility and browser lifecycle coverage | Axe checks a representative route, not all demo flows or custom controls. Current navigation cases do not establish BFCache, background/resume or long-lived application behavior. | Audit demo forms, dialogs, errors, loading/empty states, language and keyboard recovery. Add BFCache/pageshow, visibility changes, late font/image layout, unavailable storage and multiple history-owning apps. Include manual assistive-technology checks. |
| P1 | CI and release gates | Local passing runs provide a baseline, but this checkout has no checked-in CI workflow enforcing the source, browser and package checks together. | Run unit/type/build/package smoke checks and three-browser regressions in CI. Pin runtime/tool versions, preserve failure traces, verify lockfile installs and document supported browser/runtime versions and release/rollback steps. |
| P2 | Sustained performance and resource use | The 500-row fixture supports per-row bindings for that workload; it does not establish large-app memory or latency budgets. | Run repeated mount/navigation/update/disposal soak tests with slow network and CPU profiles. Track retained nodes, subscriptions, sockets, timers, heap trend and route latency distributions. Establish budgets from representative applications before adding reconciliation, prefetch or caching features. |

Recommended sequence: release-package validation first, then navigation/guard
contracts and failure containment, then storage/state/deployment hardening.
Observability and CI should grow alongside those changes. A large new feature
surface should not outrun validated ownership and recovery behavior.

### Guard brainstorming

The most useful additions are unsaved-change departure checks, session readiness,
query validation and revalidation of the displayed route after logout or
permission changes. Permission, guest-only, feature-flag and onboarding checks
can already be application recipes built on `requireGuard`.

Also consider cache-availability/offline, browser-capability, resource-access,
locale/canonical-URL and consent/eligibility guards. Each needs an explicit
fallback and SSR policy. Client permission guards improve interface behavior;
the server/API remains responsible for authorization. Avoid fixed role names,
token formats and hard-coded application routes in framework primitives.

The [guard design proposal](docs/guard-design.md) records each candidate's
inputs, fallback, fit with the current API, required lifecycle changes and
acceptance tests. Proposed helper names there are not new exports.

### Structural refactor completed in this review

The former 664-line `client/runtime.ts` now delegates to
[`client/runtime/`](src/yvee/client/runtime/README.md). `client.ts` coordinates
mounting and transitions; `view.ts` owns head staging and body/head rollback;
history, scrolling and accessibility each have their own module. The
coordinator is 402 lines, with the commit sequence kept together for review.

The former 308-line `rendering/head.ts` is split into
[`rendering/head/`](src/yvee/rendering/head/README.md): configuration/defaults,
DOM element rendering, browser activation/cleanup and stylesheet waiting.
The original `runtime.ts` and `head.ts` paths remain compatibility entry points.
These are structural changes; the proposed guard and production features above
are not implemented by the refactor.

Validation on November 19, 2026: **95 unit tests**, **69 browser cases** (23 per
engine in Chromium, Firefox and WebKit), the repository TypeScript check and
consumer type checks passed. The scroll unit case now exercises the extracted
history/scroll services without reaching through private runtime fields; browser
cases continue to exercise full navigation and lifecycle behavior. Browser entry
bundling and declaration emission to temporary output directories also passed.

## Implemented changes

- State uses `Object.is` by default, with shallow/custom equality or explicit
  always-notify behavior. Record key updates use `Object.is` too.
- Removed the old recursive diff and set-equality helpers from shared utilities,
  unused utility predicates/aliases, and the disconnected `MatchedPage` type.
- Guards have a dedicated folder, reusable conditions/composition/parameter
  validation, and abort checks around guard execution.
- Browser storage supports direct set/remove/has operations and preserves null.
- Browser availability checks in state and selectors happen at call time.

Public consumer APIs are not dead code simply because the demo does not use
them. Storage, references, scopes, element helpers, and EventSource utilities
remain available. Future removal should consider exported API compatibility.

## Completed implementation milestones

| Priority | Area | Evidence / gap | Completion criteria |
| --- | --- | --- | --- |
| 1 — implemented | Browser lifecycle | Playwright runs the real SSR/client fixture in Chromium, Firefox and WebKit. Hydration normalization, reactive void elements, scroll completion, nested navigation ownership and stale disposer handling are fixed. | Browser coverage includes hydration, races, history/scroll, stylesheet failures/timeouts/cancellation, keyboard/native links, disposal and multiple apps. |
| 1 — implemented | Rendering trust boundaries | Shared attribute/URL validation covers DOM rendering, reactive updates, head configuration and `$` attribute setters. Inline code has parser-breakout checks; JSON helpers and response nonces are public. | Adversarial unit/browser cases cover text, attributes, head, bootstrap data, inline code and CSP. See the trust contract in `Yvee.md`. |
| 1 — implemented | SSR isolation | Plain request data uses copied frozen snapshots; `dataFactory` owns mutable services and cleanup. `Scope.create` provides independent containers; the Features demo creates state per page. | Concurrent user payloads, redirects/errors, deterministic IDs, factory cleanup and cancellation have regression coverage. Application code must follow the documented ownership contract. |
| 2 — implemented | Async updates and errors | `flush`, explicit `batch`, error reporting and abortable `StateEffect` define update completion. Navigation awaits real commits and restores committed body/head after failures. | Unit/browser coverage includes rejected hooks, cancellation, blocked renders/ready callbacks and body/head rollback. |
| 2 — implemented | Public API contracts | Supported API families, legacy aliases, storage/SSE differences and error behavior are documented. Global app guards retain app/page/data types. | `test:types` checks consumer TSX, inferred contexts and expected-invalid calls; TypeScript is a dev dependency. |
| 2 — implemented | Lifecycle ownership | `DisposalScope`, page scopes, `app.resources` and `app.dispose` provide explicit ownership. Late renderer cleanups cannot attach to replacement elements. | Repeated/disrupted mount and navigation tests check bindings, page listeners and owned transports; cleanup errors do not skip other resources. |
| 2 — implemented | Network helpers | Socket JSON parsing, validation and handler failures have distinct reporting. Secure protocols are preserved; retries are opt-in and bounded. Dedicated SSE supports abort and callback cleanup. | Tests cover WS/WSS conversion, validation/error phases, retry cancellation and shared/dedicated SSE ownership. |
| 3 — implemented | Rendering performance | Matching HTML is reused during hydration; a stateful list update re-renders its bound child contents. | Browser measurements compare whole-list replacement with per-row bindings at 500 rows. Per-row bindings retain nodes and avoid the cost; no keyed reconciler is warranted by this fixture. |
| 3 — implemented | Accessibility | App navigation restores scroll and now applies route focus, title announcement, and reduced-motion scroll behavior. | Browser coverage checks keyboard route focus, live title announcement, hash focus, and reduced-motion handling in Chromium, Firefox and WebKit. |

The build remains handled by `builder.ts`. Priority 1, priority 2 and priority 3
implementation and regression coverage are in place. Performance decisions use
the browser fixture measurements recorded below.

## Priority 1 implementation and validation

Verified on November 19, 2026: **62 unit tests passed**, **39 browser cases
passed** (13 per engine in Chromium, Firefox and WebKit), and
`tsc --noEmit --pretty false` passed. Browser binaries for this local run were
installed under `/private/tmp/yvee-playwright`; normal setup is documented below.

The browser suite is in `browser/`, with a Bun SSR/client fixture built in memory
and a Playwright runner configured for Chromium, Firefox and WebKit. See
[browser/README.md](browser/README.md) for setup, running one engine, and failure
traces. `bun test` remains the unit/simulated-browser suite; `tsc --noEmit` checks
the source, fixtures and tests.

Browser checks cover matching-node reuse and mismatches, slow navigation losing
to a newer route, repeated history entries and scroll restoration, stylesheet
failure/timeout/cancellation, native and keyboard link behavior, disposal during
navigation, repeated mounting, stale mount disposers, nested app links, head
validation failures, reactive head/body attributes, JSON handoff and real CSP.

Hydration now compares browser-normalized markup. Void elements with bindings
receive generated IDs. Route loading settles after scroll restoration. Head
validation failures remove staged nodes and report through `onError`. Link
interception belongs to the nearest mounted app; `history: false` apps leave
history and route scroll restoration to the primary app. The document title is
shared: the last committed title wins, and disposal restores the previous title
only while the app still owns it.

Rendering uses shared escaping and attribute/URL rules. Script/style bodies are
trusted code with explicit HTML-parser breakout checks. `serializePayload` and
`renderJSONScript` provide the supported JSON bootstrap path. Server requests,
client mounts and `applyHead` accept a nonce. See the detailed input and CSP
contract in [Yvee.md](Yvee.md#rendering-trust-and-csp).

SSR copies and freezes plain input data recursively without freezing the caller's
objects. Page top-level data remains assignable; nested input data is read-only.
For request-owned mutable data/services, `server({ dataFactory })` creates the
request context and registers cleanup through `onDispose`. Cleanup runs in reverse
registration order on success, failure and cancellation; cleanup failures preserve
an original render error in an `AggregateError`. `Scope.create` allocates a local
container without modifying the global Scope/Field registry.

Concurrent tests interleave fetch/body/head work with distinct user payloads,
redirects and error pages. They verify request values and stable generated IDs.
Factory tests check independent scopes and cleanup on render/factory failures and
abort. SSR only collects local binding descriptions; it does not stage them in
`Wizard` or install browser listeners. Module renderer setup remains shared.
The Features lazy view now uses state owned by its page instance; lazy head
factories receive `{ page }` too.

These guarantees depend on application ownership: do not store user data in
`app.data`, global Scope/Field, app head defaults or module-level mutable values.
Guards must read request context data, and data factories must return fresh
request-owned resources. Arbitrary application globals and direct/raw DOM APIs
are outside the isolation and escaping guarantees.

## Priority 2 implementation and validation

Verified on November 19, 2026: **73 unit tests passed**, **54 browser cases
passed** (18 per engine in Chromium, Firefox and WebKit),
`bun run test:types` passed and the repository TypeScript check passed. This run
includes the Bun sample with a persistent browser-session check across links.

State provides synchronous values with explicit `batch`, an awaitable per-state
`flush`, subscriber error reporting and abortable `StateEffect` contexts. Flush
waits for current framework work, rather than a timer tick. Stale DOM renders
check both update and binding ownership; cancelled `ready` callbacks release
late-acquired cleanups instead of binding to replacement nodes. Navigation
restores the committed body/head after body, readiness or head-activation errors.

`DisposalScope` owns listeners, timeouts, subscriptions and closeable resources.
Every page owns a scope, including SSR pages. Stopped, failed, replaced and
cancelled pages release it. Browser app disposal attempts every cleanup, then
reports errors together. App-owned SSE resources close alongside the app socket
hub; independent helpers need explicit ownership registration.

Socket loads preserve `wss:`, convert HTTP(S) appropriately, and match URL
pathnames. JSON errors distinguish parsing, validation and application callbacks.
Optional reconnect policies have bounded exponential backoff and cancel their
timers on abort/unload. Dedicated EventSources remove handlers on close/abort;
shared EventStream owners retain the connection until the last owner closes.

The public guide now defines supported API families, deprecations and error
behavior. `QState` and the `eventStream` convenience alias remain available with
deprecation annotations. `Yvee<T>.use` retains typed app/page/data contexts, and
`bun run test:types` validates consumer TSX and incorrect calls using root source
exports. Internal route/decorator erasure remains at heterogeneous registration
boundaries; this does not make arbitrary route-specific payloads runtime-validated.

The actual Bun example is included in the browser suite. Its server now builds
client assets in memory at startup and avoids caching its entry/assets so the
browser runtime matches the SSR source. Run `bun run demo` and restart after
source edits. The regression test checks that persistent navigation links change
pages without a full reload. Client startup errors render through `textContent`.

See [Yvee.md](Yvee.md#async-state-updates) for batching/flush and cancellation
semantics, resource ownership, API compatibility and transport retry contracts.

## Priority 3 implementation and validation

Verified on November 19, 2026: **73 unit tests passed**, **60 browser cases
passed** (20 per engine in Chromium, Firefox and WebKit), `bun run test:types`
passed and the repository TypeScript check passed.

After each successful client-side route commit, Yvee focuses the route's
`[data-yvee-focus]` target, otherwise its first `h1`, otherwise the app root when
that root is not `body`. A temporary `tabindex="-1"` makes a heading focusable
without adding it to the tab order. Hash targets take precedence. Initial page
load does not steal focus. A polite, atomic status region announces the committed
document title. Framework-controlled route scrolling disables CSS smooth scroll
when `prefers-reduced-motion: reduce` matches; navigation itself has no animated
transition.

The performance fixture renders 500 rows, measures five route commits and
compares a single row change using one list state versus one state per row. On
the latest local three-browser run, median route times were 128 ms in Chromium,
75 ms in Firefox and 129 ms in WebKit. A one-row change through the single list
state took 1.3 ms, 12 ms and 49 ms respectively and replaced the unchanged row
nodes. With per-row state bindings, the same change took 0.1 ms in Chromium and
below the reported 0.1 ms precision in Firefox and WebKit; both the changed and
unchanged `<li>` nodes remained mounted. Route timings include the local fixture
and its stylesheet request, so they are comparison baselines, not production
budgets.

The result supports finer state binding for frequently updated large lists. It
does not justify a keyed reconciler or list batching in the renderer: existing
per-row bindings keep updates localized with much lower measured cost. The
browser coverage and benchmark live in `browser/priority3.spec.ts`.

## Follow-up ideas implemented

Verified on November 19, 2026: **95 unit tests passed**, **69 browser cases
passed** (23 per engine in Chromium, Firefox and WebKit), `bun run test:types`
and `tsc --noEmit --pretty false` passed. Browser builds of the package entry
and standalone IndexedDB entry also passed. The native storage checks identified
and fixed WebKit's need to initialize a storage area before watching its events.

The five follow-up ideas now have initial implementations and documented
contracts:

| Area | Implementation | Validation and limits |
| --- | --- | --- |
| Validated requests | `requestJSON` forwards Fetch options/signals, checks status, parses JSON and requires a caller validator. `HTTPError` retains the response. | Unit tests cover HTTP/parse/validation failures, bounded retries and abort during backoff. Retries are opt-in, limited to bodyless GET/HEAD/OPTIONS and selected transient failures; no automatic Retry-After handling. |
| Storage schema and migrations | Existing `local` and `session` BrowserStore instances add `versioned()` keys with sequential migrations and runtime validation. `watch()` exposes native storage events independently of state. Core IndexedDB is exported through the package. | Migration failures preserve old keys. Unit tests cover transactions, upgrades, rollback, migration validation and watcher cleanup. Browser cases cover temporary IndexedDB drafts and real cross-tab notifications/session separation. Temporary IndexedDB data needs explicit expiry/deletion. |
| Derived state | `await Derived(inputs, compute, options)` installs explicit fixed dependencies and returns a TypeScript read-only value compatible with bindings and chained derivations. | Tests cover batched final values, equality suppression, chains, calculation errors and disposal. Calculations are synchronous; async work uses `StateEffect`. No implicit dependency tracking is introduced. |
| Accessibility audit | Axe checks an accessible SSR/hydrated route and its navigation destination for accessible names, landmarks, contrast and other enabled rules. Keyboard checks traverse the route's controls and verify navigation focus. | Runs in Chromium, Firefox and WebKit. This is a representative framework fixture audit; application pages, custom widgets and assistive-technology behavior still need application-specific audits. |
| Authentication example | `examples/auth.tsx` composes `requireGuard` with request-owned public identity and a login fallback. | Concurrent SSR tests cover anonymous and two distinct signed-in users. The server adapter owns session verification and API authorization; no token/session format is prescribed. |

Tests are grouped under `test/core`, `test/dom`, `test/network`, `test/storage`
and `test/yvee`; the runnable demo remains in `test/yvee-bun`. IndexedDB tests
moved out of source to `test/storage/indexeddb.test.ts` and are now included by
`bun test`. `fake-indexeddb` and `@axe-core/playwright` are development-only
dependencies. Browser suites remain in `browser/`.

The request, derived-state and storage contracts and usage examples are in
[Yvee.md](Yvee.md). See the [IndexedDB guide](src/core/indexeddb/README.md) and
[authentication example](examples/README.md) for ownership and integration.

## State migration notes

New equal-content object references now notify unless a comparator is selected.
Use immutable replacements, `RecState().set()`, or a deliberate comparator.
Comparators return true to suppress the assignment as well as notification.
They must be pure and should compare exactly the fields their subscribers use.

No recursive equality mode is included by default. Callers that need it can
supply a comparator with a defined policy for cycles and special object types.

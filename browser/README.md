# Browser regressions

From the repository root:

```sh
bun install
bunx playwright install chromium firefox webkit
bun run test:browser
```

Playwright builds the fixture in memory, starts its Bun server on
`127.0.0.1:3851` and the actual Bun demo on `127.0.0.1:3852`, and stops both after
the suite. The fixture has deterministic SSR
and excludes demo chat. Unit tests remain separate: `bun test` uses `test/` via
`bunfig.toml`.

Use `bun run test:browser --project=chromium` for one engine. All three engines
must pass for priority 1 validation. Failed runs keep traces under `test-results/`;
open one with `bunx playwright show-trace <trace.zip>`.

The tests exercise node reuse during hydration, mismatches, asynchronous
navigation, repeated history entries and scroll, keyboard/native links,
stylesheet failures/timeouts/cancellation, app disposal, nested app ownership,
reactive text/attributes, bootstrap JSON, nonce-authorized scripts/styles,
failed commit/activation rollback, superseded async renders/readiness, page/app
resources, and real demo navigation without full reloads. Priority 3 checks
route focus/title announcements and reduced-motion scrolling. Its browser
benchmark compares route transitions and whole-list updates with per-row state
bindings for a 500-row list.
Expected validation errors are asserted explicitly; unexpected browser errors
fail the lifecycle tests.

Configuration follows Playwright's [web server lifecycle](https://playwright.dev/docs/test-webserver)
and [browser projects](https://playwright.dev/docs/test-projects).

`accessibility.spec.ts` runs Axe against a representative accessible route before
and after navigation, then checks keyboard traversal and route focus. It covers
names, landmarks, contrast and other enabled Axe rules; it is not an audit of
every application or demo page. On macOS WebKit the keyboard check uses
Option+Tab to include all interactive controls.

`storage.spec.ts` checks real IndexedDB temporary-draft writes/cleanup, versioned
local storage migrations, cross-tab notifications, session storage separation
and watcher disposal in all three engines. Browser quota and eviction behavior
remain environment-dependent.

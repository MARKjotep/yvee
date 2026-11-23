# Routing

Yvee routes are page classes. A page declares a path, optionally fetches data,
and returns head and body content. The same route table is used by the browser
app and by the server renderer.

Related guides: [State](state.md) for page state, [Rendering](rendering.md) for
head and SSR, and the [guard design notes](guard-design.md) for proposed
departure/leave guards that are not part of the current API.

## Pages and routes

Use `@route(path)` (or its alias `@page(path)`) on a page class, then pass the
class to `app.register()`:

```tsx
import { Page, Yvee, dom, route } from "yvee";

@route("/users/:id")
class UserPage extends Page<{ name?: string }> {
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

const app = new Yvee({ id: "app-root" });
app.register(UserPage);
await app.render({ id: "app-root" });
```

Named segments such as `:id` are decoded into `this.params.id`. A page also has
`url`, `path`, `data`, `status`, `error` and its own `resources` disposal scope.
`fetch(context)` receives the parsed URL, string params, request data, an abort
signal and the page's `resources`.

Routes are registered when the decorated class is passed to `app.register()`.
`app.route(path)` and `app.error(status, controller)` are also available for
programmatic registration.

## Base paths

Pass a `base` to scope every route under a deploy prefix:

```ts
const app = new Yvee({ base: "/my-project/", history: true });
app.register(HomePage, AboutPage);
```

The base is normalized (leading, repeated and trailing slashes) and included in
generated route patterns and in the document's `<base>` element. The host must
serve the app entry at nested route URLs if browser refreshes should work there.
Asset URLs are emitted by your bundler or HTML template and must use the same
deploy prefix.

By default the app references a module script at `./index.js` relative to its
base. Set `client` to a directory (resolving to its `index.js`) or to an
explicit JavaScript file URL:

```ts
new Yvee({ base: "/my-project/", client: "/my-project/client.js" });
```

## Guards

Guards run before page fetch, body and head work. A guard receives a context
with the destination URL, route params, page, app, request data, a navigation
signal and a `server` environment flag. It can allow, stop or redirect:

```ts
type GuardResult =
  | void
  | { kind: "allow" }
  | { kind: "stop" }
  | { kind: "redirect"; to: string; replace?: boolean; returnTo?: boolean | string };
```

In the browser a stop or redirect controls navigation. During server rendering a
stop is not an exception: `withStatus()` renders the app's 403 error page (or the
built-in failure page) inside the app shell with `<body data-error="403">` and
resolves `{ status: 403, html, reason: "guard-stop" }`. A redirect is followed
internally and the target page renders; `allow`, `void` and other continuing
decisions render the requested page normally. The `reason` field appears only on
guard-stopped server results.

Create reusable guards with `createGuard()` and attach them with `@use(...)` or
for the whole app with `app.use(...)`:

```tsx
import { Page, createGuard, dom, route, use } from "yvee";

const signedIn = createGuard(() => () => ({ kind: "allow" as const }));

@route("/account")
@use(signedIn())
class AccountPage extends Page {
  override body() {
    return <main><h1>Account</h1></main>;
  }
}
```

### Preserving the rejected URL

Set `returnTo` on a redirect to carry the URL the guard rejected. `true` appends
the current request URL (`path + search + hash`) as an encoded `returnTo` query
parameter; a string appends that explicit value instead. Redirects that omit
`returnTo` render exactly like today's bare redirect:

```ts
import type { Guard } from "yvee";

const accountGuard: Guard = ({ data }) =>
  data.signedIn === true
    ? { kind: "allow" }
    : { kind: "redirect", to: "/login", returnTo: true };
```

An anonymous visit to `/account?tab=billing#invoices` redirects to
`/login?returnTo=%2Faccount%3Ftab%3Dbilling%23invoices`. The target's own query
and hash are kept, and the framework resolves the parameter in the guard runner,
so both client navigation and server rendering follow the annotated target.

Read the value back in the login view and fall back when it is absent:

```ts
import { readReturnTo } from "yvee";

const returnTo = readReturnTo(window.location.href) ?? "/account";
```

`readReturnTo()` accepts a redirect target string, a `URL`, or a parsed
`YveeURL` and returns the decoded value or `undefined`. `buildReturnTo(url, to)`
builds the same target by hand when a guard cannot return a redirect object.
Only navigate to paths you trust; a `returnTo` value comes from the URL.

### Built-in guards

Guard helpers are exported from `yvee` and implemented in `src/yvee/guards/`:

- `requireGuard(predicate, fallback)` allows a route when a sync or async
  predicate passes; otherwise it stops or returns your redirect.
- `allGuards(...guards)` evaluates in order and short circuits at the first stop
  or redirect.
- `whenGuard(predicate, guard)` runs a guard conditionally.
- `paramsGuard(validators, fallback)` validates required route parameters before
  the page loads.

```ts
import { allGuards, paramsGuard, requireGuard } from "yvee";

const validId = paramsGuard({ id: (value) => /^\d+$/.test(value) });
const featureEnabled = requireGuard(
  ({ data }) => data.featureEnabled === true,
  { kind: "redirect", to: "/" },
);

app.use(allGuards(featureEnabled, validId));
```

Register parameter guards on the routes that actually have those parameters.
The guard runner checks the transition abort signal before and after each guard.
Async work in guards should also receive `context.signal`.

Authentication and permission predicates should use your application's session
data. Browser guards control navigation; protect server endpoints separately.
The [authentication example](../examples/README.md) shows request-owned identity
without a prescribed session format.

### Browser or server

`isClient` is exported from `yvee` as a module-scope boolean: `true` only when a
global `window` exists. It is evaluated safely, so importing it during server
rendering or in Bun never throws:

```ts
import { isClient } from "yvee";

if (isClient) {
  // Browser-only helpers such as document storage are available.
}
```

Guard contexts also carry `server`: `true` when guards run without a browser
(server rendering or Bun) and `false` during client-side navigation. The guard
runner always populates it, so guard code can branch without touching globals:

```ts
import type { Guard } from "yvee";

const clientOnly: Guard = ({ server }) =>
  server ? { kind: "stop" } : { kind: "allow" };
```

Client guards are destination entry checks. Unsaved-change departure checks,
session readiness and active-route revalidation are future design work
described in [guard-design.md](guard-design.md).

## Error pages

Associate a controller with an HTTP error status with `@error(status)` and
register it like any other page:

```tsx
import { Page, dom, error, route } from "yvee";

@error(404)
class NotFoundPage extends Page {
  override body() {
    return <main role="status">Nothing here.</main>;
  }
}

app.register(NotFoundPage);
```

`MissingPage` and `FailurePage` are the default 404 and 500 controllers. Register
your own page for a status to override them; a registered 403 page is used for
server guard stops. The server renderer exposes the status through
`withStatus()`; see [Server rendering](rendering.md#server-rendering).

Server-rendered error pages carry `<body data-error="<status>">`. Hydration reads
that marker as a load hint and preserves it on error pages, so clients and tests
can key off `document.body.dataset.error` after mount. Success pages have no
`data-error` attribute, and a committed client-side navigation keeps the marker
in step with the current page status.

## Inspecting routes

`app.listRoutes(transport?)` returns the registered route entries. `app.listPaths()`
returns page paths with parameter names as sample values, and is intended for
static HTML export:

```ts
for (const path of app.listPaths()) {
  console.log(path); // "/", "/about", "/users/id", ...
}
```

See [Saving route HTML](rendering.md#saving-route-html) for a full example.

## SPA route focus and announcements

After a successful client-side route commit, Yvee focuses the first
`[data-yvee-focus]` element, otherwise the first `h1`, otherwise the app root
(unless it is `body`). A hash target inside the app takes precedence. Headings
receive a temporary `tabindex="-1"` for programmatic focus and return to their
original markup after blur. The initial page load leaves focus where the browser
placed it. A polite, atomic status region announces the committed document
title.

When `prefers-reduced-motion: reduce` is active, framework route scrolling
temporarily overrides CSS smooth scrolling so position changes happen without
motion. Framework navigation does not animate the page transition.

For frequently edited large collections, bind row values separately so one
change only updates its row:

```tsx
const labels = records.map((record) => State(record.label));
return <ul>{labels.map((label) => <li>{label}</li>)}</ul>;
```

Updating one state in this list retains its `<li>` nodes. Updating a single state
that contains the whole rendered list replaces that bound region's children.

## Related

- [API reference: app, page and routing](api-reference.md#app-page-and-routing)
- [API reference: guards](api-reference.md#guards)
- [Rendering](rendering.md)
- [State](state.md)

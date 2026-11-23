# Rendering

Yvee renders HTML and SVG with TSX. The same trees can be rendered into the
browser DOM, serialized on the server, and reused for hydration. This guide
covers TSX, the DOM renderer, browser element helpers, document head, server
rendering, trust boundaries and CSP.

Related guides: [State](state.md) for reactive bindings, [Routing](routing.md)
for pages and transitions, and [Scopes](scopes.md) for request-owned SSR
services.

## TSX and the DOM renderer

Write markup in `.tsx` files with HTML and SVG tags. Configure `dom` as the JSX
factory and `frag` for fragments (`<>...</>`), then import those names where
needed:

```tsx
import { State, dom, frag } from "yvee";

const count = State(0);

const view = (
  <>
    <h1>Counter</h1>
    <button on={{ click() { count.value++; } }}>Clicks: {count}</button>
  </>
);
```

State values can appear in children and supported attributes. The renderer
registers bindings so updates change the corresponding browser content. App
mounting handles rendering and activating those bindings for page content.

`DOM` is the node class; `DOMNode` is its type alias. `dom` creates nodes and
`frag` groups children. `DOMAttr`/`DOMValue` describe attributes, and
`DOMRenderable`/`DOMContext` describe accepted children, including promises.
`DOMComponent<Props>` is a typed function component. Because TSX elements may be
promises, the renderer awaits async components during SSR and navigation.

Optional attributes — intrinsic attribute maps and `DOMAttr` alike — are typed
as `?: T | undefined`. Forwarding a conditionally-present value such as
`disabled={props.disabled}`, `aria-label={props.ariaLabel}` or `on={props.on}`
type-checks under `exactOptionalPropertyTypes`; the renderer omits every
`undefined` attribute, so defined-and-truthy, absent and explicitly-`undefined`
attributes produce the same markup for the same value.

### Components and children

A component is a function `dom` calls with attributes as its first argument and
JSX children as **rest arguments**:

```tsx
import { dom, type DOMContext } from "yvee";

function Card(props: { title: string }, ...children: DOMContext[]) {
  return (
    <section>
      <h2>{props.title}</h2>
      {children}
    </section>
  );
}

const card = (
  <Card title="Hello">
    <p>Body</p>
  </Card>
);
```

`DOMComponentProps` and `DOMComponent<Props>` describe that shape. Children are
never placed on the props object, so `props.children` is always `undefined` and
rendering it silently drops the content; render the `...children` rest parameter
instead. Prefer typing the props parameter with your own props object: the
permissive `DOMAttr` index signature that `DOMComponentProps` carries types
unknown keys — including `children` — as `any`, which hides the mistake from the
compiler.

`renderDom(value, idm?)` converts a DOM tree into markup plus deferred browser
binding instructions and returns `RenderedDOM` (`ctx`, `oz`, `id`). Ordinary
applications should use `Yvee.render` rather than calling the renderer directly.

## Browser element helpers (`$`)

`$` selects a browser element and returns an `Elem` wrapper. A selector that
matches nothing returns `undefined`. You can also wrap an existing element.

```ts
import { $ } from "yvee";

const panel = $("#details");
panel?.add("is-open");
panel?.attr.set({ "aria-expanded": true });
```

`Elem` includes class, attribute, event, content, query and animation helpers.
Use these when you need direct access to an existing browser node; page markup
and reactive bindings are provided by the DOM renderer.

Other helpers exported from the root entry include `getElementById`,
`Toggled(condition, value, otherwise?)`, `setContentRenderer(renderer)` and
`renderContent(value, parentId?)`. The lowercase `renderedDom` type alias is
retained for compatibility.

## Server rendering

Configure the same routes on the server and render a URL to an HTML document:

```ts
import { Yvee } from "yvee";
import { app } from "./app";

const renderPage = app.server({ id: "app-root" });
const html = await renderPage({ url: "/users/42" });
```

`renderPage.withStatus(request)` returns `{ html, status, reason? }`. A server
request accepts `url`, `data`, `error`, `nonce` and `signal`. Data is passed to
the page and its `fetch` method; `error` selects a registered error page.

A guard `stop` does not reject the render. The registered 403 error page (or the
built-in failure page) renders inside the app shell with
`<body data-error="403">`, and the result is
`{ status: 403, html, reason: "guard-stop" }`. The `reason` field is absent from
every other result. Guard redirects are followed internally before rendering;
`allow`, `void` and other continuing decisions render the requested page
normally. Global guards are skipped while the 403 page renders so the same
rejection cannot suppress it.

The `<body data-error="...">` marker is part of the hydration contract: it is
read as an error-page hint during the initial load, then preserved for error
pages and removed for success pages. After hydration, `document.body.dataset.error`
matches the committed page's error status, or is absent for a `2xx`/`3xx` page.

Request URLs are normalized to root-relative paths before page selection. `""`
and `"?"` render the home page, a bare `"about"` is treated as `/about`, and query
strings or fragments do not affect which page loads. When no page matches, the
reported missing path drops the query string and trailing slashes and
percent-encodes markup-like characters; traversal-like inputs such as encoded
dots or `%00`, and very long paths, render `404` instead of throwing. This is
documented behavior, not validated input.

`app.render()` also returns a callable server renderer, so a default export can
serve both environments:

```ts
export default app.render({ id: "app-root" });
```

In a browser the same value behaves as a mount promise. In a server it can be
called with a `ServerRequest`.

The render result also exposes `.app`, the `Yvee` instance that produced it, so a
built entry can introspect paths and routes without importing application source:

```ts
const renderer = app.render();
export default renderer;
export const app = renderer.app;
```

`renderer.app.listPaths()` and `renderer.app.listRoutes()` return the same
registrations the server renders. The default export stays the callable
renderer.

The browser renderer can reuse matching server markup; pass `hydrate: false` to
`app.render` to replace the mount element contents.

### Consume-once SSR data

`page.ssrData<T>()` exposes the data seeded for the current document at most
once, so a view can tell fresh SSR data from re-seeded data:

- During server rendering (no `document`) it returns `page.data` on every call,
  so repeated renders stay deterministic.
- In the browser the first call after `app.render()` returns the hydrated
  payload; later calls, re-renders and client-side navigations return
  `undefined`. The window opens when the initial mount starts and closes when it
  settles, so a page reached by navigation never sees another page's payload.
- `page.data` is not modified. Read it for ordinary values and use `ssrData()`
  only for hydration-specific work.

```tsx
override body() {
  const seeded = this.ssrData<{ user: string }>();
  return <p>{seeded ? `Hello ${seeded.user}` : "Local view"}</p>;
}
```

The window is per document, not per page instance: a second call in the same
pass already returns `undefined`, matching the module-level `reconciled` flag it
replaces.

`ServerOptions` supports `id`, `class`, `data` and a per-request `dataFactory`.
`ServerRenderer<T>` is the callable renderer with `withStatus()`.

### Saving route HTML

`app.listPaths()` returns registered page paths, including the app's base. It
excludes socket routes and uses parameter names as sample values:
`/users/:id` becomes `/users/id`. Duplicate sample paths appear once. Use real
parameter values when your pages fetch records by ID.

`app.renderHTML(url, options?)` returns a promise for a complete HTML document.
Its optional settings are `data`, `signal`, `error` and `nonce`, just like a
server render request. It runs the normal page loading, guards and layout.

```ts
for (const path of app.listPaths()) {
  const html = await app.renderHTML(path, { data: {} });
  const filename = `./output${path === "/" ? "" : path}/index.html`;
  await Bun.write(filename, html);
}

// Supply a real ID for a specific page:
const html = await app.renderHTML("/users/42");
await Bun.write("./output/users/42/index.html", html);
```

These files contain the rendered HTML; referenced scripts, styles and images
still need to be served when testing in a browser.

## Document head

`HeadConfig` describes document metadata and resources:

```ts
type HeadConfig = {
  base?: Record<string, string | boolean>[];
  title?: string;
  style?: string;
  description?: string;
  meta?: Record<string, string | boolean>[];
  link?: Record<string, string | boolean>[];
  script?: (Record<string, string | boolean> & { body?: string })[];
  css?: string | string[];
  js?: string | string[];
  elements?: DOM[];
};
```

A page returns any `HeadResult`: a `HeadConfig`, a DOM node, a trusted style
string, or nothing. `HeadDefaults` accumulates app-level defaults; `app.head()`
adds values inherited by page head values. `applyHead(config, owner, options)`
mounts owned head nodes in a browser and returns a cleanup with stylesheet
readiness, deferred activation and cancellation.

Relative asset values from Bun's file loader are resolved automatically. A head
`link` `href`, `css`, `js` or `script` `src` starting with `./` or `../` is
resolved against the last `base` href (default `/`) when the head is emitted, so
SSR and the client apply the same URL:

```ts
import favicon from "./static/favicon.svg";

app.head({
  link: [{ rel: "icon", type: "image/svg+xml", href: favicon }],
});
// base "/"       -> href="/static/favicon.svg"
// base "/notes/" -> href="/notes/static/favicon.svg"
```

Absolute `/…`, `data:`, `http(s):`, protocol-relative `//`, anchor and empty
values are emitted unchanged.

Plain `HeadConfig` fields such as `title` and `description` are static values.
For reactive metadata, return DOM elements containing state from `Page.head` or
from an optional `head({ page })` export in a lazy page module:

```tsx
// page.tsx
import { Page, State, dom, route } from "yvee";

@route("/status")
export class StatusPage extends Page {
  title = State("Initial title");
  override body() {
    return import("./status-view");
  }
}

// status-view.tsx
import { dom } from "yvee";
import type { StatusPage } from "./page";

export const head = ({ page }: { page: StatusPage }) => (
  <title>{page.title}</title>
);

export default function View({ page }: { page: StatusPage }) {
  return (
    <main>
      <h1>Status</h1>
      <button on={{ click: () => { page.title.value = "Updated"; } }}>
        Update title
      </button>
    </main>
  );
}
```

`Page.head()` and `app.head()` accept the same head result. Use DOM nodes for
shared markup and reactive head attributes; record-based metadata remains
supported.

## Rendering trust and CSP

Ordinary body text and attribute values are escaped during SSR and set through
DOM APIs during browser updates. Tag names, attribute definitions, CSS, scripts
and component functions are application-authored code. Yvee does not sanitize
arbitrary HTML or untrusted CSS/JavaScript.

DOM rendering, reactive attributes, configured head attributes and
`$.attr.set(...)` share these rules:

- Invalid attribute names are not emitted. String event attributes (`onclick`,
  `onload`, etc.) and `srcdoc` are rejected. Register functions with
  `on={{ ... }}`.
- URL attributes accept relative URLs and HTTP(S). `href`/`xlink:href` also
  accept `mailto:`, `tel:` and literal `data:` values; browsers block top-level
  navigation to `data:` URLs, so they are inert as links and pass through
  unchanged. `src` accepts base64 PNG, GIF, JPEG, WebP and AVIF images. Other
  explicit schemes, SVG data URLs and non-image `data:` URLs in `src`, and any
  data URL in `srcset`, are rejected. `srcset` accepts comma-separated
  URL/descriptor candidates. These checks do not restrict HTTP(S) destinations;
  use application policy and CSP for that.
- Inline script/style children must be static trusted text. Configured head code
  and TSX code reject HTML closing-tag sequences that could terminate their
  container. Script HTML-comment/open-script sequences are also rejected. Code
  is emitted as code, so JavaScript operators such as `<` and `&&` retain
  meaning.

`Elem.insert(position).HTML(...)` deliberately inserts **trusted raw HTML**.
`newChild`/`newChildNS` properties and direct DOM APIs also require trusted code.
Use `insert(...).text(...)` or normal rendered content for untrusted data.
`inner`, `append` and `appendfirst` use the renderer and escape ordinary strings.
Raw HTML and arbitrary property assignments bypass the validation rules above.

For JSON handoff, use `renderJSONScript(payload, { id, nonce })` or
`serializePayload(payload)` inside a trusted JSON script container. These
helpers escape `<`, `>`, `&` and Unicode separators while preserving parsed
data. They reject cycles, BigInt, undefined, functions, symbols and nonfinite
numbers as JSON values. Native JSON behavior still applies to `toJSON` methods
and omitted symbol keys. Never put user data directly in executable script
bodies.

```ts
import { renderJSONScript } from "yvee";

const nonce = crypto.randomUUID(); // Generate for each response.
const html = await renderPage({
  url: request.url,
  data,
  nonce,
  signal: request.signal,
});
const responseHTML = html.replace(
  "</head>",
  `${renderJSONScript(data, { id: "payload", nonce })}</head>`,
);
// Set the matching Content-Security-Policy response header in your server.
```

The server request's `nonce` overrides configured nonces on framework-created
scripts/styles, including TSX head/body elements. Pass that same response nonce
to `app.render({ nonce })` so client-created head nodes and subsequent rendered
content can use it. An authorized bootstrap script can read its `.nonce`
property and pass it to the mount. Do not store a request nonce in shared app
defaults. The server integration sets the CSP header and nonces on its own entry
scripts. A nonce does not authorize style attributes; move such CSS into allowed
styles. Scripts produced through an HTML template are inert under normal browser
rules; use configured `head.script`/`head.js` for browser-executed head scripts.

Validation failures reject SSR or initial mounting. Navigation head failures
clean up staged head nodes and report through `app.onError`. A rejected reactive
attribute update leaves the DOM attribute unchanged; it is reported through the
state error channel and rejects the next `flush()`.

The lower-level `validateAttribute` and `inlineContent` helpers implement these
rules in `src/dom/render/trust.dom.ts`. Only `serializePayload` and
`renderJSONScript` are exported from the package root; treat the rest as
internal.

## SSR request ownership

`renderPage({ url, data })` snapshots arrays and plain objects, including nested
containers, and freezes the copies. Caller objects remain untouched. Page data's
top level is local and can receive fetched fields; nested input data is
read-only. Service/class instances and accessors are rejected in this plain-data
path. This also applies to default data passed to `server({ data })` or inherited
from the app. Keep shared configuration free of user-specific mutable values.

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

`dataFactory` takes precedence over plain-data defaults and receives the
original request data. It owns copying, validating and combining that data.
Register each resource immediately after acquiring it; cleanup runs after the
entire document has rendered, on failure, or after aborted work unwinds.
Cancellation is cooperative: async work must honor the supplied signal. Cleanup
is awaited in reverse order, and all registered cleanups are attempted.
Combined render/cleanup failures are reported in an `AggregateError` with the
render error first.

`Scope.create` returns an independent `use(name)` container. It retains service
references and seals a top-level copy, like global registration. Create it per
request and pass it explicitly; it is not resolved by global `Scope.use` or
`Field` decorators. Global Scope/Field remain application-wide. They must not
contain per-user state and must never be cleared between concurrent requests.

Guards use `context.data`, `context.url` and `context.signal` for request values.
`context.app` remains the shared app; do not mutate its data, URL/loading state,
head defaults or route registration while serving requests. Lazy modules are
cached, so create mutable state in page instances or exported factories,
including `head({ page })`. A fresh controller cannot isolate a module-level
singleton. SSR collects binding descriptions locally and never stages them in
the browser `Wizard`. Use the same app root seed, data and tree for deterministic
hydration.

For multiple browser apps, give every mount a distinct root ID. Links belong to
the nearest mounted app. Only the primary app should own browser history; mount
secondary apps with `history: false`. Document title remains shared: the latest
committed title wins, and disposal restores a prior title only if it still owns
the current value.

## Related

- [API reference: server rendering and document head](api-reference.md#server-rendering-and-document-head)
- [API reference: DOM, TSX and browser element helpers](api-reference.md#dom-tsx-and-browser-element-helpers)
- [Routing](routing.md)
- [State](state.md)
- [The Bun demo](../test/yvee-bun/README.md)

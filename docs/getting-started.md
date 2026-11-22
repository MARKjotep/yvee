# Getting started

Yvee is a TypeScript UI framework in a single, dependency-free package
(`yvee@0.1.0`). It combines:

- reactive state, derived values and lifecycle hooks;
- a TSX renderer for HTML and SVG;
- browser element helpers (`$`);
- client-side routing, page controllers and guards;
- document-head management and server-side rendering;
- browser storage, IndexedDB, JSON requests, WebSockets and event streams.

The public entry point is the package root, `yvee`. This guide covers install,
TSX setup and the smallest useful app. The other guides go deeper:

- [State](state.md) — values, records, sets, derived state and async work.
- [Scopes](scopes.md) — shared objects and field injection.
- [Routing](routing.md) — pages, route parameters, guards and focus.
- [Rendering](rendering.md) — TSX, DOM, `$`, head and SSR.
- [Data](data.md) — browser storage, IndexedDB and network helpers.
- [API reference](api-reference.md) — every exported symbol and compatibility notes.

## Install

```sh
bun add yvee
```

Yvee has no runtime dependencies. It is intended to be compiled by your
application's bundler; it does not ship a framework-specific CLI or bundler
plugin.

For local development against this repository, link the package:

```sh
# In the Yvee repository
bun link

# In the consuming project
bun link yvee
```

After changing Yvee source, rebuild the package bundle and declarations (the
repository uses `builder.ts` with `@ohmyqt/oven`) so consumers that import the
build see the new code and declarations. Restart the consumer's dev server when
its bundler caches linked dependencies.

The package exposes only its root entry through the `exports` map:

```jsonc
// package.json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  }
}
```

Import from `yvee`. Source folders such as `src/core` are readable but are not
stable package subpaths.

## TypeScript and TSX setup

Yvee's TSX elements use its `dom` element factory and `frag` fragment factory.
Configure TypeScript accordingly:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "dom",
    "jsxFragmentFactory": "frag",
    "moduleResolution": "bundler",
    "module": "esnext",
    "target": "esnext",
    "strict": true
  }
}
```

Import `dom` and `frag` in modules that contain JSX:

```tsx
import { dom, frag } from "yvee";
```

Your bundler must compile TypeScript/TSX and include Yvee's browser code in the
client bundle.

## Quick start

Pages are ordinary TypeScript classes. Write their markup with HTML-like TSX
(tags such as `<main>` and `<h1>`); the JSX setup above turns those tags into
nodes for Yvee's renderer.

```tsx
import { Page, Yvee, dom, route } from "yvee";

@route("/")
class HomePage extends Page {
  override head() {
    return { title: "Home" };
  }

  override body() {
    return (
      <main>
        <h1>Hello from Yvee</h1>
        <a href="/about">About</a>
      </main>
    );
  }
}

@route("/about")
class AboutPage extends Page {
  override body() {
    return (
      <main>
        <h1>About</h1>
        <a href="/">Home</a>
      </main>
    );
  }
}

const app = new Yvee({ id: "app-root", history: true });
app.register(HomePage, AboutPage);
app.Main((content) => <div class="app-shell">{content}</div>);

// The host HTML must contain an element with this id.
const unmount = await app.render({ id: "app-root" });
```

Named route segments are available on the page:

```tsx
import { Page, dom, route } from "yvee";

@route("/users/:id")
class UserPage extends Page<{ name?: string }> {
  override async fetch() {
    return { name: `User ${this.params.id}` };
  }

  override head() {
    return <title>{this.data.name ?? "User"}</title>;
  }

  override body() {
    return (
      <main>
        <h1>{this.data.name ?? "Loading user"}</h1>
      </main>
    );
  }
}
```

State values can appear in children and supported attributes. The renderer
registers bindings so updates change the corresponding browser content:

```tsx
import { State, dom } from "yvee";

const count = State(0);
const view = (
  <button on={{ click: () => count.value++ }}>Clicks: {count}</button>
);
```

## Base paths and the client entry

For app-specific URLs, pass a `base` such as `/my-project/`:

```ts
const app = new Yvee({ base: "/my-project/", id: "app-root" });
```

The host must serve the app entry at nested route URLs if browser refreshes
should work there. Asset URLs are emitted by your bundler or HTML template and
must use the same deploy prefix.

By default, the app adds a module script for `./index.js` relative to its base.
Set `client` to a directory or an explicit JavaScript file URL to change the
entry:

```ts
new Yvee({ client: "/client" });          // resolves to /client/index.js
new Yvee({ client: "/client/custom.js" }); // explicit file
```

See [Routing](routing.md) for base-path details and [Rendering](rendering.md)
for server rendering and static HTML export.

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

Within `src/yvee/`, the app implementation is grouped by responsibility:

- `app.ts` — app setup and the public `Yvee` class;
- `routing/` — URL parsing and route registration;
- `guards/` — guard types, decorators, conditions, composition and parameter
  validation;
- `pages/` — page controller types;
- `client/` — browser mount and navigation lifecycle;
- `rendering/` — document head and server rendering;
- `platform/` — storage, WebSocket and EventSource helpers.

## Next steps

- Add reactive state with [State](state.md).
- Share configuration with [Scopes](scopes.md).
- Add route guards with [Routing](routing.md).
- Render on the server or export static HTML with [Rendering](rendering.md).
- Persist data with [Data](data.md).
- Check exact exports in the [API reference](api-reference.md).

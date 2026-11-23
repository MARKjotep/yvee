# Yvee

Yvee is a TypeScript UI framework with reactive state, a TSX renderer, browser
element helpers, client-side routing and guards, server-side rendering, and
browser storage and network helpers. It ships as one dependency-free package,
`yvee@0.1.0`.

## Install

```sh
bun add yvee
```

For local development with Bun, link this repository into a consuming project:

```sh
# In the Yvee repository
bun link

# In the consuming project
bun link yvee
```

After changing Yvee source, rebuild the package so consumers that import the
build see the new code and declarations. Restart the consumer's dev server when
its bundler caches linked dependencies.

The package exposes only its root entry through the `exports` map. Import from
`yvee`; source folders are not stable package subpaths.

## TypeScript and TSX setup

Yvee's TSX elements use its `dom` factory and `frag` fragment factory. Add a
`.tsx` extension and configure TypeScript accordingly:

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

Import `dom` and `frag` in TSX modules where JSX is used. A consuming bundler
must compile TypeScript/TSX and include Yvee's browser code in its client
bundle. Yvee does not currently ship a framework-specific CLI or bundler plugin.

## Quick start

Pages are classes decorated with a route path. Register them on an app and
mount it into an element that already exists in the host HTML:

```tsx
import { Page, Yvee, dom, route } from "yvee";

@route("/")
class HomePage extends Page {
  override head() {
    return { title: "Home" };
  }

  override body() {
    return <main><h1>Hello from Yvee</h1><a href="/about">About</a></main>;
  }
}

@route("/about")
class AboutPage extends Page {
  override body() {
    return <main><h1>About</h1><a href="/">Home</a></main>;
  }
}

const app = new Yvee({ id: "app-root", history: true });
app.register(HomePage, AboutPage);
app.Main((content) => <div class="app-shell">{content}</div>);

// The host HTML must contain this element. Keep the returned cleanup if needed.
const unmount = await app.render({ id: "app-root" });
```

State values can be read directly by DOM children and supported attributes:

```tsx
import { State, dom } from "yvee";

const count = State(0);
const button = (
  <button on={{ click: () => count.value++ }}>Clicks: {count}</button>
);
```

By default the app references a module script at `./index.js` relative to its
base. Set `client` to a directory or explicit JavaScript file to change it:

```ts
new Yvee({ base: "/my-project/", client: "/my-project/client.js" });
```

## Component authoring

A Yvee component is a function called by `dom`. Attributes are its first
argument; **JSX children are rest arguments**:

```tsx
import { dom, type DOMContext } from "yvee";

function Card(props: { title: string }, ...children: DOMContext[]) {
  return (
    <article class="card">
      <h2>{props.title}</h2>
      {children}
    </article>
  );
}

const view = (
  <Card title="Hello">
    <p>Body</p>
  </Card>
);
```

> **Children are not on `props`.** Because `dom` forwards JSX children only as
> rest arguments, `props.children` is always `undefined`, and rendering it
> silently drops the children. Type the props parameter as your own props
> object and render the `...children` rest parameter instead. (`DOMComponent`
> and `DOMComponentProps` describe this shape for typed components.)

Components may be async; the renderer awaits them during SSR and navigation.
Optional attributes accept an explicit `undefined` (`disabled={props.disabled}`,
`on={props.on}`) and are omitted from the markup, so a conditionally-present
value can be forwarded without normalizing it first.

## Documentation

| Guide | What it covers |
| --- | --- |
| [Getting started](docs/getting-started.md) | Install, TSX setup, package structure and the smallest routed app. |
| [State](docs/state.md) | `State`, `RecState`, `SetState`, `Derived`, batching, hooks and resource ownership. |
| [Scopes](docs/scopes.md) | Shared application objects, `Field` injection and request-owned containers. |
| [Routing](docs/routing.md) | Pages, route parameters, guards, error pages and SPA focus. |
| [Rendering](docs/rendering.md) | TSX and DOM, `$` helpers, document head, SSR, static HTML export, trust and CSP. |
| [Data](docs/data.md) | Browser storage, IndexedDB, validated JSON requests, WebSockets and event streams. |
| [API reference](docs/api-reference.md) | Every public export, signatures and deprecation notes. |

Additional design and example material:

- [Guard design notes](docs/guard-design.md) — proposed departure/leave guards
  and the boundary of the current guard API.
- [Authentication example](examples/README.md) — request-owned identity with
  `requireGuard`.
- [Bun SSR/client demo](test/yvee-bun/README.md) — a runnable app with lazy
  views, hydration and reactive head content.
- [IndexedDB guide](src/core/indexeddb/README.md) — schema, upgrade and cleanup
  details.

## License

MIT. See [LICENSE](LICENSE).

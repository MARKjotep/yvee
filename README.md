# Yvee

Yvee is a TypeScript UI framework with reactive state, a TSX renderer, browser
element helpers, client-side routing and guards, server-side rendering, and
browser storage and network helpers. It ships as one dependency-free package,
`yvee@0.1.7`.

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

The package exposes its root entry and the JSX runtime subpaths through the
`exports` map: `yvee`, `yvee/jsx-runtime` and `yvee/jsx-dev-runtime`. Source
folders are not stable package subpaths.

## TypeScript and TSX setup

Yvee uses the automatic JSX runtime, so `.tsx` files need **no import** for
JSX. Add a `.tsx` extension and point TypeScript (and Bun 1.4+) at Yvee:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "yvee",
    "moduleResolution": "bundler",
    "module": "esnext",
    "target": "esnext",
    "strict": true
  }
}
```

Bun 1.4+ is recommended because its transpiler and `Bun.build` honor the same
`jsx` settings. Oven users can forward them explicitly with the optional
`jsx` and `tsconfig` build options.

### JSX runtime exports

`yvee/jsx-runtime` exports `jsx`, `jsxs` and `Fragment`;
`yvee/jsx-dev-runtime` exports `jsxDEV` and `Fragment`. TypeScript and Bun
select the right module from `jsxImportSource` and the build mode, so you never
import these by hand. The component contract is unchanged: components receive
`(props, ...children)`, children are never on `props`, and a `key` passed in
JSX stays in the attribute object (classic parity).

Classic JSX factories remain supported for existing code. To keep using them,
set `"jsx": "react"`, `"jsxFactory": "dom"` and
`"jsxFragmentFactory": "frag"`, then import `dom`/`frag` from `"yvee"` in TSX
modules:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "dom",
    "jsxFragmentFactory": "frag"
  }
}
```

A consuming bundler must compile TypeScript/TSX and include Yvee's browser code
in its client bundle. Yvee does not currently ship a framework-specific CLI or
bundler plugin.

## Quick start

Pages are classes decorated with a route path. Register them on an app and
mount it into an element that already exists in the host HTML:

```tsx
import { Page, Yvee, route } from "yvee";

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
import { State } from "yvee";

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

A Yvee component is a function called by the renderer. Attributes are its first
argument; **JSX children are rest arguments**:

```tsx
import type { DOMContext } from "yvee";

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

> **Children are not on `props`.** Because the renderer forwards JSX children
> only as rest arguments, `props.children` is always `undefined`, and rendering
> it silently drops the children. Type the props parameter as your own props
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

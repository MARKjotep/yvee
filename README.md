# Yvee

Yvee is a TypeScript UI framework with reactive state, a TSX renderer, browser
helpers, client-side routing, and server-side rendering. This guide is for using
the package from another project; the detailed API and behavior guide is
[Yvee.md](./Yvee.md).

## Install

From the published package:

```sh
bun add yvee
```

For local development with Bun, link this repository into the consuming project:

```sh
# In the Yvee repository
bun link

# In the consuming project
bun link yvee
```

After changing Yvee source, rebuild/regenerate declarations if your consuming
project imports the package build rather than source. Restart the consumer's
dev server when its bundler caches linked dependencies.

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

## Create a routed app

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
app.Main(content => <div class="app-shell">{content}</div>);

// The host HTML must contain this element. Keep the returned cleanup if needed.
const unmount = await app.render({ id: "app-root" });
```

Use `State`, `RecState`, or `SetState` for reactive values. A DOM child or
supported attribute can read state directly:

```tsx
import { State, dom } from "yvee";

const count = State(0);
const button = <button on={{ click: () => count.value++ }}>Clicks: {count}</button>;
```

For app-specific URLs, pass a `base` such as `/my-project/`. The host must serve
the app entry at nested route URLs if browser refreshes should work there. Asset
URLs are emitted by your bundler or HTML template and must use the same deploy
prefix. See [hosting and base paths](Yvee.md#routing-and-guards) and the detailed
deployment notes in [PRODUCTION.md](./PRODUCTION.md).

## Entry points

- `yvee` is the main package entry: app, pages, routing, guards, state, DOM and
  browser helpers.
- The root `Yvee.md` guide describes public exports, edge cases, ownership,
  storage, networking, SSR and rendering trust rules.
- [PRODUCTION.md](./PRODUCTION.md) tracks readiness gaps and validation work.
- [The Bun demo](./test/yvee-bun/README.md) shows a runnable SSR/client app.

Import from `yvee` in consumer projects. Source folders are useful for reading
the implementation, but should not be treated as stable package subpaths.

## Reactive head content

Plain `HeadConfig` fields such as `title` and `description` are static values.
For reactive metadata, return DOM elements containing the state from `Page.head`
or from the optional `head({ page })` export in a lazy page module:

```tsx
// page.tsx
import { Page, State, dom, route } from "yvee";

@route("/status")
export class StatusPage extends Page {
  title = State("Initial title");
  override body() { return import("./status-view"); }
}

// status-view.tsx
import { dom } from "yvee";
import type { StatusPage } from "./page";
export const head = ({ page }: { page: StatusPage }) => <title>{page.title}</title>;
export default function View({ page }: { page: StatusPage }) {
  return <main><h1>Status</h1><button on={{ click: () => { page.title.value = "Updated"; } }}>Update title</button></main>;
}
```

The detailed guide explains lazy page modules, state bindings, CSP, URL
validation, hydration and server request data. Read it before using raw HTML,
inline scripts, or mutable shared state in SSR.

## Status

Yvee is under active development. Review the public API and
[production readiness plan](./PRODUCTION.md) before depending on behavior that
is not documented in `Yvee.md`.

# Scopes

Scopes are a small dependency-injection registry for shared application objects.
They live in `src/core/scope/` and are exported from `yvee`. Use them for
configuration and services that are created once and consumed by many classes.

Related guides: [State](state.md), [Routing](routing.md) and
[Rendering](rendering.md) for request-owned SSR data.

## Registering scopes

Register named objects once in the application bootstrap, before creating
classes that consume them:

```ts
// main.ts — registration, before constructing pages/services
import { Scope, State } from "yvee";

export const scopes = Scope.register({
  app: {
    count: State(0),
    title: "My app",
  },
});

const appValues = scopes.use("app"); // inferred keys and value types
appValues.count.value++;
```

Registration seals a shallow copy: existing keys can be assigned, but keys
cannot be added or removed. Nested references are preserved, and registration
does not mutate or seal your original object. Duplicate names throw.

Other modules can use `Scope.use<T>(name)` without importing the bootstrap:

```ts
// counter.service.ts
import { Scope, type IStateful } from "yvee";

type AppScope = { count: IStateful<number>; title: string };

export function increment() {
  const app = Scope.use<AppScope>("app");
  app.count.value++;
}
```

The generic describes an expected shape; it does not validate it at runtime.
For inferred types, import the registration handle from a dedicated setup
module instead. Avoid circular imports between the entry and its consumers.

`Scope` exposes only the static `register()`, `use()` and `create()` methods. It
is not constructed with `new` and has no instance helpers.

## Field injection

`Field` uses the same registry and provides standard TypeScript class-field
decorators. Decorators may be declared before registration; they resolve the
value when an instance is constructed.

```ts
import { Field, type IStateful } from "yvee";

type AppScope = { count: IStateful<number>; title: string };
const appFields = Field.use<AppScope>("app");

class Counter {
  @appFields.count count!: IStateful<number>;
  @appFields.title title!: string;

  increment() {
    this.count.value++;
  }
}
```

You can also register with `Field.register({ app: { ... } })` and use its typed
`.use("app")` handle for decorators. Both registration APIs publish to the same
registry, so register each name only once. Duplicate names, missing scopes and
missing field keys throw descriptive errors. A present key whose value is
`undefined` is valid.

A field receives the registered value during construction, replacing any field
initializer. Objects and state instances are shared references; primitive values
are snapshots. Reassigning a decorated field does not write back to the scope.
To share reactive updates, register a `State()` value and change its `.value`.
Scope itself does not emit reactive updates.

## Request-owned scopes

Named registration is application-wide within a loaded package instance. Use it
for shared services and configuration. Keep SSR user/request data local to the
request and pass it explicitly; the global registry is not request isolation.

For request lifetime, create an independent container with `Scope.create`:

```ts
import { Scope } from "yvee";

const renderPage = app.server({
  async dataFactory({ data, signal, onDispose }) {
    const service = await openRequestService(signal);
    onDispose(() => service.close());
    const scopes = Scope.create({ request: { service } });
    return { ...data, scopes }; // Fresh containers for this request.
  },
});
```

`Scope.create` returns an independent `use(name)` container. It retains service
references and seals a top-level copy, like global registration. Create it per
request and pass it explicitly; it is not resolved by global `Scope.use` or
`Field` decorators. See [SSR request ownership](rendering.md#ssr-request-ownership)
for the full request lifecycle.

## `Stored`

`Stored<T>` is a legacy shallow-sealed object helper. It offers one-time `bind`,
nested one-level `set`, `safe` access and a `fn` wrapper. It is not reactive
storage and is unrelated to `BrowserStore`:

```ts
import { Stored } from "yvee";

const config = new Stored({ api: { url: "/api" } }, { dev: true });
config.bind({ api: { url: "/v2" } }); // Ignored: "api" is already bound.
config.set("api", "url", "/v2");
const api = config.safe("api");
```

Prefer `State`/`Scope` for new code. `Stored` remains available for
compatibility.

## Response shapes

`successStatus<T>` and `errorStatus` are small generic response-shape helpers
exported from `yvee`. `successStatus<T>` describes `{ success: boolean; data: T;
message?: string }`; `errorStatus` describes `{ success: boolean; error: {
message: string; code: string } & Record<string, unknown> }`. They are types,
not runtime constructors.

## Related

- [API reference: scopes and stored objects](api-reference.md#scopes-and-stored-objects)
- [State](state.md)
- [Data](data.md)

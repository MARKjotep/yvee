import { DisposalScope } from "@/core/disposal.core";
import { State, type IStateful } from "@/core/core.core";
import type { Guard } from "./guards";
import { HeadDefaults, type HeadResult } from "./rendering/head";
import { loadPage } from "./client/load-page";
import { type Layout } from "./client/mount";
import { YveeClient } from "./client/runtime";
import { type Page } from "./pages/page";
import { normalizePath, toURL, type YveeURL } from "./routing/path";
import {
  RouteBook,
  errorStatus,
  routeMetadata,
  type Constructor,
  type Transport,
} from "./routing/routes";
import {
  createServerRenderer,
  type ServerOptions,
  type ServerRequest,
  type ServerRenderer,
} from "./rendering/server";
import { SocketHub } from "./platform/websocket";

export interface YveeOptions {
  base?: string;
  history?: boolean;
  id?: string;
  /** Browser entry directory or JavaScript file URL. Defaults to `.`, which resolves to `./index.js` relative to the app's base URL. */
  client?: string;
  index?: string;
}

export interface MountOptions<T> {
  id?: string;
  data?: T;
  class?: string | string[];
  hydrate?: boolean;
  nonce?: string;
}

/**
 * The value returned by `render()` can be called on a server to create HTML.
 * In a browser it also behaves like the mount promise for backwards-compatible
 * client startup (`app.render().then(...)`).
 */
export type RenderResult<T extends Record<string, unknown>> =
  ServerRenderer<T> & Promise<() => void>;

export type { Layout };

export class Yvee<
  T extends Record<string, unknown> = Record<string, unknown>,
> extends HeadDefaults {
  readonly id: string;
  readonly routes: RouteBook;
  readonly url: IStateful<YveeURL>;
  readonly loading: IStateful<boolean>;
  readonly socket: SocketHub;
  readonly history: {
    navigate: (path: string | YveeURL, state?: Record<string, unknown>) => void;
    replace: (path: string | YveeURL, state?: Record<string, unknown>) => void;
    back: () => void;
    forward: () => void;
  };

  data = {} as T;
  resources = new DisposalScope();

  private readonly root: IStateful<unknown[]>;
  private readonly pageErrors = new Map<number, Constructor<Page>>();
  private readonly globalGuards: Guard<Yvee<T>, Page<T>, T>[] = [];
  private readonly client: YveeClient;
  private layout: Layout | undefined;
  onError?: (error: unknown, url: YveeURL) => void;

  constructor(options: YveeOptions = {}) {
    super();

    const base = normalizePath(options.base ?? "/");
    const useHistory = options.history ?? true;
    this.id = options.id ?? Math.random().toString(36).slice(2, 9);
    this.url = State(toURL("/"));
    this.loading = State(false);
    this.root = State<unknown[]>([], { onError() {} });
    this.routes = new RouteBook(base);
    this.socket = new SocketHub(this);

    this.head({
      base: [{ href: base === "/" ? "/" : `${base}/` }],
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      ],
      script: [
        {
          type: "module",
          src: resolveClientEntry(options.client ?? "."),
        },
      ],
      ...(options.index ? { js: options.index } : {}),
    });

    this.client = new YveeClient({
      id: this.id,
      base,
      useHistory,
      url: this.url,
      root: this.root,
      load: (url, signal, error) => this.load(url, signal, error),
      getHead: () => this.values,
      getLayout: () => this.layout,
      onLoading: (loading) => {
        this.loading.value = loading;
      },
      onError: (error, url) => {
        if (this.onError) this.onError(error, url);
        else console.error("Yvee page transition failed", error);
      },
      onMount: () => {
        if (this.resources.disposed) this.resources = new DisposalScope();
      },
      onUnmount: () => {
        const errors: unknown[] = [];
        try {
          this.resources.dispose();
        } catch (error) {
          errors.push(error);
        }
        try {
          this.socket.closeAll();
        } catch (error) {
          errors.push(error);
        }
        if (errors.length)
          throw new AggregateError(
            errors,
            "Owned app resources failed to close.",
          );
      },
    });

    this.history = {
      navigate: (path, state) => this.client.navigate(path, state),
      replace: (path, state) => this.client.navigate(path, state, true),
      back: () => this.client.back(),
      forward: () => this.client.forward(),
    };
  }

  Main(layout?: Layout) {
    this.layout = layout;
    return this;
  }

  use(...guards: Guard<Yvee<T>, Page<T>, T>[]) {
    this.globalGuards.push(...guards);
    return this;
  }

  head(value: HeadResult) {
    super.head(value);
    return this;
  }

  route(path: string) {
    return <C extends Constructor<Page>>(controller: C) => {
      this.routes.add(path, controller);
      return controller;
    };
  }

  error(code: number, controller: Constructor<Page>) {
    this.pageErrors.set(code, controller);
    return this;
  }

  register(...controllers: Constructor[]) {
    for (const controller of controllers) {
      const status = errorStatus(controller);
      if (status !== undefined)
        this.error(status, controller as Constructor<Page>);
      for (const metadata of routeMetadata(controller)) {
        this.routes.add(metadata.path, controller, metadata.transport);
      }
    }
    return this;
  }

  listRoutes(transport?: Transport) {
    return this.routes.all(transport);
  }

  /** Page paths including the base, with parameter names used as sample values. */
  listPaths(): string[] {
    return [...new Set(this.routes.all("page").map(({ path }) =>
      path.split("/").map(segment =>
        segment.startsWith(":") ? segment.slice(1) : segment,
      ).join("/"),
    ))];
  }

  /** Render a concrete route URL to a complete HTML document without mounting. */
  renderHTML(
    url: ServerRequest<T>["url"],
    options: Omit<ServerRequest<T>, "url"> = {},
  ): Promise<string> {
    return this.server()({ ...options, url });
  }

  render(options: MountOptions<T> = {}): RenderResult<T> {
    const inBrowser = typeof document !== "undefined";
    this.data =
      options.data ??
      (inBrowser ? readBootstrapData<T>() : undefined) ??
      ({} as T);
    const renderer = this.server({
      ...(options.id ? { id: options.id } : {}),
      ...(options.class ? { class: options.class } : {}),
      data: this.data,
    });
    const mount = inBrowser
      ? this.client
          .mount({
            ...(options.id ? { id: options.id } : {}),
            ...(options.class ? { className: options.class } : {}),
            ...(options.hydrate === undefined
              ? {}
              : { hydrate: options.hydrate }),
            ...(options.nonce === undefined ? {} : { nonce: options.nonce }),
          })
          .then(() => {
            document.body.dataset.yveeReady = "true";
          })
      : Promise.resolve(() => {});
    // A default-exported render result can start browser mounting without a
    // separate client entry awaiting it. Keep its rejection observable to
    // consumers while also avoiding an unhandled rejection in that pattern.
    void mount.catch(() => {});
    const callable = Object.assign(
      (request: ServerRequest<T>) => renderer(request),
      { withStatus: renderer.withStatus },
    );
    return Object.assign(callable, {
      then: mount.then.bind(mount),
      catch: mount.catch.bind(mount),
      finally: mount.finally.bind(mount),
    }) as RenderResult<T>;
  }

  dispose() {
    this.client.dispose();
  }

  server(options: ServerOptions<T> = {}): ServerRenderer<T> {
    return createServerRenderer(
      {
        id: this.id,
        defaults: this.values,
        routes: this.routes,
        errors: this.pageErrors,
        guards: this.globalGuards as Guard<any, any, any>[],
        data: this.data,
        ...(this.layout ? { layout: this.layout } : {}),
        app: this,
      },
      options,
    );
  }

  private load(url: YveeURL, signal: AbortSignal, error?: number) {
    return loadPage({
      app: this,
      routes: this.routes,
      globalGuards: this.globalGuards,
      errors: this.pageErrors,
      url,
      data: this.data,
      ...(error === undefined ? {} : { error }),
      signal,
    });
  }
}

function readBootstrapData<T extends Record<string, unknown>>(): T | undefined {
  const script = document.getElementById("ssr");
  if (!script?.textContent) return undefined;
  try {
    const value: unknown = JSON.parse(script.textContent);
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return value as T;
    }
    throw new TypeError("Yvee SSR payload must be a JSON object.");
  } catch (error) {
    console.error("Could not read Yvee SSR payload", error);
    return undefined;
  }
}

function resolveClientEntry(client: string) {
  const path = client.startsWith("/") || client.startsWith(".")
    ? client
    : `/${client}`;
  return /\.js(?:[?#]|$)/i.test(path)
    ? path
    : `${path.replace(/\/+$/, "")}/index.js`;
}

import { DisposalScope } from "@/core/disposal.core";
import { State, type IStateful } from "@/core/core.core";
import type { YveeURL } from "../routing/path";
import type { HeadResult } from "../rendering/head";
import { dom } from "@/dom/render/node.dom";

/** A lazily imported in-page region view, using the same `default` contract as `body()`. */
export interface RegionModule {
  default: (context: { page: Page }) => unknown | Promise<unknown>;
}

/** Imports one region view module; the runtime caches the promise per page and region. */
export type RegionLoader = () => Promise<RegionModule>;

/** The browser hydration window opened by one document load. @internal */
export interface HydrationPass {
  consumed: boolean;
  closed: boolean;
}

let activeHydration: HydrationPass | undefined;

/**
 * Open the hydration window for an initial browser render.
 * `Yvee.render()` calls this before the first page is constructed.
 * @internal
 */
export function startHydrationPass(): HydrationPass {
  const pass: HydrationPass = { consumed: false, closed: false };
  activeHydration = pass;
  return pass;
}

/**
 * Close a hydration window when its initial mount settles. Pages constructed
 * during the window keep the reference but stop serving data once closed.
 * @internal
 */
export function finishHydrationPass(pass: HydrationPass) {
  pass.closed = true;
  if (activeHydration === pass) activeHydration = undefined;
}

function captureHydrationPass(): HydrationPass | undefined {
  return activeHydration && !activeHydration.closed ? activeHydration : undefined;
}

export class Page<TData extends Record<string, unknown> = Record<string, unknown>> {
  readonly resources = new DisposalScope();
  url: YveeURL = { path: "/", search: "", hash: "", params: new URLSearchParams() };
  path = "/";
  params: Record<string, string> = {};
  data = {} as TData;
  error?: unknown;
  status = 200;
  #hydration = typeof document === "undefined"
    ? undefined
    : captureHydrationPass();
  fetch?(context: PageFetchContext<TData>): Partial<TData> | Promise<Partial<TData>>;
  head?(): HeadResult | Promise<HeadResult>;
  body?(): unknown | Promise<unknown>;

  /**
   * Query parameter that selects the active region, for example `"tab"`.
   * Set it together with `regions`; without either value regions stay inactive.
   */
  regionParam?: string;
  /** Region shown when the URL omits the region parameter or names an unknown region. */
  defaultRegion?: string;
  /**
   * Remember the region the user last opened on this page's path and reopen it
   * when a later in-app navigation omits the region parameter. Explicit region
   * parameters always win, and fresh document loads keep rendering the URL's
   * region. Requires `regions` and `regionParam`.
   */
  rememberRegion?: boolean;
  /**
   * Lazily imported region views keyed by region id. Switching regions updates
   * the URL query parameter without a page transition, so the page shell stays
   * mounted while only `regionContent` changes.
   */
  regions?: Record<string, RegionLoader>;
  /**
   * Id of the displayed region. The runtime owns this value: it writes the id
   * after resolving the URL, so views should only read it (for example to mark
   * the active tab). Do not assign to it from a view.
   */
  readonly region: IStateful<string> = State("");
  /**
   * Outlet content for the active region. Render this state inside the page
   * view; the runtime replaces its value during region switches. Treat it as
   * read-only from application code.
   */
  readonly regionContent: IStateful<unknown> = State<unknown>(undefined);
  /**
   * Resources owned by the active region. Each activation starts a fresh scope
   * and the previous scope is disposed before the next region renders. Page
   * `resources` are independent and only close when the page is left.
   */
  regionResources = new DisposalScope();

  /**
   * Read the server-seeded data for this document at most once.
   *
   * During SSR (no `document`) it returns `this.data` on every call, so server
   * renders are deterministic. In the browser it returns the hydrated payload
   * for the first call of the initial mount and `undefined` for later calls,
   * re-renders and client-side navigations. `page.data` is never modified.
   */
  ssrData<T extends Record<string, unknown> = TData>(): T | undefined {
    if (typeof document === "undefined") return this.data as unknown as T;
    const pass = this.#hydration;
    if (!pass || pass.closed || pass.consumed) return undefined;
    pass.consumed = true;
    return this.data as unknown as T;
  }
}

export interface PageFetchContext<TData extends Record<string, unknown>> {
  url: YveeURL;
  params: Readonly<Record<string, string>>;
  data: TData;
  signal: AbortSignal;
  resources: DisposalScope;
}

export class MissingPage extends Page {
  body() {
    return <main role="status">Page not found: {this.path}</main>;
  }
}

export class FailurePage extends Page {
  override status = 500;

  body() {
    return <main role="alert">This page could not be loaded.</main>;
  }
}

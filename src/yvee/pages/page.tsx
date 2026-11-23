import { DisposalScope } from "@/core/disposal.core";
import { State, type IStateful } from "@/core/core.core";
import type { YveeURL } from "../routing/path";
import type { HeadResult } from "../rendering/head";
import type { RegionGuard } from "../guards/guards";
import { dom } from "@/dom/render/node.dom";

/**
 * State retained for a region between renders. `get` returns the value stored
 * by the previous render of the same region (or `undefined`), and `set` keeps
 * `value` for its next render. The runtime owns storage: values are plain data
 * that dies with the page, and they are only retained on pages that set
 * `Page.keepAlive`.
 */
export interface RegionCache {
  /** Value retained by the previous render of this region, or `undefined`. */
  get(): unknown;
  /** Store `value` for this region's next render. */
  set(value: unknown): void;
}

/** A lazily imported in-page region view, using the same `default` contract as `body()`. */
export interface RegionModule {
  /**
   * Render the region view. `cache` is always provided: it is a working
   * read/write store on `keepAlive` pages and a no-op store everywhere else,
   * so modules stay portable.
   */
  default: (context: { page: Page; cache: RegionCache }) => unknown | Promise<unknown>;
  /**
   * Head contributed while this region is displayed. Accepts the same values
   * as a body module `head`; the runtime recombines it with the page head on
   * region changes without a route transition.
   */
  head?: HeadResult | ((context: { page: Page }) => HeadResult | Promise<HeadResult>);
}

/** Context passed to `Page.regionWillLeave` before a region changes. */
export interface RegionLeaveContext<TData extends Record<string, unknown> = Record<string, unknown>> {
  /** Region currently displayed. */
  from: string;
  /** Region the navigation wants to display. */
  to: string;
  /** Target URL; the navigation is not committed when the hook runs. */
  url: YveeURL;
  /** Route parameters of the current page. */
  params: Record<string, string>;
  /** Mutable page data, including any data merged by earlier region refreshes. */
  data: TData;
  /** Page-lifetime abort signal; aborts when the page is left. */
  signal: AbortSignal;
}

/** Context passed to `Page.regionDidEnter` after a region view has settled. */
export interface RegionEnterContext {
  /** Region that is now displayed. */
  region: string;
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
   * Retain plain state per region between renders on this page (off by
   * default). `true` keeps the five most recently rendered regions, and a
   * number sets that bound. Retained values are handed back through the
   * `cache` context member on the next render of the same region, which lets
   * form data, selections or fetched lists survive tab round-trips; the DOM is
   * rebuilt every time, so effects and subscriptions still belong to
   * `regionResources`. Requires `regions` and `regionParam`.
   */
  keepAlive?: number | true;
  /**
   * Guards that run when a region becomes active, keyed by region id. They run
   * before the region is imported and rendered, before `regionWillLeave`, and
   * before any history write, scroll capture or view change.
   *
   * On the initial load the resolved region's guards run after region
   * resolution (an unknown id resolves to `defaultRegion` first, and
   * `strictRegions` still 404s before them): `redirect` returns to the normal
   * server/client redirect loop, while `stop` leaves the request without a
   * page. Because a first-load `stop` has no client render path, login-style
   * gates should return `redirect` with `returnTo` instead.
   *
   * During an in-page swap a `stop` changes nothing at all, and a `redirect`
   * re-enters navigation at the redirect target. A history move that is denied
   * restores the previous URL. Guards are not run when the target region is
   * already displayed.
   */
  regionGuards?: Record<string, RegionGuard<any, any, any>[]>;
  /**
   * Re-run `fetch` in the incoming region's scope on every in-page region
   * change, so a region can load its own data without a full page load. The
   * result merges into `page.data` before the region view renders. Ignored
   * without `regions` or `fetch`, and the initial document load keeps using the
   * normal `fetch` pass.
   */
  refreshOnRegionChange?: boolean;
  /**
   * Reject region ids the page does not declare. On the initial load an unknown
   * id renders the 404 error page; an in-app navigation or history move to an
   * unknown id is denied and the previous URL is restored instead of falling
   * back to `defaultRegion`. Off by default, which keeps the canonicalizing
   * default-region fallback.
   */
  strictRegions?: boolean;
  /**
   * Runs before an in-page region change writes history or swaps the view.
   * Throwing (or rejecting) cancels the navigation: the URL, history entry and
   * displayed region stay untouched and the error is reported through
   * `onError`. Not called when the target region is already displayed.
   */
  regionWillLeave?(context: RegionLeaveContext<TData>): void | Promise<void>;
  /**
   * Runs after an in-page region swap or region history move has settled.
   * Errors are reported through `onError` after the swap has committed. The
   * initial document load does not call this hook.
   */
  regionDidEnter?(context: RegionEnterContext): void | Promise<void>;
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

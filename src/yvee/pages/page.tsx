import { DisposalScope } from "@/core/disposal.core";
import type { YveeURL } from "../routing/path";
import type { HeadResult } from "../rendering/head";
import { dom } from "@/dom/render/node.dom";

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

import { checkGuards, checkRegionGuards, guardsFor, type Guard } from "../guards";
import {
  combineHead,
  normalizeHeadValue,
  type HeadConfig,
  type HeadResult,
} from "../rendering/head";
import { FailurePage, MissingPage, type Page } from "../pages/page";
import type { YveeURL } from "../routing/path";
import { RouteBook, type Constructor } from "../routing/routes";
import { clearRegionCache, regionCache, regionHead, regionModule, resolveRegionId } from "./regions";

export type PageLoad =
  | {
      kind: "ready";
      status: number;
      body: unknown[];
      head: HeadConfig;
      /** Head contribution of the initially displayed region, when it declares one. */
      regionHead?: HeadConfig;
      /** Route-level head before the region contribution, for later recombination. */
      baseHead?: HeadConfig;
      url: YveeURL;
      page?: Page;
      failure?: unknown;
      dispose?: () => void;
    }
  | { kind: "stop" }
  | { kind: "redirect"; to: string; replace?: boolean };

interface LoadPageOptions<TData extends Record<string, unknown>, TApp> {
  app: TApp;
  routes: RouteBook;
  globalGuards: Guard<TApp, Page<TData>, TData>[];
  errors: Map<number, Constructor<Page>>;
  error?: number;
  url: YveeURL;
  data: TData;
  signal: AbortSignal;
}

export async function loadPage<TData extends Record<string, unknown>, TApp>({
  app,
  routes,
  globalGuards,
  errors,
  error,
  url,
  data,
  signal,
}: LoadPageOptions<TData, TApp>): Promise<PageLoad> {
  const match = routes.find(url.path);
  const Controller = match?.entry.controller as Constructor<Page> | undefined;
  const status = error ?? (Controller ? undefined : 404);
  const ErrorPage = errors.get(status ?? 404) ?? (status === 404 ? MissingPage : FailurePage);
  const page = (status === undefined && Controller ? new Controller() : new ErrorPage()) as Page<TData>;
  if (status !== undefined) page.status = status;

  assignRoute(page, url, match?.params, data);
  ownPageSignal(page, signal);

  try {
    const decision = await checkGuards(
      [...globalGuards, ...guardsFor(page.constructor)],
      { app, page, url, params: page.params, data: page.data, signal },
    );
    if (decision.kind !== "allow") { disposePage(page); return decision; }

    const loaded = await renderPage(page, url, app, signal);
    if ("decision" in loaded) { disposePage(page); return loaded.decision; }
    return { ...loaded, url, dispose: pageDispose(page) };
  } catch (failure) {
    disposePage(page);
    if (signal.aborted) throw signal.reason ?? failure;
    return renderFailure({
      app,
      errors,
      globalGuards,
      url,
      data,
      failure,
      signal,
      original: page,
    });
  }
}

function assignRoute(
  page: Page,
  url: YveeURL,
  params: Record<string, string> | undefined,
  data: Record<string, unknown>,
) {
  page.url = url;
  page.path = url.path;
  page.params = params ?? {};
  page.data = Object.assign(Object.create(null), page.data, data);
}

async function renderPage(page: Page, url: YveeURL, app: unknown, signal: AbortSignal) {
  if (signal.aborted) throw signal.reason ?? new Error("Page load aborted.");

  assertStrictRegion(page);
  if (page.fetch) {
    const fetched = await page.fetch({
      url,
      params: page.params,
      data: page.data,
      signal: page.resources.signal,
      resources: page.resources,
    });
    Object.assign(page.data, fetched);
  }

  if (signal.aborted) throw signal.reason ?? new Error("Page load aborted.");
  const region = await initializeRegion(page, app, signal);
  // A region guard that stops or redirects replaces the whole page load.
  if (region.decision) return { decision: region.decision };
  if (signal.aborted) throw signal.reason ?? new Error("Page load aborted.");
  const bodyModule = await page.body?.();
  if (signal.aborted) throw signal.reason ?? new Error("Page load aborted.");

  const { bodyValue, moduleHead } = await resolveBodyModule(bodyModule, page);
  signal.throwIfAborted();
  const routeHead = await page.head?.();
  signal.throwIfAborted();
  const baseHead = combineHead(
    normalizeHeadValue(moduleHead),
    normalizeHeadValue(routeHead),
  );
  const head = region.head ? combineHead(baseHead, region.head) : baseHead;

  return {
    kind: "ready" as const,
    status: page.status,
    head,
    ...(region.head ? { regionHead: region.head } : {}),
    baseHead,
    body: Array.isArray(bodyValue) ? bodyValue : [bodyValue ?? ""],
    page,
  };
}

/**
 * Strict pages treat an unknown region id as a missing page, reusing the
 * existing 404 error-page path on both the server and the client.
 */
function assertStrictRegion(page: Page) {
  if (!page.strictRegions) return;
  if (resolveRegionId(page, page.url)?.unknown !== undefined) {
    throw new Response(null, { status: 404 });
  }
}

/**
 * A region guard denial on the initial load. A `redirect` continues through the
 * normal redirect loop; a `stop` replaces the whole page load.
 */
type RegionDenial = Extract<PageLoad, { kind: "stop" | "redirect" }>;

type RegionInit =
  | { head?: HeadConfig; decision?: undefined }
  | { head?: undefined; decision: RegionDenial };

/**
 * Region views render on the critical path so SSR and hydration agree on the
 * requested region. The module cache makes later switches instantaneous. The
 * resolved region's guards run before its module imports or renders, and an
 * unknown id has already resolved to `defaultRegion`, so guards see the region
 * the page will actually display.
 */
async function initializeRegion(page: Page, app: unknown, signal: AbortSignal): Promise<RegionInit> {
  if (!page.regions || !page.regionParam) return {};
  const resolution = resolveRegionId(page, page.url);
  if (!resolution?.id) return {};
  const id = resolution.id;
  const decision = await entryRegionDecision(page, app, id, signal);
  if (decision) return { decision };
  page.region.value = id;
  const module = await regionModule(page, id);
  page.regionContent.value = await module.default({ page, cache: regionCache(page, id) });
  const head = await regionHead(page, module);
  return head === undefined ? {} : { head };
}

/** Guards for the initially displayed region, with `from` empty as on any first load. */
async function entryRegionDecision(
  page: Page,
  app: unknown,
  region: string,
  signal: AbortSignal,
): Promise<RegionDenial | undefined> {
  const guards = page.regionGuards?.[region];
  if (!guards || guards.length === 0) return undefined;
  const decision = await checkRegionGuards(guards, {
    app,
    page,
    url: page.url,
    params: page.params,
    data: page.data,
    signal,
    region,
    from: undefined,
  });
  return decision.kind === "allow" ? undefined : decision;
}

interface LazyPageModule {
  default: unknown | ((props: { page: Page }) => unknown | Promise<unknown>);
  head?: HeadResult | Promise<HeadResult> | ((props: { page: Page }) => HeadResult | Promise<HeadResult>);
}

async function resolveBodyModule(value: unknown, page: Page) {
  if (!isLazyPageModule(value)) {
    return { bodyValue: value, moduleHead: undefined };
  }

  const moduleHead = typeof value.head === "function"
    ? await value.head({ page })
    : await value.head;
  const bodyValue = typeof value.default === "function"
    ? await value.default({ page })
    : await value.default;

  return { bodyValue, moduleHead };
}

function isLazyPageModule(value: unknown): value is LazyPageModule {
  return typeof value === "object" && value !== null && "default" in value;
}

async function renderFailure<TData extends Record<string, unknown>, TApp>({
  app,
  errors,
  globalGuards,
  url,
  data,
  failure,
  signal,
  original,
}: {
  app: TApp;
  errors: Map<number, Constructor<Page>>;
  globalGuards: Guard<TApp, Page<TData>, TData>[];
  url: YveeURL;
  data: TData;
  failure: unknown;
  signal: AbortSignal;
  original: Page<TData>;
}): Promise<PageLoad> {
  const status = failure instanceof Response && failure.status >= 400 ? failure.status : 500;
  const ErrorPage = errors.get(status) ?? (status === 404 ? MissingPage : FailurePage);
  if (original.constructor === ErrorPage) throw failure;

  const page = new ErrorPage() as Page<TData>;
  assignRoute(page, url, original.params, data);
  page.error = failure;
  page.status = status;
  ownPageSignal(page, signal);

  try {
    const decision = await checkGuards(
      [...globalGuards, ...guardsFor(page.constructor)],
      { app, page, url, params: page.params, data: page.data, signal },
    );
    if (decision.kind !== "allow") { disposePage(page); return decision; }
    const rendered = await renderPage(page, url, app, signal);
    if ("decision" in rendered) { disposePage(page); return rendered.decision; }
    return { ...rendered, url, failure, dispose: pageDispose(page) };
  } catch (error) {
    disposePage(page);
    if (signal.aborted) throw signal.reason ?? error;
    throw new AggregateError([failure, error], "Yvee error page failed to render.");
  }
}

function ownPageSignal(page: Page, signal: AbortSignal) {
  const abort = () => {
    try { disposePage(page); }
    catch (error) { console.error("Yvee aborted page cleanup failed", error); }
  };
  if (signal.aborted) abort();
  else {
    signal.addEventListener("abort", abort, { once: true });
    page.resources.defer(() => signal.removeEventListener("abort", abort));
  }
}

/** Dispose the active region scope before the page scope when a page is left. */
function disposePage(page: Page) {
  const errors: unknown[] = [];
  try { page.regionResources.dispose(); } catch (error) { errors.push(error); }
  try { page.resources.dispose(); } catch (error) { errors.push(error); }
  clearRegionCache(page);
  if (errors.length === 1) throw errors[0];
  if (errors.length) throw new AggregateError(errors, "Yvee page cleanup failed.");
}

/** Cleanup closure kept by the runtime for the lifetime of the loaded page. */
function pageDispose(page: Page) {
  return () => disposePage(page);
}

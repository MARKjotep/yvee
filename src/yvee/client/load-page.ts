import { checkGuards, guardsFor, type Guard } from "../guards";
import {
  combineHead,
  normalizeHeadValue,
  type HeadConfig,
  type HeadResult,
} from "../rendering/head";
import { FailurePage, MissingPage, type Page } from "../pages/page";
import type { YveeURL } from "../routing/path";
import { RouteBook, type Constructor } from "../routing/routes";
import { regionIdFor, renderRegion } from "./regions";

export type PageLoad =
  | { kind: "ready"; status: number; body: unknown[]; head: HeadConfig; url: YveeURL; page?: Page; failure?: unknown; dispose?: () => void }
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

    const loaded = await renderPage(page, url, signal);
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

async function renderPage(page: Page, url: YveeURL, signal: AbortSignal) {
  if (signal.aborted) throw signal.reason ?? new Error("Page load aborted.");

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
  await initializeRegion(page);
  if (signal.aborted) throw signal.reason ?? new Error("Page load aborted.");
  const bodyModule = await page.body?.();
  if (signal.aborted) throw signal.reason ?? new Error("Page load aborted.");

  const { bodyValue, moduleHead } = await resolveBodyModule(bodyModule, page);
  signal.throwIfAborted();
  const routeHead = await page.head?.();
  signal.throwIfAborted();
  const head = combineHead(
    normalizeHeadValue(moduleHead),
    normalizeHeadValue(routeHead),
  );

  return {
    kind: "ready" as const,
    status: page.status,
    head,
    body: Array.isArray(bodyValue) ? bodyValue : [bodyValue ?? ""],
    page,
  };
}

/**
 * Region views render on the critical path so SSR and hydration agree on the
 * requested region. The module cache makes later switches instantaneous.
 */
async function initializeRegion(page: Page) {
  if (!page.regions || !page.regionParam) return;
  const id = regionIdFor(page, page.url);
  if (!id) return;
  page.region.value = id;
  page.regionContent.value = await renderRegion(page, id);
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
    return { ...(await renderPage(page, url, signal)), url, failure, dispose: pageDispose(page) };
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
  if (errors.length === 1) throw errors[0];
  if (errors.length) throw new AggregateError(errors, "Yvee page cleanup failed.");
}

/** Cleanup closure kept by the runtime for the lifetime of the loaded page. */
function pageDispose(page: Page) {
  return () => disposePage(page);
}

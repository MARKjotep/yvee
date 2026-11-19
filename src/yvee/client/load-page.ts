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

export type PageLoad =
  | { kind: "ready"; status: number; body: unknown[]; head: HeadConfig; url: YveeURL; failure?: unknown; dispose?: () => void }
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
    if (decision.kind !== "allow") { page.resources.dispose(); return decision; }

    const loaded = await renderPage(page, url, signal);
    return { ...loaded, url, dispose: () => page.resources.dispose() };
  } catch (failure) {
    page.resources.dispose();
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
  };
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
    if (decision.kind !== "allow") { page.resources.dispose(); return decision; }
    return { ...(await renderPage(page, url, signal)), url, failure, dispose: () => page.resources.dispose() };
  } catch (error) {
    page.resources.dispose();
    if (signal.aborted) throw signal.reason ?? error;
    throw new AggregateError([failure, error], "Yvee error page failed to render.");
  }
}

function ownPageSignal(page: Page, signal: AbortSignal) {
  const abort = () => {
    try { page.resources.dispose(); }
    catch (error) { console.error("Yvee aborted page cleanup failed", error); }
  };
  if (signal.aborted) abort();
  else {
    signal.addEventListener("abort", abort, { once: true });
    page.resources.defer(() => signal.removeEventListener("abort", abort));
  }
}

import { isClient } from "../platform/env";
import { urlKey, type YveeURL } from "../routing/path";
import type { Constructor } from "../routing/routes";
import type { IStateful } from "@/core/core.core";

export interface GuardApp<TData extends Record<string, unknown>> {
  data: TData;
  url: IStateful<YveeURL>;
}

/** A guard redirect decision. */
export type GuardRedirect = {
  kind: "redirect";
  /** Destination path, optionally carrying its own query and hash. */
  to: string;
  /** Keep the current history entry instead of pushing a new one. */
  replace?: boolean;
  /**
   * Preserves the URL that was rejected as a `returnTo` query parameter on
   * `to`. `true` appends the current request URL (`path + search + hash`);
   * a string appends that explicit value instead. Omit it for a bare redirect.
   */
  returnTo?: boolean | string;
};

export type GuardResult = void | { kind: "allow" } | { kind: "stop" } | GuardRedirect;

export interface GuardContext<
  TApp = unknown,
  TPage = unknown,
  TData extends Record<string, unknown> = Record<string, unknown>,
> {
  app: TApp;
  page: TPage;
  url: YveeURL;
  params: Readonly<Record<string, string>>;
  data: TData;
  signal: AbortSignal;
  /**
   * `true` while guards run without a browser `window` (server rendering or
   * Bun), `false` for client-side navigation. Always populated by the guard
   * runner, so guard code can branch without touching globals.
   */
  readonly server: boolean;
}

/**
 * Guard context accepted by the runner before the environment flag is filled
 * in. Existing call sites may omit `server`; `checkGuards` normalizes it to a
 * full `GuardContext` for every guard.
 */
export type GuardContextInput<
  TApp = unknown,
  TPage = unknown,
  TData extends Record<string, unknown> = Record<string, unknown>,
> = Omit<GuardContext<TApp, TPage, TData>, "server"> & { readonly server?: boolean };

export type Guard<
  TApp = unknown,
  TPage = unknown,
  TData extends Record<string, unknown> = Record<string, unknown>,
> = (context: GuardContext<TApp, TPage, TData>) => GuardResult | Promise<GuardResult>;

export type GuardFactory<Args extends unknown[] = [], TContext = GuardContext> =
  (...args: Args) => (context: TContext) => GuardResult | Promise<GuardResult>;

const routeGuards = new WeakMap<Function, Guard<any, any, any>[]>();

export const createGuard = <Args extends unknown[], TContext = GuardContext>(
  factory: GuardFactory<Args, TContext>,
): GuardFactory<Args, TContext> => (...args) => factory(...args);

export const use = (...guards: Guard<any, any, any>[]) =>
  <T extends Constructor>(controller: T): T => {
    // Class decorators apply bottom-up, so prepend to preserve declared order.
    routeGuards.set(controller, [...guards, ...(routeGuards.get(controller) ?? [])]);
    return controller;
  };

export const guardsFor = (controller: Function): readonly Guard<any, any, any>[] =>
  routeGuards.get(controller) ?? [];

/**
 * Returns `to` with the request URL (`path + search + hash`) appended as an
 * encoded `returnTo` query parameter. Guards can set `returnTo: true` instead;
 * this helper is for building a redirect target by hand.
 */
export function buildReturnTo(url: YveeURL, to: string): string {
  return appendQuery(to, "returnTo", urlKey(url));
}

/**
 * Reads and decodes a `returnTo` query parameter from a redirect target, a
 * `URL`, or a parsed `YveeURL`. Returns `undefined` when the parameter is
 * absent, so a login view can fall back to its default destination.
 */
export function readReturnTo(url: string | URL | YveeURL): string | undefined {
  if (typeof url === "string") {
    const queryIndex = url.indexOf("?");
    if (queryIndex === -1) return undefined;
    const hashIndex = url.indexOf("#", queryIndex);
    const search = url.slice(queryIndex + 1, hashIndex === -1 ? undefined : hashIndex);
    return new URLSearchParams(search).get("returnTo") ?? undefined;
  }
  if (url instanceof URL) return url.searchParams.get("returnTo") ?? undefined;
  return url.params.get("returnTo") ?? undefined;
}

function appendQuery(to: string, name: string, value: string): string {
  const hashIndex = to.indexOf("#");
  const head = hashIndex === -1 ? to : to.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : to.slice(hashIndex);
  const encoded = `${name}=${encodeURIComponent(value)}`;
  const queryIndex = head.indexOf("?");
  if (queryIndex === -1) return `${head}?${encoded}${hash}`;

  const pathname = head.slice(0, queryIndex);
  const query = head.slice(queryIndex + 1);
  const separator = !query || query.endsWith("&") ? "" : "&";

  return `${pathname}?${query}${separator}${encoded}${hash}`;
}

function resolveDecision(
  result: Exclude<GuardResult, void | { kind: "allow" }>,
  url: YveeURL,
): Exclude<GuardResult, void | { kind: "allow" }> {
  if (result.kind !== "redirect" || result.returnTo === undefined || result.returnTo === false) {
    return result;
  }

  const { returnTo, ...redirect } = result;
  return {
    ...redirect,
    to: appendQuery(result.to, "returnTo", returnTo === true ? urlKey(url) : returnTo),
  };
}

export async function checkGuards<TApp, TPage, TData extends Record<string, unknown>>(
  guards: readonly Guard<TApp, TPage, TData>[],
  context: GuardContextInput<TApp, TPage, TData>,
) {
  const guarded: GuardContext<TApp, TPage, TData> = {
    ...context,
    server: context.server ?? !isClient,
  };

  for (const guard of guards) {
    guarded.signal.throwIfAborted();
    const result = await guard(guarded);
    guarded.signal.throwIfAborted();
    if (result && result.kind !== "allow") return resolveDecision(result, guarded.url);
  }

  return { kind: "allow" as const };
}

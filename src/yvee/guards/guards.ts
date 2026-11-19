import type { YveeURL } from "../routing/path";
import type { Constructor } from "../routing/routes";
import type { IStateful } from "@/core/core.core";

export interface GuardApp<TData extends Record<string, unknown>> {
  data: TData;
  url: IStateful<YveeURL>;
}

export type GuardResult =
  | void
  | { kind: "allow" }
  | { kind: "stop" }
  | { kind: "redirect"; to: string; replace?: boolean };

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
}

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

export async function checkGuards<TApp, TPage, TData extends Record<string, unknown>>(
  guards: readonly Guard<TApp, TPage, TData>[],
  context: GuardContext<TApp, TPage, TData>,
) {
  for (const guard of guards) {
    context.signal.throwIfAborted();
    const result = await guard(context);
    context.signal.throwIfAborted();
    if (result && result.kind !== "allow") return result;
  }

  return { kind: "allow" as const };
}

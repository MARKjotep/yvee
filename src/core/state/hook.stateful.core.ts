import type { DisposalScope } from "../disposal.core";
import type { StateUpdate } from "./stateful.core";
import type { Mapper, maybePromise } from "@/utils";
import { Stateful, type IStateful, type statefulValue } from "./stateful.core";

export type hookFN<T extends any[]> = (
  ...args: statefulValue<T>
) => maybePromise<void>;

export type hookM<T extends any[]> = Mapper<string, hookFN<T>>;
/*
  -------------------------
  dom, ctx, style, etc
  -------------------------
  */
let nextHook = 0;

export interface StateHookOptions {
  id?: string;
  init?: boolean;
  signal?: AbortSignal;
  scope?: DisposalScope;
}

export async function StateHook<T extends any[]>(
  callback: hookFN<T>,
  statefuls: [...{ [K in keyof T]: IStateful<T[K]> }],
  { id = `stateHook:${++nextHook}`, init, signal, scope }: StateHookOptions = {},
) {
  signal?.throwIfAborted();
  scope?.signal.throwIfAborted();
  const hooks: (() => void)[] = [];

  const smap = () => statefuls.map((st) => st.value);
  const handler = async () => {
    await callback(...(smap() as statefulValue<T>));
  };

  //
  for (const hook of statefuls) {
    hooks.push(await (hook as Stateful<any>).hook(handler)(id));
  }

  const stop = () => {
    hooks.splice(0).forEach(unhook => unhook());
    signal?.removeEventListener("abort", stop);
  };
  signal?.addEventListener("abort", stop, { once: true });
  scope?.defer(stop);
  try { if (init) await handler(); }
  catch (error) { stop(); throw error; }
  if (signal?.aborted || scope?.disposed) stop();
  return stop;
}

export async function StateLoaded<T extends any[]>(
  callback: hookFN<T>,
  statefuls: [...{ [K in keyof T]: IStateful<T[K]> }],
  { id = `stateLoad:${++nextHook}`, init, signal, scope }: StateHookOptions = {},
) {
  signal?.throwIfAborted();
  scope?.signal.throwIfAborted();
  const hooks: (() => void)[] = [];

  const smap = () => statefuls.map((st) => st.value);
  const handler = async () => {
    await callback(...(smap() as statefulValue<T>));
  };

  //
  for (const hook of statefuls) {
    hooks.push((hook as Stateful<any>).loaded(handler)(id));
  }

  const stop = () => {
    hooks.splice(0).forEach(unhook => unhook());
    signal?.removeEventListener("abort", stop);
  };
  signal?.addEventListener("abort", stop, { once: true });
  scope?.defer(stop);
  try { if (init) await handler(); }
  catch (error) { stop(); throw error; }
  if (signal?.aborted || scope?.disposed) stop();
  return stop;
}

export function hook<T extends any[]>(
  callback: hookFN<T>,
  statefuls: [...{ [K in keyof T]: IStateful<T[K]> }],
  init: boolean = false,
): [hookFN<T>, [...{ [K in keyof T]: IStateful<T[K]> }], boolean, boolean] {
  return [callback, statefuls, init, false];
}

export function loaded<T extends any[]>(
  callback: hookFN<T>,
  statefuls: [...{ [K in keyof T]: IStateful<T[K]> }],
  init: boolean = false,
): [hookFN<T>, [...{ [K in keyof T]: IStateful<T[K]> }], boolean, boolean] {
  return [callback, statefuls, init, true];
}

export const handleHooks = async (hooks: hookM<any>) => {
  for (const [k, v] of hooks.entries()) {
    await v();
  }
  return Boolean(hooks.size);
};

export const handleLoads = async (hooks: hookM<any>) => {
  for (const [k, v] of hooks.entries()) {
    await v();
  }
  return Boolean(hooks.size);
};

/** Cooperative async effects: a newer update or disposal aborts the previous context. */
export async function StateEffect<T extends any[]>(
  callback: (update: StateUpdate, ...values: statefulValue<T>) => maybePromise<void>,
  states: [...{ [K in keyof T]: IStateful<T[K]> }],
  options: StateHookOptions = {},
) {
  options.signal?.throwIfAborted(); options.scope?.signal.throwIfAborted();
  let current: AbortController | undefined;
  let stopLink: (() => void) | undefined;
  const stops: (() => void)[] = [];
  let disposed = false;
  const cleanup = () => {
    disposed = true; current?.abort(); stopLink?.();
    stops.splice(0).forEach(stop => stop());
    options.signal?.removeEventListener("abort", cleanup);
  };
  const handler = async (update: StateUpdate) => {
    if (disposed) return;
    current?.abort(); stopLink?.();
    const controller = new AbortController(); current = controller;
    const abort = () => controller.abort();
    update.signal.addEventListener("abort", abort, { once: true });
    stopLink = () => update.signal.removeEventListener("abort", abort);
    if (update.signal.aborted) abort();
    try {
      await callback({ signal: controller.signal, isCurrent: () => !controller.signal.aborted && update.isCurrent() }, ...(states.map(state => state.value) as statefulValue<T>));
    } catch (error) { controller.abort(); stopLink?.(); throw error; }
  };
  const id = options.id ?? `stateEffect:${++nextHook}`;
  options.signal?.addEventListener("abort", cleanup, { once: true });
  options.scope?.defer(cleanup);
  try {
    for (const state of states) stops.push(await (state as Stateful<unknown>).hook(handler)(id));
    if (options.init) {
      const initial = new AbortController();
      await handler({ signal: initial.signal, isCurrent: () => !disposed });
    }
    if (options.signal?.aborted || options.scope?.disposed) cleanup();
  } catch (error) { cleanup(); throw error; }
  return cleanup;
}

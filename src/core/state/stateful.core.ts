import { scheduleState } from "./batch.core";
export { batch } from "./batch.core";
import type { Equality } from "./equality.core";
import { keyInMap, Mapper } from "@/utils";
import {
  hook,
  loaded,
  StateEffect,
  StateLoaded,
  StateHook,
  type hookFN,
  type hookM,
} from "./hook.stateful.core";
import { getElementById, type Elements } from "@/$/query.$";

export { shallowEqual, type Equality } from "./equality.core";

export interface StateOptions<T> extends AddEventListenerOptions {
  /** false emits on every assignment; otherwise true means unchanged. */
  equals?: Equality<T> | false;
  /** Errors are also retained until flush() observes them. */
  onError?: (error: unknown) => void;
}

export { StateHook, StateEffect, StateLoaded, loaded, hook };
export type { StateHookOptions } from "./hook.stateful.core";

export type statefulValue<T extends any[]> = {
  [K in keyof T]: T[K] extends IStateful<infer U> ? U : T[K];
};


export interface StateUpdate {
  readonly signal: AbortSignal;
  isCurrent(): boolean;
}

export class Stateful<T> extends EventTarget {
  private hooks: Mapper<string, (update: StateUpdate) => unknown> = new Mapper();
  private loads: hookM<any> = new Mapper();
  private states: Mapper<string, Mapper<string, (this: Elements, value: T, update: StateUpdate) => unknown>> = new Mapper();
  protected _value: T;
  private listening = false;
  private controller = new AbortController();
  private readonly pending = new Set<Promise<void>>();
  private readonly failures: unknown[] = [];
  private readonly emit = () => {
    this.controller.abort();
    this.controller = new AbortController();
    this.dispatchEvent(new CustomEvent("updated", { detail: this._value }));
  };
  private end?: (() => void) | undefined;

  constructor(
    value: T,
    private options: StateOptions<T> = {},
  ) {
    super();
    this._value = value;
  }
  get value() {
    return this._value;
  }
  get clone() {
    return structuredClone(this._value);
  }
  set value(newValue: T) {
    const equals = this.options.equals ?? Object.is;
    if (equals !== false && equals(this._value, newValue)) return;
    this._value = newValue;
    this.dispatch();
  }

  /** Wait for current framework hooks, DOM bindings and loaded hooks; reject observed errors once. */
  async flush(): Promise<void> {
    while (this.pending.size) await Promise.all([...this.pending]);
    const failures = this.failures.splice(0);
    if (failures.length === 1) throw failures[0];
    if (failures.length) throw new AggregateError(failures, "State updates failed.");
  }

  private report(error: unknown) {
    this.failures.push(error);
    const event = new CustomEvent("error", { detail: error, cancelable: true });
    this.dispatchEvent(event);
    try {
      if (this.options.onError) this.options.onError(error);
      else if (!event.defaultPrevented) console.error("Yvee state update failed", error);
    } catch (reportError) { console.error("Yvee state error handler failed", reportError); }
  }

  private async update(value: T, update: StateUpdate) {
    const errors: unknown[] = [];
    const attempt = async (callback: () => unknown) => {
      try { await callback(); } catch (error) { if (update.isCurrent()) errors.push(error); }
    };
    for (const [id, hook] of [...this.hooks.entries()]) {
      if (!update.isCurrent()) return;
      if (this.hooks.get(id) !== hook) continue;
      await attempt(() => hook(update));
    }
    for (const [id, bindings] of this.states) {
      const element = getElementById(id);
      if (!element || !bindings.size) { this.states.delete(id); continue; }
      for (const [entry, binding] of [...bindings.entries()]) {
        if (!update.isCurrent()) return;
        const owned = () => update.isCurrent() && this.states.get(id)?.get(entry) === binding && getElementById(id) === element;
        if (!owned()) continue;
        await attempt(() => binding.call(element, value, { signal: update.signal, isCurrent: owned }));
      }
    }
    if (!update.isCurrent()) return;
    if (!errors.length) {
      for (const [id, loaded] of [...this.loads.entries()]) {
        if (!update.isCurrent()) return;
        if (this.loads.get(id) === loaded) await attempt(loaded);
      }
      if (update.isCurrent()) this.dispatchEvent(new CustomEvent("loaded", { detail: value }));
    }
    if (errors.length === 1) throw errors[0];
    if (errors.length) throw new AggregateError(errors, "State subscribers failed.");
  }

  listen() {
    if (this.options.signal?.aborted) return () => {};
    if (!this.listening) {
      const handler = (event: Event) => {
        const controller = this.controller;
        const update: StateUpdate = { signal: controller.signal, isCurrent: () => !controller.signal.aborted };
        let stopAbort!: () => void;
        const aborted = new Promise<void>(resolve => {
          const done = () => resolve();
          controller.signal.addEventListener("abort", done, { once: true });
          stopAbort = () => controller.signal.removeEventListener("abort", done);
        });
        const work = this.update((event as CustomEvent<T>).detail, update).catch(error => {
          if (update.isCurrent()) this.report(error);
        });
        const job = Promise.race([work, aborted]).finally(() => {
          stopAbort(); this.pending.delete(job); this.stopListeningWhenUnused();
        });
        this.pending.add(job);
      };
      const abort = () => this.end?.();
      this.options.signal?.addEventListener("abort", abort, { once: true });
      this.addEventListener("updated", handler, this.options);
      this.listening = true;
      this.end = () => {
        this.removeEventListener("updated", handler, this.options);
        this.options.signal?.removeEventListener("abort", abort);
        this.controller.abort();
        this.listening = false;
        this.end = undefined;
      };
    }
    return this.end!;
  }
  private stopListeningWhenUnused() {
    if (!this.states.size && !this.hooks.size && !this.loads.size) this.end?.();
  }
  call<Q>(callback: (this: Elements, arg: T, update: StateUpdate) => Q, entry: string) {
    return async (id: string) => {
      keyInMap<Mapper<string, (this: Elements, value: T, update: StateUpdate) => unknown>>(id, this.states).set(entry, callback);
      this.listen();
      return () => {
        const entries = this.states.get(id);
        if (entries?.get(entry) === callback) entries.delete(entry);
        if (entries && !entries.size) this.states.delete(id);
        this.stopListeningWhenUnused();
      };
    };
  }
  hook(callback: (update: StateUpdate) => unknown) {
    return async (id: string) => {
      this.hooks.set(id, callback);
      this.listen();
      return () => {
        if (this.hooks.get(id) === callback) this.hooks.delete(id);
        this.stopListeningWhenUnused();
      };
    };
  }
  loaded<T extends any[]>(callback: hookFN<T>) {
    return (id: string) => {
      this.loads.set(id, callback);
      this.listen();
      return () => {
        if (this.loads.get(id) === callback) this.loads.delete(id);
        this.stopListeningWhenUnused();
      };
    };
  }
  protected dispatch() {
    scheduleState(this.emit);
  }
}

export class SetStateful<T extends unknown> extends Stateful<Set<T>> {
  constructor(vals: T[], options: AddEventListenerOptions = {}) {
    super(new Set(vals), options);
  }
  add(val: T) {
    if (this._value.has(val)) return;

    this._value.add(val);
    this.dispatch();
  }
  delete(val: T) {
    if (!this._value.has(val)) return;
    this._value.delete(val);
    this.dispatch();
  }
  has(val: T) {
    return this._value.has(val);
  }
  clear() {
    if (!this._value.size) return;
    this._value.clear();
    this.dispatch();
  }
}

export class RecStateful<T extends {}> extends Stateful<T> {
  constructor(val: T, options: AddEventListenerOptions = {}) {
    super(val, options);
  }
  set<X extends keyof T>(t: X, value: T[X]): void {
    const cval = this._value[t];
    if (!Object.hasOwn(this._value, t) || !Object.is(cval, value)) {
      this._value[t] = value;
      this.dispatch();
    }
  }
  delete(t: keyof T) {
    if (Object.hasOwn(this._value, t)) {
      delete this._value[t];
      this.dispatch();
    }
  }
  entries() {
    return Object.entries(this._value);
  }
}

export type IRecStateful<T extends {}> = IStateful<T> & {
  set: RecStateful<T>["set"];
  delete: RecStateful<T>["delete"];
  entries: RecStateful<T>["entries"];
};

export type ISetStateful<T extends unknown> = IStateful<Set<T>> & {
  add: SetStateful<T>["add"];
  delete: SetStateful<T>["delete"];
  has: SetStateful<T>["has"];
  clear: SetStateful<T>["clear"];
};

export type IStateful<T> = {
  value: Stateful<T>["value"];
  clone: Stateful<T>["clone"];
  flush: Stateful<T>["flush"];
};

export function State<T>(
  value: T,
  options: StateOptions<T> = {},
): IStateful<T> {
  return new Stateful(value, options);
}

export function SetState<T extends unknown>(
  value: T[],
  options: AddEventListenerOptions = {},
): ISetStateful<T> {
  return new SetStateful<T>(value, options);
}

export function RecState<T extends {}>(
  value: T,
  options: AddEventListenerOptions = {},
): IRecStateful<T> {
  return new RecStateful<T>(value, options);
}

/**
 * @deprecated Prefer State(value, { equals: false }).
 * Legacy convenience: by default emit on every assignment. Prefer State with equals: false.
 */
export function QState<T>(value: T, verify: boolean = false): IStateful<T> {
  return State(value, { equals: verify ? Object.is : false });
}

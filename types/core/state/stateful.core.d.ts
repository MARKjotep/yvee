export { batch } from "./batch.core";
import type { Equality } from "./equality.core";
import { hook, loaded, StateEffect, StateLoaded, StateHook, type hookFN } from "./hook.stateful.core";
import { type Elements } from "@/$/query.$";
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
export declare class Stateful<T> extends EventTarget {
    private options;
    private hooks;
    private loads;
    private states;
    protected _value: T;
    private listening;
    private controller;
    private readonly pending;
    private readonly failures;
    private readonly emit;
    private end?;
    constructor(value: T, options?: StateOptions<T>);
    get value(): T;
    get clone(): T;
    set value(newValue: T);
    /** Wait for current framework hooks, DOM bindings and loaded hooks; reject observed errors once. */
    flush(): Promise<void>;
    private report;
    private update;
    listen(): () => void;
    private stopListeningWhenUnused;
    call<Q>(callback: (this: Elements, arg: T, update: StateUpdate) => Q, entry: string): (id: string) => Promise<() => void>;
    hook(callback: (update: StateUpdate) => unknown): (id: string) => Promise<() => void>;
    loaded<T extends any[]>(callback: hookFN<T>): (id: string) => () => void;
    protected dispatch(): void;
}
export declare class SetStateful<T extends unknown> extends Stateful<Set<T>> {
    constructor(vals: T[], options?: AddEventListenerOptions);
    add(val: T): void;
    delete(val: T): void;
    has(val: T): boolean;
    clear(): void;
}
export declare class RecStateful<T extends {}> extends Stateful<T> {
    constructor(val: T, options?: AddEventListenerOptions);
    set<X extends keyof T>(t: X, value: T[X]): void;
    delete(t: keyof T): void;
    entries(): [string, unknown][];
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
export declare function State<T>(value: T, options?: StateOptions<T>): IStateful<T>;
export declare function SetState<T extends unknown>(value: T[], options?: AddEventListenerOptions): ISetStateful<T>;
export declare function RecState<T extends {}>(value: T, options?: AddEventListenerOptions): IRecStateful<T>;
/**
 * @deprecated Prefer State(value, { equals: false }).
 * Legacy convenience: by default emit on every assignment. Prefer State with equals: false.
 */
export declare function QState<T>(value: T, verify?: boolean): IStateful<T>;

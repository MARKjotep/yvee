import { hook, loaded, StateLoaded, StateHook, type hookFN } from "./hook.stateful.core";
import { type Elements } from "@/$/query.$";
export { StateHook, StateLoaded, loaded, hook };
export type statefulValue<T extends any[]> = {
    [K in keyof T]: T[K] extends IStateful<infer U> ? U : T[K];
};
export declare class Stateful<T> extends EventTarget {
    private options;
    private deep;
    private verify;
    private hooks;
    private loads;
    private states;
    protected _value: T;
    private listening;
    private end?;
    constructor(value: T, options?: AddEventListenerOptions, deep?: boolean, verify?: boolean);
    get value(): T;
    get clone(): T;
    set value(newValue: T);
    listen(): () => void;
    private stopListeningWhenUnused;
    call<Q>(callback: (this: Elements, arg: T) => Q, entry: string): (id: string) => Promise<() => void>;
    hook<T extends any[]>(callback: hookFN<T>): (id: string) => Promise<() => void>;
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
};
export declare function State<T>(value: T, options?: AddEventListenerOptions): IStateful<T>;
export declare function SetState<T extends unknown>(value: T[], options?: AddEventListenerOptions): ISetStateful<T>;
export declare function RecState<T extends {}>(value: T, options?: AddEventListenerOptions): IRecStateful<T>;
/**
 * Quick State checking - skip checking of Object keys:values as it will only be compared as a===b
 */
export declare function QState<T>(value: T, verify?: boolean): IStateful<T>;

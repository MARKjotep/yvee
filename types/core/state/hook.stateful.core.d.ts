import type { DisposalScope } from "../disposal.core";
import type { StateUpdate } from "./stateful.core";
import type { Mapper, maybePromise } from "@/utils";
import { type IStateful, type statefulValue } from "./stateful.core";
export type hookFN<T extends any[]> = (...args: statefulValue<T>) => maybePromise<void>;
export type hookM<T extends any[]> = Mapper<string, hookFN<T>>;
export interface StateHookOptions {
    id?: string;
    init?: boolean;
    signal?: AbortSignal;
    scope?: DisposalScope;
}
export declare function StateHook<T extends any[]>(callback: hookFN<T>, statefuls: [...{
    [K in keyof T]: IStateful<T[K]>;
}], { id, init, signal, scope }?: StateHookOptions): Promise<() => void>;
export declare function StateLoaded<T extends any[]>(callback: hookFN<T>, statefuls: [...{
    [K in keyof T]: IStateful<T[K]>;
}], { id, init, signal, scope }?: StateHookOptions): Promise<() => void>;
export declare function hook<T extends any[]>(callback: hookFN<T>, statefuls: [...{
    [K in keyof T]: IStateful<T[K]>;
}], init?: boolean): [hookFN<T>, [...{
    [K in keyof T]: IStateful<T[K]>;
}], boolean, boolean];
export declare function loaded<T extends any[]>(callback: hookFN<T>, statefuls: [...{
    [K in keyof T]: IStateful<T[K]>;
}], init?: boolean): [hookFN<T>, [...{
    [K in keyof T]: IStateful<T[K]>;
}], boolean, boolean];
export declare const handleHooks: (hooks: hookM<any>) => Promise<boolean>;
export declare const handleLoads: (hooks: hookM<any>) => Promise<boolean>;
/** Cooperative async effects: a newer update or disposal aborts the previous context. */
export declare function StateEffect<T extends any[]>(callback: (update: StateUpdate, ...values: statefulValue<T>) => maybePromise<void>, states: [...{
    [K in keyof T]: IStateful<T[K]>;
}], options?: StateHookOptions): Promise<() => void>;

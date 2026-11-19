type StoreName = "localStorage" | "sessionStorage";
import type { DisposalScope } from "../../core/disposal.core";
export interface StorageSchema<T> {
    version: number;
    validate: (value: unknown) => value is T;
    fallback: () => T;
    /** Destination version -> migration from the preceding version. */
    migrations?: Readonly<Record<number, (value: unknown) => unknown>>;
}
export interface StorageChange {
    key: string | null;
    oldValue: string | null;
    newValue: string | null;
}
export interface StorageWatchOptions {
    signal?: AbortSignal;
    scope?: DisposalScope;
}
export declare class VersionedValue<T> {
    private readonly store;
    private readonly base;
    private readonly schema;
    readonly key: string;
    constructor(store: BrowserStore, base: string, schema: StorageSchema<T>);
    get(): T;
    set(value: T): this;
    remove(): this;
    watch(callback: (change: StorageChange) => void, options?: StorageWatchOptions): import("../..").Cleanup;
    private check;
}
export declare class StoredValue<T = unknown> {
    private readonly storeName;
    readonly key: string;
    private current;
    constructor(storeName: StoreName, key: string, current: T);
    get value(): T;
    set value(value: T);
    set(value: T): this;
    save(): this;
    remove(): this;
    as: {
        str: () => string;
        int: () => number;
        float: () => number;
        bool: () => boolean;
        json: <R = unknown>() => R;
    };
    private storage;
}
export declare class BrowserStore {
    private readonly storeName;
    constructor(storeName: StoreName);
    versioned<T>(key: string, schema: StorageSchema<T>): VersionedValue<T>;
    /** Native storage events from other documents; same-document writes do not notify. */
    watch(key: string, callback: (change: StorageChange) => void, { signal, scope }?: StorageWatchOptions): import("../..").Cleanup;
    get<T = unknown>(key: string, fallback?: T): StoredValue<T | undefined>;
    /** Writes immediately; storage/serialization failures propagate to the caller. */
    set<T>(key: string, value: T): StoredValue<T>;
    remove(key: string): this;
    has(key: string): boolean;
    private storage;
}
export declare const local: BrowserStore;
export declare const session: BrowserStore;
export {};

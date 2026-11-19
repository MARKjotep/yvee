export declare class TScope<T extends Record<PropertyKey, unknown>> {
    private state;
    readonly __: T;
    constructor(initial?: T);
    fn: <R>(fn: (__: T) => R) => (() => R);
}
export declare const Scope: <T extends Record<PropertyKey, unknown>>(obj?: T) => TScope<T>;
export declare class Stored<T extends Record<PropertyKey, unknown>> {
    private readonly state;
    private readonly dev;
    constructor(initial: T, options?: {
        dev?: boolean;
    });
    get __(): T;
    bind(values: Partial<T>): void;
    set<K extends keyof T, P extends keyof T[K]>(key: K, prop: P, value: T[K][P]): void;
    fn<R>(fn: (state: T) => R): () => R;
    safe<K extends keyof T>(key: K): NonNullable<T[K]>;
}

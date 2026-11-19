export type V = string | number | boolean;
export type maybePromise<T> = T | Promise<T>;
export declare const isBoolean: (value: unknown) => value is boolean;
export declare const isArray: <T = unknown>(value: unknown) => value is T[];
export declare const isFunction: (value: unknown) => value is (...args: any[]) => any;
export declare const isObject: (value: unknown) => value is object;
export declare const isPlainObject: (value: unknown) => value is Record<PropertyKey, unknown>;
export declare class Mapper<K, V> extends Map<K, V> {
    obj(value?: object | null): this;
    init(key: K, value: V): V;
}
export declare const keyInMap: <T>(key: string, map: Mapper<string, any>) => T;
export declare const keyInMapArray: <T>(key: string, map: Mapper<string, any>) => T;
export declare const oItems: <T extends object>(value: T) => Array<[keyof T, T[keyof T]]>;
export declare const ngify: (value: object) => string;
export declare const reCamel: (value: string) => string;
export declare const makeID: (length: number) => string;

export type Equality<T> = (previous: T, next: T) => boolean;
/** Compares own enumerable keys of records/arrays, using Object.is for values. */
export declare function shallowEqual<T>(previous: T, next: T): boolean;

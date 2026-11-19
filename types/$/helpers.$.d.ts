/** Selects one of two values using a boolean condition. */
export declare function Toggled<T>(bool: boolean, value: T): T | undefined;
export declare function Toggled<T, U>(bool: boolean, value: T, otherwise: U): T | U;

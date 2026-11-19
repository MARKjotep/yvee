export type V = string | number | boolean;
export type CSSStyle = Record<string, V | null | undefined | {
    readonly value: unknown;
}>;
export declare const isFunction: (value: unknown) => value is (...args: any[]) => any;
export declare const isNumber: (value: unknown) => value is number;
export declare const oAss: {
    <T extends {}, U>(target: T, source: U): T & U;
    <T extends {}, U, V>(target: T, source1: U, source2: V): T & U & V;
    <T extends {}, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
    (target: object, ...sources: any[]): any;
};
export declare const oItems: <T extends object>(value: T) => Array<[keyof T, T[keyof T]]>;
export declare const reCamel: (value: string) => string;
export declare const isBooleanAttribute: (name: string) => boolean;
export declare const toAttributeValue: (value: unknown) => string;
export declare const isStateValue: (value: unknown) => value is {
    readonly value: unknown;
};

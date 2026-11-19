export type Constructor<T = object> = new (...args: any[]) => T;
export type Transport = "page" | "socket";
export interface RouteEntry<T = unknown> {
    path: string;
    transport: Transport;
    expression: RegExp;
    names: string[];
    controller: Constructor<T>;
}
export interface RouteMatch<T> {
    entry: RouteEntry<T>;
    params: Record<string, string>;
}
export declare function error(status: number): <T extends Constructor<import("../pages/page").Page>>(controller: T) => T;
export declare const errorStatus: (controller: Constructor) => number | undefined;
interface RouteMetadata {
    path: string;
    transport: Transport;
}
export declare const page: (path?: string) => <T extends Constructor>(controller: T) => T;
export declare const route: (path?: string) => <T extends Constructor>(controller: T) => T;
export declare const socketRoute: (path?: string) => <T extends Constructor>(controller: T) => T;
export declare const routeMetadata: (controller: Function) => RouteMetadata[];
export declare class RouteBook<T = unknown> {
    private readonly base;
    private readonly entries;
    constructor(base?: string);
    add(path: string, controller: Constructor<T>, transport?: Transport): {
        controller: Constructor<T>;
        transport: Transport;
        path: string;
        expression: RegExp;
        names: string[];
    };
    find(path: string, transport?: Transport): RouteMatch<T> | undefined;
    all(transport?: Transport): RouteEntry<T>[];
}
export declare const interpolate: (pattern: string, values: Record<string, unknown> | unknown[]) => string;
export {};

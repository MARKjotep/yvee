import { Elem } from "./element/element.$";
export type Elements = HTMLElementTagNameMap[keyof HTMLElementTagNameMap] | SVGElementTagNameMap[keyof SVGElementTagNameMap];
export type TagNames = keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap;
export declare const getElementById: (key: string) => Elements | undefined;
export declare function IDNotConnected(): string[];
interface CLI {
    id?: string;
    class?: string;
}
export declare function $<T extends Elements = HTMLElement, P extends Elements = HTMLElement>(query: CLI, parent?: P): Elem<T> | undefined;
export declare function $<T extends Elements = HTMLElement, P extends Elements = HTMLElement>(query: string, parent?: P): Elem<T> | undefined;
export declare function $<T extends Elements = HTMLElement>(element: T): Elem<T>;
export type _$<T extends Elements = HTMLElement> = Elem<T> | undefined;
export type $_<T extends Elements = HTMLElement> = Elem<T>;
export {};

import type { Elem } from ".";

export type Elements =
  | HTMLElementTagNameMap[keyof HTMLElementTagNameMap]
  | SVGElementTagNameMap[keyof SVGElementTagNameMap];

export type TagNames = keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap;

export type _$<T extends Elements = HTMLElement> = Elem<T> | undefined;
export type $_<T extends Elements = HTMLElement> = Elem<T>;

export type fn<E, T> = (e?: E) => T;

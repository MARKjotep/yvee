import { isStr } from "../@";
import { Elem, TElem } from "./element";

export function $<T extends TElem = HTMLElement>(
  query: string,
): Elem<T> | undefined;
export function $<T extends TElem = HTMLElement>(element: T): Elem<T>;
export function $<T extends TElem = HTMLElement>(element: T | string) {
  if (isStr(element)) {
    const QD = document.querySelector(element);
    if (QD) return new Elem<T>(QD as T, element);
    return undefined;
  } else {
    return new Elem<T>(element);
  }
}

export type _$ = Elem | undefined;

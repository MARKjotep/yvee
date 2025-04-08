import { isStr } from "../@";
import { Stateful } from "../stateful";
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
export type $E<T extends TElem = HTMLElement> = Elem<T>;

export class _useElement<T extends TElem = HTMLElement> {
  state = new Stateful<_$>(undefined);
  constructor() {}
  get element(): T | undefined {
    return this.state.value?.e as T;
  }
  set element(elem: T) {
    this.state.value = new Elem(elem);
  }
  get $() {
    return this.state.value;
  }
}

export const useRef = () => {
  return new _useElement();
};

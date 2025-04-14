import { isStr } from "../@";
import { Stateful } from "../stateful";
import { Elements } from "../storage";
import { Elem } from "./element";

export function $<T extends Elements = Elements>(
  query: string,
): Elem<T> | undefined;
export function $<T extends Elements = Elements>(element: T): Elem<T>;
export function $<T extends Elements = Elements>(element: T | string) {
  if (isStr(element)) {
    const QD = document.querySelector(element);
    if (QD) return new Elem<T>(QD as T, element);
    return undefined;
  } else {
    return new Elem<T>(element);
  }
}

export type _$<T extends Elements = Elements> = Elem<T> | undefined;
export type $E<T extends Elements = Elements> = Elem<T>;

export class _useElement<T extends Elements = Elements> {
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

export const useRef = <T extends Elements = Elements>() => {
  return new _useElement<T>();
};

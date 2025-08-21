import { isNotWindow, isPlainObject, isStr, Mapper, oItems } from "../../@";
import { Stateful } from "../../stateful";
import { Elem } from "./element";

export type Elements =
  | HTMLElementTagNameMap[keyof HTMLElementTagNameMap]
  | SVGElementTagNameMap[keyof SVGElementTagNameMap];

const ElementIds: Mapper<string, Elements> = new Mapper();

export const getElementById = (key: string): Elements | undefined => {
  if (isNotWindow) return;

  const cached = ElementIds.get(key);

  if (cached?.isConnected) return cached;

  ElementIds.delete(key);

  const element = document.getElementById(key);

  if (!element) return;

  ElementIds.set(key, element);

  return element;
};

export function IDNotConnected(): string[] {
  const ids: string[] = [];
  for (const [id, el] of ElementIds) {
    if (!el.isConnected) {
      ids.push(id);
      ElementIds.delete(id);
    }
  }
  return ids;
}

interface CLI {
  id?: string;
  class?: string;
}

export function $<
  T extends Elements = HTMLElement,
  P extends Elements = HTMLElement,
>(query: CLI, parent?: P): Elem<T> | undefined;
export function $<
  T extends Elements = HTMLElement,
  P extends Elements = HTMLElement,
>(query: string, parent?: P): Elem<T> | undefined;
export function $<T extends Elements = HTMLElement>(element: T): Elem<T>;
export function $<
  T extends Elements = HTMLElement,
  P extends Elements = HTMLElement,
>(element: T | string | CLI, parent?: P) {
  const doc = parent ? parent : document;
  if (isStr(element)) {
    const QD = doc.querySelector(element);
    if (QD) return new Elem<T>(QD as T, element);
    return undefined;
  } else if (isPlainObject(element)) {
    //
    const [[k, v]] = oItems(element as CLI);
    let prefix = k === "id" ? "#" : ".";
    let el = `${prefix}${v}`;
    const QD = doc.querySelector(el);
    if (QD) return new Elem<T>(QD as T, el);
    return undefined;
  } else {
    return new Elem<T>(element as T);
  }
}
export type _$<T extends Elements = HTMLElement> = Elem<T> | undefined;
export type $E<T extends Elements = HTMLElement> = Elem<T>;

/*
-------------------------

-------------------------
*/
export class Ref<T extends Elements = HTMLElement> {
  state = new Stateful<_$<T>>(undefined);
  constructor() {}
  get element(): T | undefined {
    return this.state.value?.e as T;
  }
  set element(elem: T | undefined) {
    if (elem) {
      this.state.value = new Elem<T>(elem);
    } else {
      this.state.value = undefined;
    }
  }
  get $() {
    return this.state.value;
  }
}

export const useRef = <T extends Elements = HTMLElement>() => {
  return new Ref<T>();
};

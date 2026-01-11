import { Stateful } from "@@/stateful";
import { Elem } from "./element";
import {
  IS_NOT_BROWSER,
  isPlainObject,
  isString,
  Mapper,
  oItems,
} from "@coff-r/x";

export type Elements =
  | HTMLElementTagNameMap[keyof HTMLElementTagNameMap]
  | SVGElementTagNameMap[keyof SVGElementTagNameMap];

export type TagNames = keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap;

const ElementIds: Mapper<string, Elements> = new Mapper();

export const getElementById = (key: string): Elements | undefined => {
  if (IS_NOT_BROWSER) return;

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
>(arg: T | string | CLI, parent?: P) {
  if (IS_NOT_BROWSER) return undefined;

  const doc: ParentNode = (parent ?? document) as unknown as ParentNode;

  const fromQuery = (selector: string): Elem<T> | undefined => {
    const found = doc.querySelector(selector);
    return found ? new Elem<T>(found as T, selector) : undefined;
  };

  if (isString(arg)) {
    return fromQuery(arg);
  }

  if (isPlainObject(arg)) {
    const [key, value] = oItems<CLI>(arg)[0]!;

    const prefix = key === "id" ? "#" : ".";
    return fromQuery(`${prefix}${value}`);
  }

  return new Elem<T>(arg as T);
}
export type _$<T extends Elements = HTMLElement> = Elem<T> | undefined;
export type $_<T extends Elements = HTMLElement> = Elem<T>;

/*
-------------------------

-------------------------
*/
export class Ref<T extends Elements = HTMLElement> {
  state = new Stateful<_$<T>>(undefined);
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

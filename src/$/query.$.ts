import { Elem } from "./element/element.$";

export type Elements =
  | HTMLElementTagNameMap[keyof HTMLElementTagNameMap]
  | SVGElementTagNameMap[keyof SVGElementTagNameMap];

export type TagNames = keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap;

const ElementIds = new Map<string, Elements>();

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

export const getElementById = (key: string): Elements | undefined => {
  if (typeof document === "undefined") return;
  const cached = ElementIds.get(key);
  if (cached?.isConnected && cached.id === key) return cached;
  ElementIds.delete(key);
  const element = document.getElementById(key);
  if (!element) return;
  ElementIds.set(key, element);
  return element;
};

export function IDNotConnected(): string[] {
  const ids: string[] = [];
  for (const [id, element] of ElementIds) {
    if (!element.isConnected || element.id !== id) {
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

export function $<T extends Elements = HTMLElement, P extends Elements = HTMLElement>(
  query: CLI,
  parent?: P,
): Elem<T> | undefined;
export function $<T extends Elements = HTMLElement, P extends Elements = HTMLElement>(
  query: string,
  parent?: P,
): Elem<T> | undefined;
export function $<T extends Elements = HTMLElement>(element: T): Elem<T>;
export function $<T extends Elements = HTMLElement, P extends Elements = HTMLElement>(
  arg: T | string | CLI,
  parent?: P,
) {
  if (typeof arg !== "string" && !isPlainObject(arg)) {
    return new Elem<T>(arg as T);
  }
  if (typeof document === "undefined") return undefined;

  const doc: ParentNode = (parent ?? document) as unknown as ParentNode;
  const fromQuery = (selector: string): Elem<T> | undefined => {
    const found = doc.querySelector(selector);
    return found ? new Elem<T>(found as T, selector) : undefined;
  };

  if (typeof arg === "string") return fromQuery(arg);
  if (isPlainObject(arg)) {
    const query = arg as CLI;
    const selectors: string[] = [];
    if (query.id) selectors.push(`#${CSS.escape(query.id)}`);
    if (query.class) {
      const classes = query.class
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((name) => `.${CSS.escape(name)}`);
      selectors.push(...classes);
    }
    if (!selectors.length) return undefined;
    const selector = selectors.join("");
    return fromQuery(selector);
  }
  return undefined;
}

export type _$<T extends Elements = HTMLElement> = Elem<T> | undefined;
export type $_<T extends Elements = HTMLElement> = Elem<T>;

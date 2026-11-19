import { isFunction, oAss } from "../support.$";
import type { Elements } from "../query.$";
import type { kf, KFType } from "./anim.element.$";
import { Eget } from "./getset.element.$";

type fn<E, T> = (e?: E) => T;
type ElementEventName =
  | keyof GlobalEventHandlersEventMap
  | "state"
  | "states"
  | "ready"
  | "beforeunload"
  | "popstate"
  | "DOMContentLoaded"
  | "winscroll"
  | "winload"
  | "winfocus"
  | "winblur"
  | "winkeydown"
  | "winkeypress"
  | "winkeyup";

export class Elem<T extends Elements = HTMLElement> extends Eget<T> {
  add(...className: string[]) {
    const names = className
      .flatMap((name) => name.trim().split(/\s+/))
      .filter(Boolean);
    if (names.length) this.e.classList.add(...names);
    return () => {
      if (names.length) this.e.classList.remove(...names);
    };
  }
  remove(...className: string[]) {
    const names = className
      .flatMap((name) => name.trim().split(/\s+/))
      .filter(Boolean);
    if (names.length) this.e.classList.remove(...names);
    return this;
  }
  toggle(className: string | fn<any, string>, force?: boolean) {
    let lt: string =
      typeof className != "string" ? className.apply(this) : className;
    return this.e.classList.toggle(lt, force);
  }
  /**
   * Boolean toggle
   * @param className
   * @param force
   * @returns
   */
  toggled(bool: boolean, className: string) {
    if (bool) {
      this.add(className);
    } else {
      this.remove(className);
    }
    return this;
  }
  clear() {
    this.e.classList.remove(...Array.from(this.e.classList));
    return this;
  }
  hasNode(e: Node) {
    return this.e.contains(e);
  }
  has(...classes: string[]) {
    const classList = this.e.classList;

    return classes.every((t) => classList.contains(t));
  }
  insert(position: InsertPosition) {
    return {
      /** Trusted application-authored HTML only. Use text or rendered content for data. */
      HTML: (...text: string[]): Elem<T> => {
        text.forEach((tt) => {
          this.e.insertAdjacentHTML(position, tt);
        });
        return this;
      },
      element: (...elem: Element[]): Elem<T> => {
        elem.forEach((tt) => {
          this.e.insertAdjacentElement(position, tt);
        });
        return this;
      },
      text: (...text: string[]): Elem<T> => {
        text.forEach((tt) => {
          this.e.insertAdjacentText(position, tt);
        });
        return this;
      },
    };
  }
  is(tp: { dom?: string; class?: string | string[] }): boolean {
    const classList = this.e.classList;
    const dom_name = this.e.tagName.toLocaleLowerCase();
    const matchesTag = !tp.dom || tp.dom.toLowerCase() === dom_name;
    const classes = Array.isArray(tp.class)
      ? tp.class
      : tp.class
        ? [tp.class]
        : [];
    return matchesTag && classes.every((name) => classList.contains(name));
  }
  on(
    event: ElementEventName,
    handler: (e?: any) => void,
    useCapture: boolean = false,
  ) {
    let passive = false;
    if (event.indexOf("touch") > -1) {
      passive = true;
    }
    this.e.addEventListener(event, handler, {
      capture: useCapture,
      passive: passive,
    });
    return this;
  }
  remove_on(
    event: keyof DocumentEventMap,
    handler: EventListenerOrEventListenerObject,
    useCapture: boolean = false,
  ) {
    this.e.removeEventListener(event, handler, useCapture);
    return this;
  }
  timed(fn: (ee?: Elem<T>) => void, timeout = 250) {
    setTimeout(() => fn(this), timeout);
    return this;
  }
  animate(keyframes: KFType, options?: kf, onComplete?: fn<any, void>): this;
  animate(keyframes: KFType, onComplete?: fn<any, void>): this;
  animate(
    keyframes: KFType,
    optionsOrOnComplete?: kf | fn<any, void>,
    onComplete?: fn<any, void>,
  ) {
    const opt: kf = {
      duration: 300,
      easing: "ease",
      fill: "forwards",
    };

    if (isFunction(optionsOrOnComplete)) {
      onComplete = optionsOrOnComplete;
    } else {
      oAss(opt, optionsOrOnComplete);
    }
    const anim = this.e.animate(keyframes as Keyframe[], opt);

    if (onComplete) {
      anim.finished.then(onComplete);
    }
    return this;
  }
  query(query: string) {
    return this.e.querySelector<T>(query);
  }
  queryAll(query: string) {
    const QD = this.e.querySelectorAll<T>(query);
    if (QD.length) {
      return Array.from(QD).map((a) => a as T);
    }
    return [];
  }
  newChild<P>(
    element: keyof HTMLElementTagNameMap,
    props: Record<string, P> = {},
  ) {
    const dc = document.createElement(element);
    this.e.appendChild(dc);
    Object.assign(dc, props);
    return new Elem(dc);
  }
  newChildNS<P>(
    element: keyof SVGElementTagNameMap,
    props: Record<string, P> = {},
  ) {
    const dc = document.createElementNS("http://www.w3.org/2000/svg", element);
    this.e.appendChild(dc);
    Object.assign(dc, props);
    return new Elem(dc);
  }
  get<K extends keyof T>(property: K): T[K];
  get(property: string): unknown;
  get(property: string): unknown {
    return (this.e as unknown as Record<string, unknown>)[property];
  }
}

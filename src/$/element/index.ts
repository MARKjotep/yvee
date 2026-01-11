import { isFunction, oAss } from "@coff-r/x";
import type { $, Elements, TagNames } from "..";
import type { kf, KFType } from "./anim";
import { Eget } from "./getset";

// export type TElem = HTMLElement & InstanceType<typeof Element>;
type fn<E, T> = (e?: E) => T;

export class Elem<T extends Elements = HTMLElement> extends Eget<T> {
  add(...className: string[]) {
    this.e.classList.add(...className.map((cn) => cn.replace(/[^\w-]/, "")));
    return () => {
      this.e.classList.remove(
        ...className.map((cn) => cn.replace(/[^\w-]/, "")),
      );
    };
  }
  remove(...className: string[]) {
    this.e.classList.remove(...className.map((cn) => cn.replace(/[^\w-]/, "")));
    return this;
  }
  // edit
  toggle(className: string | fn<any, string>, force?: boolean) {
    let lt: string =
      typeof className != "string" ? className.apply(this) : className;
    return this.e.classList.toggle(lt, force);
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
      HTML: (...text: string[]): Elem<T> => {
        text.forEach((tt) => {
          this.e.insertAdjacentHTML(position, tt);
        });
        return this;
      },
      element: (...elem: HTMLElement[]): Elem<T> => {
        elem.forEach((tt) => {
          this.e.insertAdjacentElement(position, tt as any);
        });
        return this;
      },
      text: function (this: Elem<T>, ...text: string[]): Elem<T> {
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
    let yes: boolean = true;
    let isdom = true;

    if (tp.dom) {
      isdom = tp.dom == dom_name ? true : false;
    }

    if (tp.class) {
      if (Array.isArray(tp.class)) {
        tp.class.forEach((t) => {
          yes = yes ? classList.contains(t) : false;
        });
      } else {
        yes = yes ? classList.contains(tp.class) : false;
      }
    }
    return yes && isdom;
  }
  on(
    event: keyof events,
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
  newChild<P>(element: TagNames, props: Record<string, P> = {}) {
    const dc = document.createElement(element);
    this.e.appendChild(dc);
    Object.assign(dc, structuredClone(props));
    return new Elem(dc);
  }
  newChildNS<P>(element: TagNames, props: Record<string, P> = {}) {
    const dc = document.createElementNS("http://www.w3.org/2000/svg", element);
    this.e.appendChild(dc);
    Object.assign(dc, structuredClone(props));
    return new Elem(dc);
  }
  get(property: string): any {
    return (this.e as any)[property];
  }
}

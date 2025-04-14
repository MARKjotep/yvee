import { isFN, oAss } from "../../@";
import { Elements } from "../../storage";
import { kf, KFType } from "./anim";
import { Eget } from "./getset";

// export type TElem = HTMLElement & InstanceType<typeof Element>;
type fn<E, T> = (e?: E) => T;

export class Elem<T extends Elements = Elements> extends Eget<T> {
  constructor(e: T, query?: string) {
    super(e, query);
  }
  add(...className: string[]) {
    this.e.classList.add(...className.map((cn) => cn.replace(/[^\w-]/, "")));

    return this;
  }
  remove(...className: string[]) {
    this.e.classList.remove(...className.map((cn) => cn.replace(/[^\w-]/, "")));
    return this;
  }
  // edit
  toggle(className: string | fn<any, string>, force?: boolean) {
    let lt: string =
      typeof className != "string" ? className.apply(this) : className;
    const TC = this.e.classList;
    lt.split(" ").forEach((tg) => {
      TC.toggle(tg, force);
    });
    return this;
  }
  has(e: any | null) {
    return this.e.contains(e);
  }
  insert(position: InsertPosition) {
    return {
      HTML: (...text: string[]): Elem => {
        text.forEach((tt) => {
          this.e.insertAdjacentHTML(position, tt);
        });
        return this;
      },
      element: (...elem: HTMLElement[]): Elem => {
        elem.forEach((tt) => {
          this.e.insertAdjacentElement(position, tt as any);
        });
        return this;
      },
      text: function (this: Elem, ...text: string[]): Elem {
        text.forEach((tt) => {
          this.e.insertAdjacentText(position, tt);
        });
        return this;
      },
    };
  }
  is(tp: { dom?: string; class?: string | string[] }): boolean {
    const clist = this.e.classList.value.split(" ");
    const dom_name = this.e.tagName.toLocaleLowerCase();
    let yes: boolean = true;
    let isdom = true;

    if (tp.dom) {
      isdom = tp.dom == dom_name ? true : false;
    }

    if (tp.class) {
      if (Array.isArray(tp.class)) {
        tp.class.forEach((t) => {
          yes = yes ? clist.includes(t) : false;
        });
      } else {
        yes = yes ? clist.includes(tp.class) : false;
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
  timed(fn: (ee?: Elem) => void, timeout = 250) {
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

    if (isFN(optionsOrOnComplete)) {
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
}

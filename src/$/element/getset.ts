import { Elem } from ".";
import { $ } from "..";
import { idm, isFN, isNum, obj, oItems, V } from "../../@";
import { attr_value, CSSinT } from "../../dom";
import { Dom } from "../../dom";
import { processCTXStateful } from "../../dom/context";
import { CATT, OZ, Wizard } from "../../oz";
import { Elements } from "../../storage";
import { anim } from "./anim";

export class Eget<T extends Elements = Elements> {
  constructor(
    public e: T,
    public query?: string,
  ) {}
  get a() {
    return new anim(this as any);
  }
  get all() {
    if (this.query) {
      const QD = document.querySelectorAll(this.query);
      if (QD.length) {
        return Array.from(QD).map((a) => a as T);
      }
    }
    return [];
  }
  get attr() {
    const lat = this.e;
    return {
      has: (attr: string): boolean => {
        return lat.hasAttribute(attr);
      },
      get: (attr: string): string | null => {
        return lat.getAttribute(attr);
      },
      del: (attr: string): Eget => {
        lat.removeAttribute(attr);

        return this;
      },
      set: (attrs: obj<any>): Eget => {
        for (const ats in attrs) {
          let aat = attrs[ats];
          if (attrs[ats] !== undefined) {
            lat.setAttribute(ats, attr_value(aat));
          }
        }
        return this;
      },
    };
  }
  get children() {
    return Array.from(this.e.children).map((a) => $(a as T));
  }
  get click() {
    (this.e as HTMLElement).click();
    return this;
  }
  get delete() {
    this.e.remove();
    return this;
  }
  get disabled() {
    let tval = this.e as any;
    return tval.disabled ?? false;
  }
  get focus() {
    this.e.focus();
    return this;
  }
  get href() {
    return (this.e as unknown as HTMLAnchorElement)?.href ?? "";
  }
  get id() {
    return this.e.id;
  }
  get inner(): string {
    return this.e.innerHTML;
  }
  get offsetParent(): Elem | undefined {
    let prtn = (this.e as HTMLElement).offsetParent;
    if (prtn) {
      return new Elem(prtn as HTMLElement);
    }
    return undefined;
  }
  get parent(): Elem | undefined {
    let prtn = this.e.parentElement;
    if (prtn) {
      return new Elem(prtn);
    }
    return undefined;
  }
  get hash() {
    return (this.e as unknown as HTMLAnchorElement)?.hash ?? "";
  }
  get path() {
    return (this.e as unknown as HTMLAnchorElement)?.pathname ?? "";
  }
  get rect() {
    return this.e.getBoundingClientRect();
  }
  get remove_element() {
    this.e.remove();
    return this;
  }
  get style() {
    const CC = this.e.style;
    const TT = this as unknown as Elem;
    return {
      set: (
        style: CSSinT | obj<V | null>,
        delayOrFN: number | ((e?: any) => void) = 0,
      ) => {
        const TES: obj<any> = CC;
        const styler = () => {
          oItems(style).forEach(([st, vs]) => {
            if (st in TES) {
              if (TES[st] !== vs) {
                TES[st] = vs;
              }
            } else {
              if (vs !== null) {
                CC.setProperty(st, String(vs));
              }
            }
          });
        };

        if (isFN(delayOrFN)) {
          TT.on("transitionend", delayOrFN);
        }

        if (isNum(delayOrFN)) {
          setTimeout(styler, delayOrFN);
        } else {
          styler();
        }

        return TT;
      },
      get: (prop: keyof CSSStyleDeclaration | string) => {
        return CC.getPropertyValue(prop.toString());
      },
      del: (...props: (keyof CSSStyleDeclaration | string)[]) => {
        props.forEach((pr) => {
          CC.removeProperty(pr.toString());
        });
      },
    };
  }
  get submit() {
    let tval = this.e as any;
    if ("submit" in tval) {
      return tval.submit();
    }
    return false;
  }
  get tag() {
    return this.e.tagName.toLowerCase();
  }
  get value() {
    let tval = this.e as any;
    return tval.value ?? "";
  }

  get unload() {
    return () => {
      this.e.remove();
    };
  }

  // SETTERS

  // edit
  set append(val: any) {
    const { ctx, oz } = pushDOM(val, dID(this.id));
    this.e.insertAdjacentHTML("beforeend", ctx);
    Wizard.RPS(oz);
  }
  // edit
  set appendfirst(val: any) {
    const { ctx, oz } = pushDOM(val, dID(this.id));
    this.e.insertAdjacentHTML("afterbegin", ctx);
    Wizard.RPS(oz);
  }
  set inner(val: any) {
    // get the parent first
    const { ctx, oz } = pushDOM(val, dID(this.id));
    this.e.innerHTML = ctx;
    Wizard.RPS(oz);
  }
  set disabled(vl: boolean) {
    let tval = this.e;
    if ("disabled" in tval) {
      tval.disabled = vl;
    }
  }

  set id(did: string) {
    this.e.id = did;
  }
  set value(vl: any) {
    let tval = this.e as any;
    tval.value = vl;
  }
}

const pushDOM = (
  val: Dom | string,
  pid?: string,
): { ctx: string; oz: OZ | undefined } => {
  const { ctx, catt } = processCTXStateful(val, pid);
  return { ctx, oz: catt.OZ };
};

const dID = (id?: string): string | undefined => (id ? `${id}-0` : id);
